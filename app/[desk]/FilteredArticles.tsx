'use client'

import { useState } from 'react'
import type { Article, ArticleType } from '@/lib/types'
import { ARTICLE_TYPES } from '@/lib/constants'
import ArticleCard from '@/components/ArticleCard'

const filterOptions: { value: ArticleType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  ...Object.entries(ARTICLE_TYPES).map(([key, meta]) => ({
    value: key as ArticleType,
    label: meta.label,
  })),
]

export default function FilteredArticles({ articles }: { articles: Article[] }) {
  const [filter, setFilter] = useState<ArticleType | 'all'>('all')

  const filtered = filter === 'all'
    ? articles
    : articles.filter((a) => a.article_type === filter)

  return (
    <div>
      {/* Filter row */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              filter === opt.value
                ? 'bg-card border-border-light text-text'
                : 'border-border text-text-dim hover:text-text-muted hover:border-border-light'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-text-muted text-lg">No articles yet for this desk.</p>
          <p className="text-text-dim text-sm mt-2">Check back soon - the pipeline runs daily.</p>
        </div>
      )}
    </div>
  )
}
