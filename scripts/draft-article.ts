import { supabaseAdmin } from '../lib/supabase'
import { generate, delay } from '../lib/openrouter'
import { ARTICLE_BODY_PROMPT, ARTICLE_DRAFT_PROMPT } from '../lib/prompts'
import type { DeskId, ArticleDraft, ConfidenceGrade, ArticleType, Claim } from '../lib/types'

const DESK_IDS: DeskId[] = ['supplements', 'races', 'strength']

function parseArticleDraft(raw: string): ArticleDraft | null {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (parsed.headline && parsed.nut_graf && parsed.body_markdown) {
      return parsed as ArticleDraft
    }
    return null
  } catch {
    return null
  }
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .split(/\n\n+/)
    .map((block) => {
      if (block.startsWith('<h') || block.startsWith('<ul') || block.startsWith('<ol')) return block
      return `<p>${block.trim()}</p>`
    })
    .join('\n')
}

function generateSlug(headline: string): string {
  return headline
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    + '-' + Date.now()
}

function determineArticleType(claims: Claim[], headline: string): ArticleType {
  const text = (headline + ' ' + claims.map((c) => c.claim_text).join(' ')).toLowerCase()
  if (/recall|announcement|fda|ban|official|news/.test(text)) return 'news_brief'
  if (/race|marathon|triathlon|registration|event|5k|10k/.test(text)) return 'event_intelligence'
  if (/how to|plan|protocol|program|routine|guide/.test(text)) return 'practical_guide'
  return 'evidence_explainer'
}

function determineConfidenceGrade(claims: Claim[]): ConfidenceGrade {
  const hasTier1 = claims.some((c) => c.has_tier1_source)
  const hasCorroboration = claims.some((c) => c.has_corroboration)
  const hasConflict = claims.some((c) => c.has_conflict)

  if (hasConflict) return 'hold'
  if (hasTier1 && hasCorroboration) return 'A'
  if (hasTier1) return 'B'
  if (hasCorroboration) return 'C'
  // Default to C (developing) rather than D — D is reserved for social-only content
  // with no real claims. If we extracted claims, the source is at least a news article.
  return claims.length > 0 ? 'C' : 'D'
}

