import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { ChevronRight, Target, HelpCircle } from 'lucide-react'
import type { ArticleWithClaims } from '@/lib/types'
import { DESKS } from '@/lib/constants'
import ConfidenceBadge from '@/components/ConfidenceBadge'
import ArticleTypeBadge from '@/components/ArticleTypeBadge'
import VerificationTimestamp from '@/components/VerificationTimestamp'
import EvidenceCard from '@/components/EvidenceCard'
import WhyThisStory from '@/components/WhyThisStory'
import SourcePill from '@/components/SourcePill'
import MedicalDisclaimer from '@/components/MedicalDisclaimer'
import ClaimsSidebar from '@/components/ClaimsSidebar'

async function getArticle(slug: string): Promise<ArticleWithClaims | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/articles/${slug}`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.article || null
  } catch {
    return null
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    notFound()
  }

  const desk = article.desk || DESKS[article.desk_id]
  const publishedDate = article.published_at
    ? format(new Date(article.published_at), 'MMM d, yyyy')
    : 'Draft'

  // Collect all unique sources for the Sources section
  const sourceMap = new Map<string, { source: NonNullable<(typeof article.claims)[0]['claim_sources'][0]['source']>; tier: number }>()
  for (const claim of article.claims || []) {
    for (const cs of claim.claim_sources || []) {
      if (cs.source && !sourceMap.has(cs.source.id)) {
        sourceMap.set(cs.source.id, { source: cs.source, tier: cs.source.tier })
      }
    }
  }
  const allSources = Array.from(sourceMap.values())
  const tier1Sources = allSources.filter((s) => s.tier === 1)
  const tier2Sources = allSources.filter((s) => s.tier === 2)
  const tier3Sources = allSources.filter((s) => s.tier === 3)

  const sortedClaims = [...(article.claims || [])].sort((a, b) => a.claim_order - b.claim_order)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
    <div className="flex gap-10 items-start">
    <div className="flex-1 min-w-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-text-dim mb-6">
        <Link href="/" className="hover:text-text transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/${article.desk_id}`} className="hover:text-text transition-colors" style={{ color: desk?.color }}>
          {desk?.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-text-muted truncate max-w-[200px]">{article.headline}</span>
      </nav>

      {/* Header badges */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <ArticleTypeBadge type={article.article_type} />
        <ConfidenceBadge grade={article.confidence_grade} showLabel />
        <VerificationTimestamp
          lastVerifiedAt={article.last_verified_at}
          verificationCount={article.verification_count}
        />
      </div>

      {/* Headline */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight leading-tight mb-3">
        {article.headline}
      </h1>

      {/* Subheadline */}
      {article.subheadline && (
        <p className="text-lg text-text-muted italic mb-4">{article.subheadline}</p>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-text-dim mb-8">
        <span>{publishedDate}</span>
        <span>&middot;</span>
        {desk && (
          <span style={{ color: desk.color }}>{desk.name}</span>
        )}
        <span>&middot;</span>
        <span>By TrueRep AI Desk</span>
      </div>

      {/* Why this story */}
      <div className="mb-6">
        <WhyThisStory text={article.why_this_story} topicScore={article.topic_score} />
      </div>

      {/* Evidence card */}
      <div className="mb-8">
        <EvidenceCard article={article} />
      </div>

      {/* Nut graf */}
      <p className="text-lg text-text font-medium leading-relaxed mb-6">
        {article.nut_graf}
      </p>

      <hr className="border-border mb-8" />

      {/* Article body */}
      <div
        className="article-body mb-10"
        dangerouslySetInnerHTML={{ __html: article.body_html }}
      />

      {/* Practical takeaway */}
      {article.practical_takeaway && (
        <div className="rounded-xl border border-tier-1/30 bg-tier-1/5 p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-tier-1" />
            <h3 className="text-base font-bold text-text">Practical Takeaway</h3>
          </div>
          <div className="text-sm text-text-muted leading-relaxed whitespace-pre-line">
            {article.practical_takeaway}
          </div>
        </div>
      )}

      {/* What we don't know */}
      {article.what_we_dont_know && (
        <div className="rounded-xl border border-border bg-card p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-5 h-5 text-text-dim" />
            <h3 className="text-base font-bold text-text">What We Don&apos;t Know</h3>
          </div>
          <p className="text-sm text-text-muted leading-relaxed">
            {article.what_we_dont_know}
          </p>
        </div>
      )}

      {/* Source notes */}
      {article.source_notes && (
        <p className="text-sm text-text-dim italic mb-8">{article.source_notes}</p>
      )}

      {/* Full sources section */}
      {allSources.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-text mb-4">Sources Used</h2>
          {tier1Sources.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-tier-1 uppercase tracking-wider mb-2">
                Tier 1 - Source of Truth
              </h4>
              <div className="space-y-2">
                {tier1Sources.map(({ source }) => (
                  <div key={source.id} className="flex flex-col gap-1">
                    <SourcePill source={source} />
                    {source.snippet && (
                      <p className="text-xs text-text-dim pl-1 line-clamp-2">{source.snippet}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {tier2Sources.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-tier-2 uppercase tracking-wider mb-2">
                Tier 2 - Strong Corroboration
              </h4>
              <div className="space-y-2">
                {tier2Sources.map(({ source }) => (
                  <div key={source.id} className="flex flex-col gap-1">
                    <SourcePill source={source} />
                    {source.snippet && (
                      <p className="text-xs text-text-dim pl-1 line-clamp-2">{source.snippet}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {tier3Sources.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-tier-3 uppercase tracking-wider mb-2">
                Tier 3 - Weak Signals
              </h4>
              <div className="space-y-2">
                {tier3Sources.map(({ source }) => (
                  <div key={source.id} className="flex flex-col gap-1">
                    <SourcePill source={source} />
                    {source.snippet && (
                      <p className="text-xs text-text-dim pl-1 line-clamp-2">{source.snippet}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Medical disclaimer */}
      <MedicalDisclaimer />
    </div>

    {/* Claims sidebar — desktop only */}
    <div className="hidden lg:block">
      <ClaimsSidebar claims={sortedClaims as Parameters<typeof ClaimsSidebar>[0]['claims']} />
    </div>
    </div>
    </div>
  )
}
