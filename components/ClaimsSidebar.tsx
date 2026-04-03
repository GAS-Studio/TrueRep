'use client'

import { useState } from 'react'
import { ChevronDown, ShieldCheck } from 'lucide-react'
import ClaimBlock from './ClaimBlock'
import type { Claim, ClaimSource, Source } from '@/lib/types'

type ClaimWithSources = Claim & {
  claim_sources: (ClaimSource & { source: Source })[]
}

export default function ClaimsSidebar({ claims }: { claims: ClaimWithSources[] }) {
  const [open, setOpen] = useState(true)

  if (claims.length === 0) return null

  return (
    <aside className="w-72 xl:w-80 flex-shrink-0">
      <div className="sticky top-6 rounded-xl border border-border bg-card overflow-hidden">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 hover:bg-card/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-grade-a" />
            <span className="text-sm font-bold text-text">Verified Claims</span>
            <span className="text-xs font-medium text-text-dim bg-border/60 rounded-full px-2 py-0.5">
              {claims.length}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-text-dim transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="px-3 pb-3 space-y-2 max-h-[75vh] overflow-y-auto">
            {claims.map((claim, i) => (
              <ClaimBlock key={claim.id} claim={claim} index={i} />
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
