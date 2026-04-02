'use client'

import { useState } from 'react'
import { ChevronDown, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import type { Claim, ClaimSource, Source, SourceRelationship } from '@/lib/types'
import SourcePill from './SourcePill'

type ClaimWithSources = Claim & {
  claim_sources: (ClaimSource & { source: Source })[]
}

export default function ClaimBlock({
  claim,
  index,
}: {
  claim: ClaimWithSources
  index: number
}) {
  const [open, setOpen] = useState(false)

  const sources = claim.claim_sources || []

  return (
    <div className="rounded-lg border border-border bg-card/50 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-card transition-colors"
      >
        <span className="text-xs font-bold text-text-dim bg-border/50 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
          {index + 1}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-text leading-relaxed">{claim.claim_text}</p>
          {claim.category && (
            <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-border/50 text-text-dim">
              {claim.category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {claim.fact_check_passed === true && (
            <CheckCircle className="w-4 h-4 text-grade-a" />
          )}
          {claim.overstatement_flag && (
            <AlertTriangle className="w-4 h-4 text-grade-c" />
          )}
          {claim.uncited_flag && (
            <XCircle className="w-4 h-4 text-grade-d" />
          )}
          <ChevronDown
            className={`w-4 h-4 text-text-dim transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-border">
          {/* Confidence */}
          <div className="flex items-center gap-2 mt-3 mb-3">
            <span className="text-xs text-text-dim">Confidence:</span>
            <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-grade-a"
                style={{ width: `${claim.confidence * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono text-text-muted">{(claim.confidence * 100).toFixed(0)}%</span>
          </div>

          {/* Conflict warning */}
          {claim.has_conflict && claim.conflict_description && (
            <div className="rounded-lg border border-grade-c/30 bg-grade-c/5 p-3 mb-3 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-grade-c shrink-0 mt-0.5" />
              <p className="text-xs text-text-muted">{claim.conflict_description}</p>
            </div>
          )}

          {/* Sources */}
          {sources.length > 0 ? (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-text-dim uppercase tracking-wider">Sources</span>
              {sources.filter((cs) => cs.source).map((cs) => (
                <div key={cs.id} className="flex flex-col gap-1">
                  <SourcePill
                    source={cs.source!}
                    relationship={cs.relationship as SourceRelationship}
                  />
                  {cs.relevance_note && (
                    <p className="text-xs text-text-dim pl-1">{cs.relevance_note}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-dim italic">No sources linked to this claim yet.</p>
          )}

          {/* Fact check notes */}
          {claim.fact_check_notes && (
            <p className="text-xs text-text-dim mt-3 italic border-t border-border pt-2">
              {claim.fact_check_notes}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
