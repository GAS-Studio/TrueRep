import { ShieldCheck } from 'lucide-react'
import type { ArticleWithClaims, Source, SourceRelationship } from '@/lib/types'
import ConfidenceBadge from './ConfidenceBadge'
import SourcePill from './SourcePill'

export default function EvidenceCard({ article }: { article: ArticleWithClaims }) {
  const claims = article.claims || []

  const sourceMap = new Map<string, Source & { relationship?: SourceRelationship }>()
  for (const claim of claims) {
    for (const cs of claim.claim_sources || []) {
      if (cs.source && !sourceMap.has(cs.source.id)) {
        sourceMap.set(cs.source.id, { ...cs.source, relationship: cs.relationship as SourceRelationship })
      }
    }
  }

  const allSources = Array.from(sourceMap.values())
  const tier1 = allSources.filter((s) => s.tier === 1)
  const tier2 = allSources.filter((s) => s.tier === 2)
  const tier3 = allSources.filter((s) => s.tier === 3)
  const conflictCount = claims.filter((c) => c.has_conflict).length

  return (
    <div className="rounded-xl border border-tier-1/30 bg-tier-1/5 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-tier-1" />
        <h3 className="text-base font-bold text-text">Evidence Summary</h3>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="rounded-lg bg-card border border-border p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-tier-1">{tier1.length}</div>
          <div className="text-[10px] font-medium text-text-dim uppercase tracking-wider">Tier 1 Sources</div>
        </div>
        <div className="rounded-lg bg-card border border-border p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-tier-2">{tier2.length}</div>
          <div className="text-[10px] font-medium text-text-dim uppercase tracking-wider">Tier 2 Sources</div>
        </div>
        <div className="rounded-lg bg-card border border-border p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-text">{claims.length}</div>
          <div className="text-[10px] font-medium text-text-dim uppercase tracking-wider">Total Claims</div>
        </div>
        <div className="rounded-lg bg-card border border-border p-3 text-center shadow-sm">
          <div className={`text-2xl font-bold ${conflictCount > 0 ? 'text-grade-d' : 'text-grade-a'}`}>
            {conflictCount}
          </div>
          <div className="text-[10px] font-medium text-text-dim uppercase tracking-wider">Conflicts</div>
        </div>
      </div>

      {/* Confidence */}
      <div className="mb-5">
        <ConfidenceBadge grade={article.confidence_grade} showLabel />
        {article.confidence_justification && (
          <p className="text-sm text-text-muted mt-2">{article.confidence_justification}</p>
        )}
      </div>

      {/* Sources by tier */}
      {tier1.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-bold text-tier-1 uppercase tracking-wider mb-2">Tier 1 - Source of Truth</h4>
          <div className="flex flex-wrap gap-2">
            {tier1.map((s) => <SourcePill key={s.id} source={s} relationship={s.relationship} />)}
          </div>
        </div>
      )}
      {tier2.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-bold text-tier-2 uppercase tracking-wider mb-2">Tier 2 - Strong Corroboration</h4>
          <div className="flex flex-wrap gap-2">
            {tier2.map((s) => <SourcePill key={s.id} source={s} relationship={s.relationship} />)}
          </div>
        </div>
      )}
      {tier3.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-tier-3 uppercase tracking-wider mb-2">Tier 3 - Weak Signals</h4>
          <div className="flex flex-wrap gap-2">
            {tier3.map((s) => <SourcePill key={s.id} source={s} relationship={s.relationship} />)}
          </div>
        </div>
      )}
    </div>
  )
}
