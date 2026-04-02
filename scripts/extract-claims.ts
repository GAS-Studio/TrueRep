import { supabaseAdmin } from '../lib/supabase'
import { generate, delay } from '../lib/openrouter'
import { CLAIM_EXTRACTION_PROMPT } from '../lib/prompts'
import type { DeskId, ExtractedClaim, RawTopic } from '../lib/types'

const DESK_IDS: DeskId[] = ['supplements', 'races', 'strength']

function parseClaimsResponse(raw: string): ExtractedClaim[] | null {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (Array.isArray(parsed)) return parsed as ExtractedClaim[]
    return null
  } catch {
    return null
  }
}

export async function runExtractClaims(): Promise<void> {
  console.log('[extract-claims] Starting claim extraction...')

  for (const deskId of DESK_IDS) {
    // Fetch top 3 unprocessed topics by score
    const { data: topics, error } = await supabaseAdmin
      .from('raw_topics')
      .select('*')
      .eq('desk_id', deskId)
      .eq('processed', false)
      .order('score', { ascending: false })
      .limit(3)

    if (error) {
      console.error(`[extract-claims] ${deskId}: DB error:`, error.message)
      continue
    }

    if (!topics || topics.length === 0) {
      console.log(`[extract-claims] ${deskId}: no topics to process`)
      continue
    }

    console.log(`[extract-claims] ${deskId}: processing ${topics.length} topics`)

    for (const topic of topics as RawTopic[]) {
      const userPrompt = `Article Title: ${topic.title}\nURL: ${topic.url}\nSnippet: ${topic.snippet ?? '(no snippet available)'}`

      let claims: ExtractedClaim[] | null = null

      try {
        const raw = await generate('reasoning', CLAIM_EXTRACTION_PROMPT, userPrompt)
        claims = parseClaimsResponse(raw)

        if (!claims) {
          const raw2 = await generate(
            'reasoning',
            CLAIM_EXTRACTION_PROMPT + '\n\nCRITICAL: respond ONLY with the JSON array, no other text.',
            userPrompt,
          )
          claims = parseClaimsResponse(raw2)
        }
      } catch (err) {
        console.warn(`[extract-claims] LLM error for topic ${topic.id}:`, err)
      }

      if (!claims || claims.length === 0) {
        console.warn(`[extract-claims] No claims extracted for topic ${topic.id}`)
        await supabaseAdmin.from('raw_topics').update({ processed: true }).eq('id', topic.id)
        await delay(8000)
        continue
      }

      // Create a placeholder article to associate claims with
      // (will be replaced by a real article in draft-article step)
      const placeholderSlug = `placeholder-${topic.id}`
      const { data: articleData, error: articleError } = await supabaseAdmin
        .from('articles')
        .insert({
          slug: placeholderSlug,
          desk_id: deskId,
          headline: topic.title,
          nut_graf: topic.snippet ?? topic.title,
          body_html: '<p>Pending draft.</p>',
          article_type: 'news_brief',
          confidence_grade: 'C',
          published: false,
        })
        .select('id')
        .single()

      if (articleError || !articleData) {
        console.error(`[extract-claims] Could not create placeholder article:`, articleError?.message)
        await delay(8000)
        continue
      }

      const articleId = articleData.id

      for (let i = 0; i < claims.length; i++) {
        const claim = claims[i]

        // Upsert source if URL provided
        let sourceId: string | null = null
        if (claim.source_url) {
          const { data: sourceData } = await supabaseAdmin
            .from('sources')
            .upsert(
              {
                url: claim.source_url,
                title: `Source for: ${claim.claim_text.slice(0, 100)}`,
                tier: claim.tier_guess ?? 3,
                source_type: 'article',
              },
              { onConflict: 'url' },
            )
            .select('id')
            .single()

          sourceId = sourceData?.id ?? null
        }

        // Insert claim
        const { data: claimData, error: claimError } = await supabaseAdmin
          .from('claims')
          .insert({
            article_id: articleId,
            claim_text: claim.claim_text,
            claim_order: i,
            category: claim.category ?? null,
            confidence: claim.confidence ?? 0,
            has_tier1_source: (claim.tier_guess ?? 3) === 1,
          })
          .select('id')
          .single()

        if (claimError || !claimData) {
          console.error(`[extract-claims] Claim insert error:`, claimError?.message)
          continue
        }

        // Create claim_source record if we have both IDs
        if (sourceId && claimData.id) {
          await supabaseAdmin.from('claim_sources').insert({
            claim_id: claimData.id,
            source_id: sourceId,
            relationship: 'supports',
          })
        }
      }

      // Mark topic as processed
      await supabaseAdmin
        .from('raw_topics')
        .update({ processed: true })
        .eq('id', topic.id)

      console.log(`[extract-claims] ${deskId}: extracted ${claims.length} claims from "${topic.title.slice(0, 60)}"`)
      await delay(8000)
    }
  }

  console.log('[extract-claims] Done.')
}

if (process.argv[1]?.endsWith('extract-claims.ts')) {
  runExtractClaims().catch(console.error)
}
