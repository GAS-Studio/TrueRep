// Core ID/enum types
export type DeskId = 'supplements' | 'races' | 'strength'
export type ArticleType = 'news_brief' | 'evidence_explainer' | 'practical_guide' | 'event_intelligence'
export type ConfidenceGrade = 'A' | 'B' | 'C' | 'D' | 'hold'
export type SourceTier = 1 | 2 | 3
export type SourceRelationship = 'supports' | 'contradicts' | 'provides_context'
export type PipelineStatus = 'started' | 'running' | 'completed' | 'failed'

// Database row types
export interface Desk {
  id: DeskId
  name: string
  description: string
  color: string
  created_at: string
}

export interface Source {
  id: string
  url: string
  title: string
  publisher: string | null
  tier: SourceTier
  tier_justification: string | null
  source_type: string
  fetch_date: string
  snippet: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface RawTopic {
  id: string
  desk_id: DeskId
  title: string
  url: string
  feed_source: string
  published_date: string | null
  snippet: string | null
  score: number
  score_breakdown: Record<string, number>
  processed: boolean
  created_at: string
}

export interface ClaimSource {
  id: string
  claim_id: string
  source_id: string
  relationship: SourceRelationship
  relevance_note: string | null
  source?: Source
}

export interface Claim {
  id: string
  article_id: string
  claim_text: string
  claim_order: number
  category: string | null
  confidence: number
  has_tier1_source: boolean
  has_corroboration: boolean
  has_conflict: boolean
  conflict_description: string | null
  fact_check_passed: boolean | null
  fact_check_notes: string | null
  overstatement_flag: boolean
  uncited_flag: boolean
  created_at: string
  claim_sources?: ClaimSource[]
}

export interface Article {
  id: string
  slug: string
  desk_id: DeskId
  pipeline_run_id: string | null
  headline: string
  subheadline: string | null
  nut_graf: string
  body_html: string
  body_markdown: string | null
  practical_takeaway: string | null
  what_we_dont_know: string | null
  source_notes: string | null
  article_type: ArticleType
  confidence_grade: ConfidenceGrade
  confidence_justification: string | null
  why_this_story: string | null
  topic_score: number
  medical_disclaimer: boolean
  published: boolean
  published_at: string | null
  last_verified_at: string | null
  verification_count: number
  meta_description: string | null
  created_at: string
  updated_at: string
  desk?: Desk
}

export interface ArticleWithClaims extends Article {
  claims: (Claim & {
    claim_sources: (ClaimSource & { source: Source })[]
  })[]
}

export interface PipelineRun {
  id: string
  desk_id: DeskId
  status: PipelineStatus
  topic_query: string | null
  topics_found: number
  claims_extracted: number
  article_id: string | null
  error_message: string | null
  started_at: string
  completed_at: string | null
  metadata: Record<string, unknown>
  article?: {
    headline: string
    slug: string
    confidence_grade: ConfidenceGrade
  } | null
}

// Utility types
export interface ScoreBreakdown {
  freshness: number
  source_quality: number
  utility: number
  evidence_depth: number
}

export interface ExtractedClaim {
  claim_text: string
  category: string
  source_url: string
  tier_guess: SourceTier
  confidence: number
}

export interface CorroborationResult {
  relationship: SourceRelationship
  tier: SourceTier
  note: string
}

export interface FactCheckResult {
  passed: boolean
  issues: string[]
  overstatement_flags: string[]
  uncited_sentences: string[]
}

export interface ArticleDraft {
  headline: string
  subheadline: string
  nut_graf: string
  body_markdown: string
  practical_takeaway: string
  what_we_dont_know: string
  source_notes: string
  why_this_story: string
  article_type: ArticleType
  confidence_grade: ConfidenceGrade
  confidence_justification: string
  meta_description: string
}
