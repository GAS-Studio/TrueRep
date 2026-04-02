import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { BookOpen } from 'lucide-react'
import type { Article, Desk } from '@/lib/types'
import { DESKS } from '@/lib/constants'
import ConfidenceBadge from './ConfidenceBadge'
import ArticleTypeBadge from './ArticleTypeBadge'

export default function ArticleCard({ article }: { article: Article & { desk?: Desk } }) {
  const desk = article.desk || DESKS[article.desk_id]
  const publishedDate = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : 'Recently'

  return (
    <Link
      href={`/article/${article.slug}`}
      className="group block rounded-xl bg-card border border-border hover:border-border-light hover:shadow-lg hover:shadow-black/20 transition-all duration-200 overflow-hidden"
    >
      <div className="border-l-4 p-5" style={{ borderColor: desk?.color || '#6366f1' }}>
        {/* Top row: badges + date */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <ArticleTypeBadge type={article.article_type} />
          <ConfidenceBadge grade={article.confidence_grade} />
          <span className="text-xs text-text-dim ml-auto">{publishedDate}</span>
        </div>

        {/* Headline */}
        <h3 className="text-lg font-semibold text-text group-hover:text-accent transition-colors mb-2 line-clamp-2">
          {article.headline}
        </h3>

        {/* Nut graf preview */}
        <p className="text-sm text-text-muted line-clamp-2 mb-4">
          {article.nut_graf}
        </p>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-text-dim">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Claims verified</span>
          </div>
          {desk && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${desk.color}18`,
                color: desk.color,
              }}
            >
              {desk.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
