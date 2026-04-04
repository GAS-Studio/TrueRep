import type { ArticleType } from '@/lib/types'
import { ARTICLE_TYPES } from '@/lib/constants'

export default function ArticleTypeBadge({ type }: { type: ArticleType }) {
  const meta = ARTICLE_TYPES[type]
  if (!meta) return null

  return (
    <span className="text-xs italic text-text-dim">
      {meta.label}
    </span>
  )
}
