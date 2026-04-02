import { Zap, BookOpen, Target, Calendar } from 'lucide-react'
import type { ArticleType } from '@/lib/types'

const typeConfig: Record<ArticleType, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  news_brief: { label: 'News Brief', Icon: Zap },
  evidence_explainer: { label: 'Evidence Explainer', Icon: BookOpen },
  practical_guide: { label: 'Practical Guide', Icon: Target },
  event_intelligence: { label: 'Event Intelligence', Icon: Calendar },
}

export default function ArticleTypeBadge({ type }: { type: ArticleType }) {
  const config = typeConfig[type]
  if (!config) return null
  const { label, Icon } = config

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border text-xs font-medium text-text-muted">
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}
