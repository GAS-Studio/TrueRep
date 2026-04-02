import Parser from 'rss-parser'
import { supabaseAdmin } from '../lib/supabase'
import { generate, delay } from '../lib/openrouter'
import { CORROBORATION_PROMPT } from '../lib/prompts'
import type { Claim, CorroborationResult } from '../lib/types'

const parser = new Parser()

function parseCorroborationResponse(raw: string): CorroborationResult | null {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (parsed.relationship && parsed.tier && parsed.note) {
      return parsed as CorroborationResult
    }
    return null
  } catch {
    return null
  }
}

function extractKeyTerms(claimText: string): string {
  // Remove common stop words and extract meaningful terms
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'that', 'this', 'these', 'those', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from'])
  const terms = claimText
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(' ')
    .filter((w) => w.length > 3 && !stopWords.has(w))
    .slice(0, 4)
    .join('+')
  return terms
}

async function searchPubMedRSS(claimText: string): Promise<{ title: string; url: string; snippet: string }[]> {
  const terms = extractKeyTerms(claimText)
  if (!terms) return []

  const feedUrl = `https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=${terms}&limit=5`
  try {
    const feed = await parser.parseURL(feedUrl)
    return (feed.items ?? []).slice(0, 5).map((item) => ({
      title: item.title ?? '',
      url: item.link ?? '',
      snippet: item.contentSnippet ?? '',
    }))
  } catch {
    // PubMed RSS can be unreliable; fall back silently
    return []
  }
}

export async function runCorroborate(): Promise<void> {
  console.log('[corroborate] Finding claims needing corroboration...')

  const { data: claims, error } = await supabaseAdmin
    .from('claims')
    .select('*')
    .or('has_tier1_source.eq.false,has_corroboration.eq.false')
    .limit(50)

  if (error) throw new Error(`[corroborate] DB error: ${error.message}`)
  if (!claims || claims.length === 0) {
    console.log('[corroborate] No claims need corroboration.')
    return
  }

  console.log(`[corroborate] Corroborating ${claims.length} claims...`)

  for (const claim of claims as Claim[]) {
    const results = await searchPubMedRSS(claim.claim_text)

    if (results.length === 0) {
      console.log(`[corroborate] No PubMed results for claim ${claim.id.slice(0, 8)}`)
      await delay(8000)
      continue
    }

    let hasTier1 = claim.has_tier1_source
    let hasCorroboration = claim.has_corroboration
    let hasConflict = claim.has_conflict
    let conflictDescription = claim.conflict_description

    for (const result of results.slice(0, 2)) {
      const userPrompt = `CLAIM: ${claim.claim_text}\n\nSOURCE TITLE: ${result.title}\nSOURCE URL: ${result.url}\nSOURCE SNIPPET: ${result.snippet}`

      let corroboration: CorroborationResult | null = null
      try {
        const raw = await generate('reasoning', CORROBORATION_PROMPT, userPrompt, 512)
        corroboration = parseCorroborationResponse(raw)
      } catch (err) {
        console.warn(`[corroborate] LLM error:`, err)
      }

      if (!corroboration) {
        await delay(8000)
        continue
      }

      // Upsert source
      const { data: sourceData } = await supabaseAdmin
        .from('sources')
        .upsert(
          {
            url: result.url,
            title: result.title,
            tier: corroboration.tier,
            tier_justification: corroboration.note,
            source_type: 'pubmed',
            snippet: result.snippet.slice(0, 1000),
          },
          { onConflict: 'url' },
        )
        .select('id')
        .single()

      if (sourceData?.id) {
        // Create claim_source record (ignore duplicate)
        await supabaseAdmin
          .from('claim_sources')
          .upsert(
            {
              claim_id: claim.id,
              source_id: sourceData.id,
              relationship: corroboration.relationship,
              relevance_note: corroboration.note,
            },
            { onConflict: 'claim_id,source_id', ignoreDuplicates: true },
          )
      }

      // Update flags
      if (corroboration.tier === 1) hasTier1 = true
      if (corroboration.relationship === 'supports') hasCorroboration = true
      if (corroboration.relationship === 'contradicts') {
        hasConflict = true
        conflictDescription = corroboration.note
      }

      await delay(8000)
    }

    // Update claim flags
    await supabaseAdmin
      .from('claims')
      .update({
        has_tier1_source: hasTier1,
        has_corroboration: hasCorroboration,
        has_conflict: hasConflict,
        conflict_description: conflictDescription,
      })
      .eq('id', claim.id)

    console.log(
      `[corroborate] Claim ${claim.id.slice(0, 8)}: tier1=${hasTier1}, corroborated=${hasCorroboration}, conflict=${hasConflict}`,
    )
  }

  console.log('[corroborate] Done.')
}

if (process.argv[1]?.endsWith('corroborate.ts')) {
  runCorroborate().catch(console.error)
}
