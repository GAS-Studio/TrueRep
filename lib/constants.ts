import type { DeskId, ArticleType, ConfidenceGrade, SourceTier } from './types'

export const DESKS: Record<DeskId, { id: DeskId; name: string; description: string; color: string }> = {
  supplements: { id: 'supplements', name: 'Supplements', description: 'Evidence-backed supplement news and research analysis', color: '#10b981' },
  races: { id: 'races', name: 'Races & Events', description: 'Official race announcements, results, and event intelligence', color: '#f59e0b' },
  strength: { id: 'strength', name: 'Strength Training', description: 'Science-based strength and conditioning news', color: '#ef4444' },
}

export const TIER_META: Record<SourceTier, { label: string; color: string; description: string }> = {
  1: { label: 'Source of Truth', color: 'emerald', description: 'Official agency, peer-reviewed systematic review, recognized medical body' },
  2: { label: 'Strong Corroboration', color: 'amber', description: 'Major publisher, university/hospital, authoritative nonprofit' },
  3: { label: 'Weak Signal', color: 'red', description: 'Blog, brand site, influencer, social media' },
}

export const CONFIDENCE_META: Record<ConfidenceGrade, { label: string; description: string }> = {
  A: { label: 'High Confidence', description: 'Official source + systematic review + trusted coverage. Auto-published.' },
  B: { label: 'Good Confidence', description: 'Official source + one strong corroboration. Auto-published.' },
  C: { label: 'Developing', description: 'Multiple trusted secondaries, no primary source. Framed as "what we know so far".' },
  D: { label: 'Insufficient', description: 'Social trend only. Not published.' },
  hold: { label: 'On Hold', description: 'Contradictory or insufficient evidence.' },
}

export const ARTICLE_TYPES: Record<ArticleType, { label: string; description: string }> = {
  news_brief: { label: 'News Brief', description: 'Fast-moving: recalls, study releases, race announcements' },
  evidence_explainer: { label: 'Evidence Explainer', description: 'Deep dives on supplement stacks, training myths' },
  practical_guide: { label: 'Practical Guide', description: 'Actionable training plans, programming guides' },
  event_intelligence: { label: 'Event Intelligence', description: 'Race logistics, registration, route info' },
}

export const GUARDRAILS: string[] = [
  'Never recommend a specific dosage unless a peer-reviewed source specifies that exact dosage.',
  'Never call any supplement "safe" based solely on blogs or social media.',
  'Never state or imply that any dietary supplement is "FDA approved" — supplements are not subject to FDA pre-market approval.',
  'Never generalize findings from animal studies or studies with fewer than 20 participants.',
  'Never turn one study into a universal recommendation.',
  'Never give disease-treatment advice.',
  'If sources conflict, present both sides explicitly.',
  'Always note significant study limitations.',
]
