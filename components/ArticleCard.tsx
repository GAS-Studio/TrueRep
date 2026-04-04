import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Clock, ShieldCheck } from 'lucide-react'
import type { Article, Desk, DeskId } from '@/lib/types'
import { DESKS, CONFIDENCE_META } from '@/lib/constants'

const deskColors: Record<string, string> = {
  supplements: '#2D6A4F',
  races: '#B8860B',
  strength: '#8B2500',
}

export function FeaturedArticle({ article }: { article: Article & { desk?: Desk } }) {
  const desk = article.desk || DESKS[article.desk_id as DeskId]
  const color = deskColors[article.desk_id] || '#567568'
  const publishedDate = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : 'Recently'

  return (
    <Link href={`/article/${article.slug}`} className={`group block rounded-2xl p-8 sm:p-10 transition-all hover:shadow-lg desk-hero-${article.desk_id}`}>
      <div className="flex items-center gap-2 mb-4">
        <span
          className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
          style={{ backgroundColor: color }}
        >
          {desk?.name}
        </span>
        <span className="flex items-center gap-1 text-xs text-text-dim">
          <Clock className="w-3 h-3" />
          {publishedDate}
        </span>
      </div>
      <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-text leading-[1.1] mb-4 group-hover:text-secondary transition-colors">
        {article.headline}
      </h2>
      {article.subheadline && (
        <p className="font-headline text-lg sm:text-xl text-text-muted italic mb-4">{article.subheadline}</p>
      )}
      <p className="text-text-muted leading-relaxed text-base max-w-2xl">{article.nut_graf}</p>
      <div className="mt-5 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-secondary" />
        <span className="text-sm text-secondary font-medium">
          Grade {article.confidence_grade} - {CONFIDENCE_META[article.confidence_grade]?.label}
        </span>
      </div>
    </Link>
  )
}

export function CompactArticle({ article }: { article: Article & { desk?: Desk } }) {
  const desk = article.desk || DESKS[article.desk_id as DeskId]
  const color = deskColors[article.desk_id] || '#567568'
  const publishedDate = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : 'Recently'

  return (
    <Link
      href={`/article/${article.slug}`}
      className="group flex gap-4 p-4 rounded-xl hover:bg-card transition-all"
    >
      <div className="w-1 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-dim">
          {desk?.name}
        </span>
        <h3 className="font-headline text-lg font-bold text-text leading-snug mt-0.5 mb-1 group-hover:text-secondary transition-colors">
          {article.headline}
        </h3>
        <p className="text-sm text-text-dim line-clamp-1">{article.nut_graf}</p>
        <span className="text-xs text-text-dim mt-1 block">{publishedDate}</span>
      </div>
    </Link>
  )
}

export default function ArticleCard({ article }: { article: Article & { desk?: Desk } }) {
  const desk = article.desk || DESKS[article.desk_id as DeskId]
  const color = deskColors[article.desk_id] || '#567568'
  const publishedDate = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : 'Recently'

  return (
    <Link
      href={`/article/${article.slug}`}
      className="group block bg-card rounded-xl p-5 border border-border hover:border-border-light hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-dim">
          {desk?.name}
        </span>
        <span className="text-text-dim text-[10px] ml-auto">{publishedDate}</span>
      </div>
      <h3 className="font-headline text-xl font-bold text-text leading-snug mb-2 group-hover:text-secondary transition-colors">
        {article.headline}
      </h3>
      <p className="text-sm text-text-muted line-clamp-2 mb-3">{article.nut_graf}</p>
      <div className="flex items-center gap-1.5 text-xs text-text-dim">
        <ShieldCheck className="w-3.5 h-3.5" />
        Grade {article.confidence_grade}
      </div>
    </Link>
  )
}
