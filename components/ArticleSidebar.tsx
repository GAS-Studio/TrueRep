'use client'

import { useState } from 'react'
import { ChevronDown, ShieldCheck, Sparkles, Target, HelpCircle } from 'lucide-react'
import type { ArticleWithClaims, Source, SourceRelationship } from '@/lib/types'
import ClaimBlock from './ClaimBlock'
import SourcePill from './SourcePill'
import ConfidenceBadge from './ConfidenceBadge'

function Section({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 hover:bg-card/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-bold text-text">{title}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-text-dim transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
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
      <div className="sticky top-6 space-y-3 max-h-[calc(100vh-3rem)] overflow-y-auto pb-4">

        {/* Why this story */}
        {article.why_this_story && (
          <Section
            title="Why this story?"
            icon={<Sparkles className="w-4 h-4 text-secondary" />}
          >
            <p className="text-sm text-text-muted leading-relaxed">{article.why_this_story}</p>
            {(article.topic_score ?? 0) > 0 && (
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-medium bg-secondary/15 text-secondary">
                Topic score: {article.topic_score}
              </span>
            )}
          </Section>
        )}

        {/* Evidence summary */}
        <Section
          title="Evidence Summary"
          icon={<ShieldCheck className="w-4 h-4 text-grade-a" />}
        >
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'Tier 1', value: tier1.length },
              { label: 'Tier 2', value: tier2.length },
              { label: 'Claims', value: claims.length },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-background border border-border p-2 text-center">
                <div className="text-lg font-bold text-text">{value}</div>
                <div className="text-[10px] text-text-dim uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <ConfidenceBadge grade={article.confidence_grade} showLabel />
          </div>
          {article.confidence_justification && (
            <p className="text-xs text-text-dim leading-relaxed">{article.confidence_justification}</p>
          )}
        </Section>

        {/* Verified claims */}
        {claims.length > 0 && (
          <Section
            title={`Verified Claims (${claims.length})`}
            icon={<ShieldCheck className="w-4 h-4 text-grade-a" />}
            defaultOpen={false}
          >
            <div className="space-y-2">
              {claims.map((claim, i) => (
                <ClaimBlock key={claim.id} claim={claim} index={i} />
              ))}
            </div>
          </Section>
        )}

        {/* Practical takeaway */}
        {article.practical_takeaway && (
          <Section
            title="Practical Takeaway"
            icon={<Target className="w-4 h-4 text-tier-1" />}
          >
            <div className="text-sm text-text-muted leading-relaxed whitespace-pre-line">
              {article.practical_takeaway}
            </div>
          </Section>
        )}

        {/* What we don't know */}
        {article.what_we_dont_know && (
          <Section
            title="What We Don't Know"
            icon={<HelpCircle className="w-4 h-4 text-text-dim" />}
            defaultOpen={false}
          >
            <p className="text-sm text-text-muted leading-relaxed">{article.what_we_dont_know}</p>
          </Section>
        )}

        {/* Sources */}
        {allSources.length > 0 && (
          <Section
            title="Sources Used"
            icon={<ShieldCheck className="w-4 h-4 text-text-dim" />}
            defaultOpen={false}
          >
            {tier1.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-bold text-tier-1 uppercase tracking-wider mb-2">Tier 1 — Source of Truth</p>
                <div className="space-y-1.5">
                  {tier1.map(({ source }) => <SourcePill key={source.id} source={source} />)}
                </div>
              </div>
            )}
            {tier2.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-bold text-tier-2 uppercase tracking-wider mb-2">Tier 2 — Strong Corroboration</p>
                <div className="space-y-1.5">
                  {tier2.map(({ source }) => <SourcePill key={source.id} source={source} />)}
                </div>
              </div>
            )}
            {tier3.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-tier-3 uppercase tracking-wider mb-2">Tier 3 — Weak Signals</p>
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
