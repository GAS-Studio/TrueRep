import { supabaseAdmin } from '../lib/supabase'
import { generate, delay } from '../lib/openrouter'
import { FACT_CHECK_PROMPT } from '../lib/prompts'
import type { Article, Claim, FactCheckResult } from '../lib/types'

function parseFactCheckResponse(raw: string): FactCheckResult | null {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (typeof parsed.passed === 'boolean') {
      // Support both flat string[] and structured {type,description,severity}[] issues
      const issues: string[] = (parsed.issues ?? []).map((i: unknown) =>
        typeof i === 'string' ? i : (i as { description?: string }).description ?? JSON.stringify(i)
      )
      return {
        passed: parsed.passed,
        issues,
        overstatement_flags: parsed.overstatement_flags ?? [],
        uncited_sentences: parsed.uncited_sentences ?? [],
      }
    }
    return null
  } catch {
    return null
  }
}

export async function runFactCheck(): Promise<void> {
  console.log('[fact-check] Finding unverified articles...')

  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('*')
    .is('last_verified_at', null)
    .eq('published', false)
    .not('slug', 'like', 'placeholder-%')

  if (error) throw new Error(`[fact-check] DB error: ${error.message}`)
  if (!articles || articles.length === 0) {
    console.log('[fact-check] No unverified articles found.')
    return
  }

  console.log(`[fact-check] Fact-checking ${articles.length} articles...`)

  for (const article of articles as Article[]) {
    // Fetch claims
    const { data: claims } = await supabaseAdmin
      .from('claims')
      .select('*')
      .eq('article_id', article.id)
      .order('claim_order')

    const claimsList = (claims ?? []) as Claim[]
    const claimsSummary = claimsList
      .map((c, i) => `${i + 1}. [${c.id}] ${c.claim_text}`)
      .join('\n')

    const userPrompt = `ARTICLE HEADLINE: ${article.headline}\n\nARTICLE BODY:\n${article.body_markdown ?? article.body_html}\n\nCLAIMS TO CHECK:\n${claimsSummary}`

    let result: FactCheckResult | null = null
    try {
      const raw = await generate('drafting', FACT_CHECK_PROMPT, userPrompt, 1024)
      result = parseFactCheckResponse(raw)

      if (!result) {
        const raw2 = await generate(
          'drafting',
          FACT_CHECK_PROMPT + '\n\nCRITICAL: respond ONLY with valid JSON, no markdown fences.',
          userPrompt,
          1024,
        )
        result = parseFactCheckResponse(raw2)
      }
    } catch (err) {
      console.warn(`[fact-check] LLM error for article ${article.id.slice(0, 8)}:`, err)
    }

    const now = new Date().toISOString()

    if (!result) {
      // If we can't fact-check, still mark as verified but don't publish
      await supabaseAdmin
        .from('articles')
        .update({ last_verified_at: now, verification_count: (article.verification_count ?? 0) + 1 })
        .eq('id', article.id)
      console.warn(`[fact-check] Could not parse result for ${article.id.slice(0, 8)}, skipping publish.`)
      await delay(8000)
      continue
    }

    // Update claims with flags
    if (result.overstatement_flags.length > 0 && claimsList.length > 0) {
      for (const flag of result.overstatement_flags) {
        // flag may be a claim_id or claim text — try matching by ID first
        const matchById = claimsList.find((c) => c.id === flag)
        const matchByText = claimsList.find((c) => c.claim_text.toLowerCase().includes(flag.toLowerCase().slice(0, 30)))
        const targetClaim = matchById ?? matchByText
        if (targetClaim) {
          await supabaseAdmin.from('claims').update({ overstatement_flag: true }).eq('id', targetClaim.id)
        }
      }
    }

    // Only block publishing on critical issues (guardrail violations).
    // Minor issues (uncited sentences, low-severity flags) are flagged but don't block.
    const guardrailKeywords = ['fda approved', 'fda-approved', 'cure', 'treats ', 'diagnos']
    const hasCriticalIssues = result.issues.some(issue =>
      guardrailKeywords.some(kw => issue.toLowerCase().includes(kw))
    )
    const shouldPublish = !hasCriticalIssues

    const { error: updateError } = await supabaseAdmin
      .from('articles')
      .update({
        last_verified_at: now,
        verification_count: (article.verification_count ?? 0) + 1,
        published: shouldPublish,
        published_at: shouldPublish ? now : null,
      })
      .eq('id', article.id)

    if (updateError) {
      console.error(`[fact-check] Update error for ${article.id.slice(0, 8)}:`, updateError.message)
    } else {
      console.log(
        `[fact-check] "${article.headline.slice(0, 60)}": passed=${result.passed}, published=${shouldPublish}, issues=${result.issues.length}`,
      )
    }

    await delay(8000)
  }

  console.log('[fact-check] Done.')
}

if (process.argv[1]?.endsWith('fact-check.ts')) {
  runFactCheck().catch(console.error)
}
