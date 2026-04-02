import { supabaseAdmin } from '../lib/supabase'
import { generate, delay } from '../lib/openrouter'
import { SCORING_SYSTEM_PROMPT } from '../lib/prompts'
import type { RawTopic, ScoreBreakdown } from '../lib/types'

function parseScoreResponse(raw: string): ScoreBreakdown | null {
  try {
    // Strip markdown fences if present
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    const { freshness, source_quality, utility, evidence_depth } = parsed
    if (
      typeof freshness === 'number' &&
      typeof source_quality === 'number' &&
      typeof utility === 'number' &&
      typeof evidence_depth === 'number'
    ) {
      return { freshness, source_quality, utility, evidence_depth }
    }
    return null
  } catch {
    return null
  }
}

export async function runScoreTopics(): Promise<void> {
  console.log('[score-topics] Fetching unprocessed topics...')

  // Only score the top candidates per desk that extract-claims will actually use
  // (3 per desk × 3 desks = 9 max), ordered by created_at as a proxy for freshness
  const { data: topics, error } = await supabaseAdmin
    .from('raw_topics')
    .select('*')
    .eq('processed', false)
    .limit(9)

  if (error) throw new Error(`[score-topics] DB error: ${error.message}`)
  if (!topics || topics.length === 0) {
    console.log('[score-topics] No unprocessed topics found.')
    return
  }

  console.log(`[score-topics] Scoring ${topics.length} topics...`)

  for (const topic of topics as RawTopic[]) {
    const userPrompt = `Title: ${topic.title}\nSnippet: ${topic.snippet ?? '(none)'}\nSource: ${topic.url}`

    let breakdown: ScoreBreakdown | null = null
    try {
      const raw = await generate('scoring', SCORING_SYSTEM_PROMPT, userPrompt, 512)
      breakdown = parseScoreResponse(raw)

      if (!breakdown) {
        // Retry with explicit JSON instruction
        const raw2 = await generate(
          'scoring',
          SCORING_SYSTEM_PROMPT + '\n\nCRITICAL: respond with ONLY the JSON object, nothing else.',
          userPrompt,
          512,
        )
        breakdown = parseScoreResponse(raw2)
      }
    } catch (err) {
      console.warn(`[score-topics] LLM error for topic ${topic.id}:`, err)
    }

    if (!breakdown) {
      console.warn(`[score-topics] Could not parse score for topic ${topic.id}, skipping.`)
      await delay(8000)
      continue
    }

    const score = breakdown.freshness + breakdown.source_quality + breakdown.utility + breakdown.evidence_depth

    const { error: updateError } = await supabaseAdmin
      .from('raw_topics')
      .update({ score, score_breakdown: breakdown })
      .eq('id', topic.id)

    if (updateError) {
      console.error(`[score-topics] Update error for topic ${topic.id}:`, updateError.message)
    } else {
      console.log(`[score-topics] Scored "${topic.title.slice(0, 60)}" → ${score}/100`)
    }

    await delay(8000)
  }

  console.log('[score-topics] Done.')
}

if (process.argv[1]?.endsWith('score-topics.ts')) {
  runScoreTopics().catch(console.error)
}
