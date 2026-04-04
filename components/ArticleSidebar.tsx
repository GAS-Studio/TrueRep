'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { ArticleWithClaims, Source, SourceRelationship } from '@/lib/types'
import ClaimBlock from './ClaimBlock'
import SourcePill from './SourcePill'
import ConfidenceBadge from './ConfidenceBadge'

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 mb-2"
      >
        <span className="small-caps text-[10px] font-bold text-text-dim tracking-widest">{title}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-text-dim transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

export default function ArticleSidebar({ article }: { article: ArticleWithClaims }) {
  const claims = [...(article.claims || [])].sort((a, b) => a.claim_order - b.claim_order)

  const sourceMap = new Map<string, { source: Source & { relationship?: SourceRelationship }; tier: number }>()
  for (const claim of claims) {
    for (const cs of claim.claim_sources || []) {
      if (cs.source && !sourceMap.has(cs.source.id)) {
        sourceMap.set(cs.source.id, {
          source: { ...cs.source, relationship: cs.relationship as SourceRelationship },
          tier: cs.source.tier,
        })
      }
    }
  }
  const allSources = Array.from(sourceMap.values())
  const tier1 = allSources.filter((s) => s.tier === 1)
  const tier2 = allSources.filter((s) => s.tier === 2)
  const tier3 = allSources.filter((s) => s.tier === 3)

  return (
    <aside className="w-72 xl:w-80 flex-shrink-0">
      <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto pb-4">
        <div className="rule mb-4" />

        {/* Why this story */}
        {article.why_this_story && (
          <Section title="Why This Story">
            <p className="text-sm text-text-muted leading-relaxed">{article.why_this_story}</p>
            {(article.topic_score ?? 0) > 0 && (
              <span className="text-xs text-text-dim mt-2 block">
                Relevance score: {article.topic_score}/100
              </span>
            )}
          </Section>
        )}

        {/* Evidence */}
        <Section title="Evidence Summary">
          <div className="flex gap-4 mb-3">
            <div className="text-center">
              <div className="font-headline text-2xl font-bold text-text">{tier1.length}</div>
              <div className="text-[10px] text-text-dim">Tier 1</div>
            </div>
            <div className="text-center">
              <div className="font-headline text-2xl font-bold text-text">{tier2.length}</div>
              <div className="text-[10px] text-text-dim">Tier 2</div>
            </div>
            <div className="text-center">
              <div className="font-headline text-2xl font-bold text-text">{claims.length}</div>
              <div className="text-[10px] text-text-dim">Claims</div>
            </div>
          </div>
          <ConfidenceBadge grade={article.confidence_grade} showLabel />
          {article.confidence_justification && (
            <p className="text-xs text-text-dim leading-relaxed mt-2">{article.confidence_justification}</p>
          )}
        </Section>

        {/* Claims */}
        {claims.length > 0 && (
          <Section title={`Verified Claims (${claims.length})`} defaultOpen={false}>
            <div className="space-y-2">
              {claims.map((claim, i) => (
                <ClaimBlock key={claim.id} claim={claim} index={i} />
              ))}
            </div>
          </Section>
        )}

        {/* Practical takeaway */}
        {article.practical_takeaway && (
          <Section title="Practical Takeaway">
            <div className="text-sm text-text-muted leading-relaxed whitespace-pre-line">
              {article.practical_takeaway}
            </div>
          </Section>
        )}

        {/* What we don't know */}
        {article.what_we_dont_know && (
          <Section title="What We Don't Know" defaultOpen={false}>
            <p className="text-sm text-text-muted leading-relaxed">{article.what_we_dont_know}</p>
          </Section>
        )}

        {/* Sources */}
        {allSources.length > 0 && (
          <Section title="Sources Used" defaultOpen={false}>
            {tier1.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1">Tier 1</p>
                <div className="space-y-1.5">
                  {tier1.map(({ source }) => <SourcePill key={source.id} source={source} />)}
                </div>
              </div>
            )}
            {tier2.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Tier 2</p>
                <div className="space-y-1.5">
                  {tier2.map(({ source }) => <SourcePill key={source.id} source={source} />)}
                </div>
              </div>
            )}
            {tier3.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Tier 3</p>
                <div className="space-y-1.5">
                  {tier3.map(({ source }) => <SourcePill key={source.id} source={source} />)}
                </div>
              </div>
            )}
            {article.source_notes && (
              <p className="text-xs text-text-dim italic mt-3 pt-3 border-t border-border">{article.source_notes}</p>
            )}
          </Section>
        )}
      </div>
    </aside>
  )
}
