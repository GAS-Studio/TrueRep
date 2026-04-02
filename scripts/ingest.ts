import Parser from 'rss-parser'
import { supabaseAdmin } from '../lib/supabase'
import type { DeskId } from '../lib/types'

const parser = new Parser()

interface DeskConfig {
  id: DeskId
  googleQuery: string
  pubmedTerm?: string
}

const DESK_CONFIGS: DeskConfig[] = [
  {
    id: 'supplements',
    googleQuery: 'dietary supplements NIH safety 2025',
    pubmedTerm: 'dietary+supplements+safety+efficacy',
  },
  {
    id: 'races',
    googleQuery: 'marathon race 2025 registration',
  },
  {
    id: 'strength',
    googleQuery: 'resistance training exercise science',
    pubmedTerm: 'resistance+training+exercise+science',
  },
]

async function fetchGoogleNewsRSS(query: string): Promise<{ title: string; url: string; snippet: string; published_date: string | null }[]> {
  const encodedQuery = encodeURIComponent(query)
  const feedUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`

  try {
    const feed = await parser.parseURL(feedUrl)
    return (feed.items ?? []).slice(0, 10).map((item) => ({
      title: item.title ?? '',
      url: item.link ?? '',
      snippet: item.contentSnippet ?? item.content ?? '',
      published_date: item.pubDate ? new Date(item.pubDate).toISOString() : null,
    }))
  } catch (err) {
    console.warn(`[ingest] Google News RSS failed for query "${query}":`, err)
    return []
  }
}

interface PubMedSearchResult {
  esearchresult?: { idlist?: string[] }
}

interface PubMedSummaryResult {
  result?: Record<string, {
    uid?: string
    title?: string
    source?: string
    pubdate?: string
    sortfirstauthor?: string
  }>
}

async function fetchPubMedAbstracts(term: string): Promise<{ title: string; url: string; snippet: string; published_date: null }[]> {
  try {
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${term}&retmax=5&sort=relevance&retmode=json`
    const searchRes = await fetch(searchUrl)
    const searchData: PubMedSearchResult = await searchRes.json()
    const pmids: string[] = searchData?.esearchresult?.idlist ?? []

    if (pmids.length === 0) return []

    // esummary returns proper JSON (efetch does not support JSON for abstracts)
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json`
    const summaryRes = await fetch(summaryUrl)
    const summaryData: PubMedSummaryResult = await summaryRes.json()

    return pmids
      .map((pmid) => {
        const entry = summaryData?.result?.[pmid]
        if (!entry) return null
        return {
          title: entry.title ?? '',
          url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
          snippet: `${entry.source ?? ''} — ${entry.sortfirstauthor ?? ''} (${entry.pubdate ?? ''})`.trim(),
          published_date: null,
        }
      })
      .filter((x): x is { title: string; url: string; snippet: string; published_date: null } => x !== null && !!x.title)
  } catch (err) {
    console.warn(`[ingest] PubMed fetch failed for term "${term}":`, err)
    return []
  }
}

export async function runIngest(): Promise<void> {
  console.log('[ingest] Starting ingestion for all desks...')

  for (const desk of DESK_CONFIGS) {
    const topics: { title: string; url: string; snippet: string; published_date: string | null }[] = []

    // Google News RSS
    const googleTopics = await fetchGoogleNewsRSS(desk.googleQuery)
    topics.push(...googleTopics)
    console.log(`[ingest] ${desk.id}: ${googleTopics.length} topics from Google News`)

    // PubMed (supplements + strength only)
    if (desk.pubmedTerm) {
      const pubmedTopics = await fetchPubMedAbstracts(desk.pubmedTerm)
      topics.push(...pubmedTopics)
      console.log(`[ingest] ${desk.id}: ${pubmedTopics.length} topics from PubMed`)
    }

    // Upsert into raw_topics (skip duplicates by url)
    const rows = topics
      .filter((t) => t.title && t.url)
      .map((t) => ({
        desk_id: desk.id,
        title: t.title.slice(0, 500),
        url: t.url,
        feed_source: t.url.includes('pubmed') ? 'pubmed' : 'google_news',
        published_date: t.published_date,
        snippet: t.snippet?.slice(0, 1000) ?? null,
        score: 0,
        score_breakdown: {},
        processed: false,
      }))

    if (rows.length === 0) {
      console.log(`[ingest] ${desk.id}: no valid topics to insert`)
      continue
    }

    const { error } = await supabaseAdmin
      .from('raw_topics')
      .upsert(rows, { onConflict: 'url', ignoreDuplicates: true })

    if (error) {
      console.error(`[ingest] ${desk.id}: upsert error:`, error.message)
    } else {
      console.log(`[ingest] ${desk.id}: upserted ${rows.length} topics`)
    }
  }

  console.log('[ingest] Done.')
}

// Allow direct execution
if (process.argv[1]?.endsWith('ingest.ts')) {
  runIngest().catch(console.error)
}
