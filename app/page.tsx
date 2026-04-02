import Link from 'next/link'
import { ShieldCheck, Rss, CheckCircle, Globe, FlaskConical, Trophy, Dumbbell } from 'lucide-react'
import { DESKS } from '@/lib/constants'
import ArticleCard from '@/components/ArticleCard'
import type { Article } from '@/lib/types'

async function getArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/articles?limit=9`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.articles || []
  } catch {
    return []
  }
}

async function getStats() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/articles?limit=100`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return { articles: 0 }
    const data = await res.json()
    return { articles: (data.articles || []).length }
  } catch {
    return { articles: 0 }
  }
}

const deskIcons = {
  supplements: FlaskConical,
  races: Trophy,
  strength: Dumbbell,
}

const deskDetails = {
  supplements: 'Backed by NIH, FDA, PubMed. Every supplement claim verified against peer-reviewed evidence.',
  races: 'Official sources only. Dates, routes, and registration from organizers and governing bodies.',
  strength: 'CDC & ACSM guidelines. Evidence-based training protocols from systematic reviews.',
}

export default async function HomePage() {
  const [articles, stats] = await Promise.all([getArticles(), getStats()])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
              <ShieldCheck className="w-4 h-4" />
              AI-Powered Evidence Pipeline
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text tracking-tight leading-tight mb-6">
              Evidence-First{' '}
              <span className="text-accent">Fitness News.</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-muted leading-relaxed mb-8 max-w-2xl mx-auto">
              Every claim backed by science. No clickbait. No guesswork.
              Our AI pipeline verifies every article against primary sources before publishing.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {Object.values(DESKS).map((desk) => (
                <Link
                  key={desk.id}
                  href={`/${desk.id}`}
                  className="px-6 py-3 rounded-full text-sm font-bold transition-all hover:scale-105"
                  style={{
                    backgroundColor: desk.color,
                    color: '#030712',
                  }}
                >
                  {desk.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Desk cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(DESKS).map((desk) => {
            const Icon = deskIcons[desk.id]
            return (
              <Link
                key={desk.id}
                href={`/${desk.id}`}
                className="group rounded-xl bg-card border border-border hover:border-border-light p-6 transition-all"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${desk.color}18` }}
                >
                  <Icon className="w-6 h-6" style={{ color: desk.color }} />
                </div>
                <h3 className="text-lg font-bold text-text mb-2 group-hover:text-accent transition-colors">
                  {desk.name}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {deskDetails[desk.id]}
                </p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Latest stories */}
      {articles.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-text">Latest Stories</h2>
            <span className="text-sm text-text-dim">{articles.length} articles</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* How we work */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-text text-center mb-10">How We Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              Icon: Rss,
              title: 'Discover',
              desc: 'Our AI scans RSS feeds, PubMed, and official sources daily to find trending fitness topics worth covering.',
              color: '#2E8B8B',
            },
            {
              Icon: CheckCircle,
              title: 'Verify',
              desc: 'Every claim gets checked against our source-of-truth ladder. Tier 1 primary sources required for publication.',
              color: '#10b981',
            },
            {
              Icon: Globe,
              title: 'Publish',
              desc: 'Only articles with Grade A or B evidence make it through. Grade C gets framed as "what we know so far."',
              color: '#4CAF7A',
            },
          ].map((step) => (
            <div key={step.title} className="rounded-xl bg-card border border-border p-6 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${step.color}15` }}
              >
                <step.Icon className="w-7 h-7" style={{ color: step.color }} />
              </div>
              <h3 className="text-lg font-bold text-text mb-2">{step.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16 mb-6">
            <div>
              <div className="text-3xl font-bold text-accent">{stats.articles || '0'}</div>
              <div className="text-xs font-medium text-text-dim uppercase tracking-wider mt-1">Articles Published</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary">3</div>
              <div className="text-xs font-medium text-text-dim uppercase tracking-wider mt-1">Evidence Desks</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-text">7</div>
              <div className="text-xs font-medium text-text-dim uppercase tracking-wider mt-1">Pipeline Steps</div>
            </div>
          </div>
          <p className="text-sm text-text-muted italic max-w-lg mx-auto">
            &quot;Discovery can be social. Truth must be primary-source.&quot;
          </p>
        </div>
      </section>
    </div>
  )
}
