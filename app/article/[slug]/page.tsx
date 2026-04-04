import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import type { ArticleWithClaims, Article } from '@/lib/types'
import { DESKS } from '@/lib/constants'
import ArticleTypeBadge from '@/components/ArticleTypeBadge'
import ConfidenceBadge from '@/components/ConfidenceBadge'
import VerificationTimestamp from '@/components/VerificationTimestamp'
import MedicalDisclaimer from '@/components/MedicalDisclaimer'
import ArticleSidebar from '@/components/ArticleSidebar'
import ReadingProgress from '@/components/ReadingProgress'
import StickyArticleBar from '@/components/StickyArticleBar'

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

async function getRelatedArticles(deskId: string, currentSlug: string): Promise<Article[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/articles?desk=${deskId}&limit=10`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    const articles = (data.articles || []) as Article[]
    return articles.filter((a) => a.slug !== currentSlug)
  } catch {
    return []
  }
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, '')
  const words = text.split(/\s+/).length
  return Math.max(1, Math.ceil(words / 230))
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const desk = article.desk || DESKS[article.desk_id]
  const publishedDate = article.published_at
    ? format(new Date(article.published_at), 'MMMM d, yyyy')
    : 'Draft'
  const readTime = estimateReadingTime(article.body_html)

  const related = await getRelatedArticles(article.desk_id, slug)
  const prevArticle = related.length > 0 ? related[related.length - 1] : null
  const nextArticle = related.length > 1 ? related[0] : related.length === 1 ? related[0] : null
  const moreFromDesk = related.slice(0, 3)

  return (
    <>
      <ReadingProgress />
      <StickyArticleBar headline={article.headline} desk={desk?.name || ''} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-12 items-start">
          {/* Main article */}
          <article className="flex-1 min-w-0" style={{ maxWidth: '65ch' }}>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-text-dim mb-8">
              <Link href="/" className="hover:text-text transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/${article.desk_id}`} className="hover:text-text transition-colors">
                {desk?.name}
              </Link>
            </nav>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-text-dim mb-3">
              <ArticleTypeBadge type={article.article_type} />
              <span>&middot;</span>
              <ConfidenceBadge grade={article.confidence_grade} />
              <span>&middot;</span>
              <span>{readTime} min read</span>
            </div>

            {/* Headline */}
            <h1 className="font-headline text-4xl sm:text-5xl font-bold text-text leading-[1.15] mb-4">
              {article.headline}
            </h1>

            {/* Subheadline */}
            {article.subheadline && (
              <p className="font-headline text-xl text-text-muted italic mb-5">{article.subheadline}</p>
            )}

            {/* Byline */}
            <div className="flex items-center gap-2 text-sm text-text-dim mb-1">
              <span>By <strong className="text-text font-semibold">TrueRep AI Desk</strong></span>
              <span>&middot;</span>
              <span>{publishedDate}</span>
              <span>&middot;</span>
              <span className="small-caps">{desk?.name}</span>
            </div>

            <div className="mb-1">
              <VerificationTimestamp
                lastVerifiedAt={article.last_verified_at}
                verificationCount={article.verification_count}
              />
            </div>

            <div className="rule my-6" />

            {/* Nut graf */}
            <p className="text-lg text-text font-medium leading-relaxed mb-8 font-headline italic">
              {article.nut_graf}
            </p>

            {/* Body with drop cap */}
            <div
              className="article-body drop-cap mb-10"
              dangerouslySetInnerHTML={{ __html: article.body_html }}
            />

            <MedicalDisclaimer />

            {/* Previous / Next navigation */}
            <div className="mt-10 pt-8 border-t border-border flex items-stretch gap-4">
              {prevArticle ? (
                <Link href={`/article/${prevArticle.slug}`} className="group flex-1 text-left">
                  <div className="flex items-center gap-1 text-xs text-text-dim mb-1">
                    <ChevronLeft className="w-3 h-3" />
                    <span>Previous</span>
                  </div>
                  <span className="font-headline text-sm font-bold text-text group-hover:text-secondary transition-colors line-clamp-2">
                    {prevArticle.headline}
                  </span>
                </Link>
              ) : <div className="flex-1" />}

              {nextArticle && nextArticle.slug !== prevArticle?.slug ? (
                <Link href={`/article/${nextArticle.slug}`} className="group flex-1 text-right">
                  <div className="flex items-center justify-end gap-1 text-xs text-text-dim mb-1">
                    <span>Next</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                  <span className="font-headline text-sm font-bold text-text group-hover:text-secondary transition-colors line-clamp-2">
                    {nextArticle.headline}
                  </span>
                </Link>
              ) : <div className="flex-1" />}
            </div>

            {/* More from this desk */}
            {moreFromDesk.length > 0 && (
              <div className="mt-10 pt-8 border-t border-border">
                <h3 className="small-caps text-xs font-bold text-text-dim tracking-widest mb-4">
                  More from {desk?.name}
                </h3>
                <div className="space-y-4">
                  {moreFromDesk.map((a) => (
                    <Link key={a.id} href={`/article/${a.slug}`} className="group block">
                      <h4 className="font-headline text-base font-bold text-text group-hover:text-secondary transition-colors">
                        {a.headline}
                      </h4>
                      <p className="text-xs text-text-dim mt-0.5 line-clamp-1">{a.nut_graf}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <ArticleSidebar article={article} />
          </div>
        </div>
      </div>
    </>
  )
}
