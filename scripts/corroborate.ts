import { supabaseAdmin } from '../lib/supabase'
import { generate, delay } from '../lib/openrouter'
import { CORROBORATION_PROMPT } from '../lib/prompts'
import { CURATED_SOURCES } from '../lib/sources'
import type { Claim, CorroborationResult, DeskId } from '../lib/types'

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

interface PubMedSearchResult { esearchresult?: { idlist?: string[] } }
interface PubMedSummaryResult {
  result?: Record<string, { uid?: string; title?: string; source?: string; pubdate?: string; sortfirstauthor?: string }>
}

async function searchPubMed(claimText: string): Promise<{ title: string; url: string; snippet: string }[]> {
  const terms = extractKeyTerms(claimText)
  if (!terms) return []

  try {
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${terms}&retmax=5&sort=relevance&retmode=json`
    const searchRes = await fetch(searchUrl)
    const searchData: PubMedSearchResult = await searchRes.json()
    const pmids = searchData?.esearchresult?.idlist ?? []
    if (pmids.length === 0) return []

    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json`
    const summaryRes = await fetch(summaryUrl)
    const summaryData: PubMedSummaryResult = await summaryRes.json()

    return pmids
      .map((pmid) => {
        const entry = summaryData?.result?.[pmid]
        if (!entry?.title) return null
        return {
          title: entry.title,
          url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
          snippet: `${entry.source ?? ''} — ${entry.sortfirstauthor ?? ''} (${entry.pubdate ?? ''})`.trim(),
        }
      })
      .filter((x): x is { title: string; url: string; snippet: string } => x !== null)
  } catch {
    return []
  }
}

async function checkCuratedSources(
  claim: Claim,
  deskId: DeskId,
  hasTier1: boolean,
  hasCorroboration: boolean,
): Promise<{ hasTier1: boolean; hasCorroboration: boolean }> {
  const curated = (CURATED_SOURCES[deskId] ?? []).filter((s) => s.tier <= 2)
  if (curated.length === 0) return { hasTier1, hasCorroboration }

  console.log(`[corroborate] Checking ${curated.length} curated sources for claim ${claim.id.slice(0, 8)}...`)

  for (const source of curated) {
    // Skip if we already have what we need
    if (hasTier1 && hasCorroboration) break

    const userPrompt = `CLAIM: ${claim.claim_text}

SOURCE TITLE: ${source.title}
SOURCE PUBLISHER: ${source.publisher}
SOURCE URL: ${source.url}
SOURCE TYPE: ${source.source_type}

This is a curated authoritative source. Based on the source title and publisher, assess whether this source would address or be relevant to this claim. If the source is clearly in the wrong domain (e.g. a race organizer for a supplement claim), return "provides_context" with low confidence.`

    let corroboration: CorroborationResult | null = null
    try {
      const raw = await generate('drafting', CORROBORATION_PROMPT, userPrompt, 256)
      corroboration = parseCorroborationResponse(raw)
    } catch (err) {
      console.warn(`[corroborate] LLM error on curated source:`, err)
    }

    if (!corroboration || corroboration.relationship === 'contradicts') {
      await delay(8000)
      continue
    }

    // Upsert the curated source
    const { data: sourceData } = await supabaseAdmin
      .from('sources')
      .upsert(
        {
          url: source.url,
          title: source.title,
          publisher: source.publisher,
          tier: source.tier,
          tier_justification: `Curated ${source.source_type} source for ${deskId} desk`,
          source_type: source.source_type,
        },
        { onConflict: 'url' },
      )
      .select('id')
      .single()

    if (sourceData?.id) {
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

      if (source.tier === 1) hasTier1 = true
      if (corroboration.relationship === 'supports') hasCorroboration = true

      console.log(`[corroborate] Linked curated source "${source.publisher}" → ${corroboration.relationship} (tier ${source.tier})`)
    }

    await delay(8000)
  }

  return { hasTier1, hasCorroboration }
}

export async function runCorroborate(): Promise<void> {
  console.log('[corroborate] Finding claims needing corroboration...')

  const { data: claims, error } = await supabaseAdmin
    .from('claims')
    .select('*, article:articles(desk_id)')
    .or('has_tier1_source.eq.false,has_corroboration.eq.false')
    .limit(50)

  if (error) throw new Error(`[corroborate] DB error: ${error.message}`)
  if (!claims || claims.length === 0) {
    console.log('[corroborate] No claims need corroboration.')
    return
  }

  console.log(`[corroborate] Corroborating ${claims.length} claims...`)

  for (const claim of claims as Claim[]) {
    try {
      const results = await searchPubMed(claim.claim_text)

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

      // If still missing tier1 or corroboration, check curated sources for the desk
      const deskId = ((claim as Claim & { article?: { desk_id: DeskId } }).article?.desk_id) ?? null
      if (deskId && (!hasTier1 || !hasCorroboration)) {
        const updated = await checkCuratedSources(claim, deskId, hasTier1, hasCorroboration)
        hasTier1 = updated.hasTier1
        hasCorroboration = updated.hasCorroboration
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
    } catch (err) {
      console.warn(`[corroborate] Skipping claim ${claim.id.slice(0, 8)} after error:`, err)
    }
  }

  console.log('[corroborate] Done.')
}

if (process.argv[1]?.endsWith('corroborate.ts')) {
  runCorroborate().catch(console.error)
}