export async function runDraftArticle(): Promise<void> {
  console.log('[draft-article] Starting article drafting...')

  for (const deskId of DESK_IDS) {
    // Find placeholder articles (not yet properly drafted) with claims
    const { data: articles, error: artError } = await supabaseAdmin
      .from('articles')
      .select('id, headline, slug, desk_id')
      .eq('desk_id', deskId)
      .eq('published', false)
      .like('slug', 'placeholder-%')
      .limit(3)

    if (artError) {
      console.error(`[draft-article] ${deskId}: DB error:`, artError.message)
      continue
    }

    if (!articles || articles.length === 0) {
      console.log(`[draft-article] ${deskId}: no placeholder articles found`)
      continue
    }

    for (const article of articles) {
      // Fetch associated claims with sources
      const { data: claims, error: claimsError } = await supabaseAdmin
        .from('claims')
        .select('*, claim_sources(*, source:sources(*))')
        .eq('article_id', article.id)
        .order('claim_order')

      if (claimsError || !claims || claims.length === 0) {
        console.log(`[draft-article] Article ${article.id.slice(0, 8)}: no claims, skipping`)
        continue
      }

      const grade = determineConfidenceGrade(claims as Claim[])

      // Don't draft grade D articles
      if (grade === 'D') {
        console.log(`[draft-article] Article ${article.id.slice(0, 8)}: grade D, skipping`)
        continue
      }

      const claimsSummary = (claims as Claim[])
        .map((c, i) => {
          const sources = (c as Claim & { claim_sources: Array<{ source?: { url: string; title: string; tier: number } }> }).claim_sources
            ?.map((cs) => cs.source ? `[${cs.source.title}](${cs.source.url}) (Tier ${cs.source.tier})` : '')
            .filter(Boolean)
            .join(', ')
          return `${i + 1}. ${c.claim_text} ${sources ? `— Sources: ${sources}` : ''}`
        })
        .join('\n')

      const userPrompt = `DESK: ${deskId}\nCONFIDENCE GRADE TARGET: ${grade}\n\nVERIFIED CLAIMS:\n${claimsSummary}`

      let draft: ArticleDraft | null = null
      try {
        // Step 1: generate the article body as plain markdown (avoids JSON escaping issues)
        const bodyMarkdown = await generate('drafting', ARTICLE_BODY_PROMPT, userPrompt, 6000)

        await delay(2000)

        // Step 2: generate metadata JSON separately, passing the body as context
        const metaPrompt = `CLAIMS AND SOURCES:\n${userPrompt}\n\nARTICLE BODY (already written):\n${bodyMarkdown.slice(0, 1000)}`
        const rawMeta = await generate('drafting', ARTICLE_DRAFT_PROMPT, metaPrompt, 1024)

        const cleaned = rawMeta.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        try {
          const parsed = JSON.parse(cleaned)
          if (parsed.headline && parsed.nut_graf) {
            draft = { ...parsed, body_markdown: bodyMarkdown } as ArticleDraft
          }
        } catch {
          // If metadata JSON fails, build minimal draft from body
          const firstLine = bodyMarkdown.split('\n').find(l => l.trim() && !l.startsWith('#')) ?? ''
          draft = {
            headline: article.headline,
            subheadline: '',
            nut_graf: firstLine.slice(0, 300),
            body_markdown: bodyMarkdown,
            practical_takeaway: '',
            what_we_dont_know: '',
            source_notes: '',
            why_this_story: '',
            article_type: determineArticleType(claims as Claim[], article.headline),
            confidence_grade: grade,
            confidence_justification: '',
            meta_description: firstLine.slice(0, 160),
          } as ArticleDraft
        }
      } catch (err) {
        console.warn(`[draft-article] LLM error for article ${article.id.slice(0, 8)}:`, err)
      }

      if (!draft) {
        console.warn(`[draft-article] Could not parse draft for article ${article.id.slice(0, 8)}`)
        await delay(2000)
        continue
      }

      const slug = generateSlug(draft.headline)
      const bodyHtml = markdownToHtml(draft.body_markdown)
      const articleType = determineArticleType(claims as Claim[], draft.headline)

      // Create pipeline_run record
      const { data: runData } = await supabaseAdmin
        .from('pipeline_runs')
        .insert({
          desk_id: deskId,
          status: 'completed',
          topics_found: 1,
          claims_extracted: claims.length,
          article_id: article.id,
          completed_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      // Update the placeholder article with real content
      const { error: updateError } = await supabaseAdmin
        .from('articles')
        .update({
          slug,
          headline: draft.headline,
          subheadline: draft.subheadline ?? null,
          nut_graf: draft.nut_graf,
          body_html: bodyHtml,
          body_markdown: draft.body_markdown,
          practical_takeaway: draft.practical_takeaway ?? null,
          what_we_dont_know: draft.what_we_dont_know ?? null,
          source_notes: draft.source_notes ?? null,
          why_this_story: draft.why_this_story ?? null,
          article_type: articleType,
          confidence_grade: grade,
          confidence_justification: draft.confidence_justification ?? null,
          meta_description: draft.meta_description ?? null,
          pipeline_run_id: runData?.id ?? null,
          published: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', article.id)

      if (updateError) {
        console.error(`[draft-article] Update error for ${article.id.slice(0, 8)}:`, updateError.message)
      } else {
        console.log(`[draft-article] ${deskId}: drafted "${draft.headline.slice(0, 60)}" (grade ${grade})`)
      }

      await delay(2000)
    }
  }

  console.log('[draft-article] Done.')
}

if (process.argv[1]?.endsWith('draft-article.ts')) {
  runDraftArticle().catch(console.error)
}
