import { createClient } from '@supabase/supabase-js'
import type { Article, ArticleWithClaims, PipelineRun, DeskId, ArticleType } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (service role — never expose to browser)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// --- Typed query helpers ---

export async function getArticles(options: {
  desk?: DeskId
  type?: ArticleType
  limit?: number
} = {}): Promise<Article[]> {
  const { desk, type, limit = 20 } = options

  let query = supabase
    .from('articles')
    .select('*, desk:desks(*)')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (desk) query = query.eq('desk_id', desk)
  if (type) query = query.eq('article_type', type)

  const { data, error } = await query
  if (error) throw new Error(`getArticles: ${error.message}`)
  return (data ?? []) as Article[]
}

export async function getArticleBySlug(slug: string): Promise<ArticleWithClaims | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      desk:desks(*),
      claims (
        *,
        claim_sources (
          *,
          source:sources(*)
        )
      )
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw new Error(`getArticleBySlug: ${error.message}`)
  }

  return data as ArticleWithClaims
}

export async function getPipelineRuns(limit = 20): Promise<PipelineRun[]> {
  const { data, error } = await supabase
    .from('pipeline_runs')
    .select(`
      *,
      article:articles(headline, slug, confidence_grade)
    `)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`getPipelineRuns: ${error.message}`)
  return (data ?? []) as PipelineRun[]
}

export async function getStats(): Promise<{
  articleCount: number
  claimCount: number
  sourceCount: number
}> {
  const [articles, claims, sources] = await Promise.all([
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('published', true),
    supabase.from('claims').select('id', { count: 'exact', head: true }),
    supabase.from('sources').select('id', { count: 'exact', head: true }),
  ])

  return {
    articleCount: articles.count ?? 0,
    claimCount: claims.count ?? 0,
    sourceCount: sources.count ?? 0,
  }
}
