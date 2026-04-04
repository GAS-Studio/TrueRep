import Link from 'next/link'
import { ShieldCheck, ArrowRight, Rss, CheckCircle, Globe } from 'lucide-react'
import { DESKS } from '@/lib/constants'
import { FeaturedArticle, CompactArticle } from '@/components/ArticleCard'
import ArticleCard from '@/components/ArticleCard'
import type { Article, DeskId } from '@/lib/types'

async function getArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/articles?limit=20`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.articles || []
  } catch {
    return []
  }
}

const deskColors: Record<DeskId, string> = {
  supplements: '#2D6A4F',
  races: '#B8860B',
  strength: '#8B2500',
}

export default async function HomePage() {
  const articles = await getArticles()
  const featured = articles[0]
  const sidebar = articles.slice(1, 5)
  const deskIds: DeskId[] = ['supplements', 'races', 'strength']

  return (
    <div>
      {/* Hero featured article */}
      {featured && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-4">
          <FeaturedArticle article={featured} />
        </section>
      )}

      {/* Secondary stories */}
      {sidebar.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 bg-card rounded-xl border border-border divide-y sm:divide-y-0 sm:divide-x divide-border">
            {sidebar.map((article) => (
              <CompactArticle key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Desk sections */}
      {deskIds.map((deskId) => {
        const desk = DESKS[deskId]
        const deskArticles = articles.filter((a) => a.desk_id === deskId).slice(0, 3)
        if (deskArticles.length === 0) return null

        return (
          <section key={deskId} className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full" style={{ backgroundColor: deskColors[deskId] }} />
                <h2 className="font-headline text-2xl font-bold text-text">{desk.name}</h2>
              </div>
              <Link
                href={`/${deskId}`}
                className="flex items-center gap-1 text-sm font-medium transition-colors hover:gap-2"
                style={{ color: deskColors[deskId] }}
              >
                See all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {deskArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )
      })}

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-primary rounded-2xl p-8 sm:p-12 text-white">
          <div className="text-center mb-10">
            <h2 className="font-headline text-3xl font-bold mb-2">How Our Newsroom Works</h2>
            <p className="text-white/60 max-w-lg mx-auto">
              Every article passes through a 7-step AI pipeline before publication.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { Icon: Rss, title: 'Discover', desc: 'AI scans PubMed, Google News, and official sources daily for trending fitness topics.', color: '#6b8f7b' },
              { Icon: CheckCircle, title: 'Verify', desc: 'Every claim is checked against Tier 1 primary sources. No blog-only claims pass.', color: '#7BA3C9' },
              { Icon: Globe, title: 'Publish', desc: 'Only Grade A and B articles go live. Grade C is framed as developing.', color: '#D4A84B' },
            ].map((step) => (
              <div key={step.title} className="bg-white/8 rounded-xl p-6 border border-white/10">
                <step.Icon className="w-8 h-8 mb-4" style={{ color: step.color }} />
                <h3 className="font-headline text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/pipeline" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors border border-white/10">
              See full pipeline <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-center justify-center gap-8 py-6 text-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-secondary" />
            <span className="text-sm text-text-muted">
              <strong className="text-text">{articles.length}</strong> articles verified
            </span>
          </div>
          <span className="text-border">|</span>
          <span className="text-sm text-text-muted">
            <strong className="text-text">3</strong> evidence desks
          </span>
          <span className="text-border">|</span>
          <span className="text-sm text-text-muted">
            <strong className="text-text">7</strong> pipeline steps
          </span>
        </div>
        <p className="text-center text-sm text-text-dim italic">
          &ldquo;Discovery can be social. Truth must be primary-source.&rdquo;
        </p>
      </section>

      {/* Empty state */}
      {articles.length === 0 && (
        <div className="py-24 text-center max-w-md mx-auto">
          <ShieldCheck className="w-12 h-12 text-secondary mx-auto mb-4" />
          <h2 className="font-headline text-3xl font-bold text-text mb-3">TrueRep</h2>
          <p className="text-text-muted italic">Evidence-first fitness news. Articles will appear here once the pipeline runs.</p>
        </div>
      )}
    </div>
  )
}
