import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import type { ArticleWithClaims } from '@/lib/types'
import { DESKS } from '@/lib/constants'
import ArticleTypeBadge from '@/components/ArticleTypeBadge'
import ConfidenceBadge from '@/components/ConfidenceBadge'
import VerificationTimestamp from '@/components/VerificationTimestamp'
import MedicalDisclaimer from '@/components/MedicalDisclaimer'
import ArticleSidebar from '@/components/ArticleSidebar'

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex gap-10 items-start">

        {/* Main article column */}
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
            {desk && <span style={{ color: desk.color }}>{desk.name}</span>}
            <span>&middot;</span>
            <span>By TrueRep AI Desk</span>
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

          <MedicalDisclaimer />
        </div>

        {/* Sidebar — desktop only */}
        <div className="hidden lg:block">
          <ArticleSidebar article={article} />
        </div>

      </div>
    </div>
  )
}
