import { AlertTriangle, ExternalLink } from 'lucide-react'
import type { Source, SourceRelationship } from '@/lib/types'

const tierColors: Record<number, string> = {
  1: 'border-tier-1/50 text-tier-1',
  2: 'border-tier-2/50 text-tier-2',
  3: 'border-tier-3/50 text-tier-3',
}

const tierLabels: Record<number, string> = {
  1: 'T1',
  2: 'T2',
  3: 'T3',
}

export default function SourcePill({
  source,
  relationship,
}: {
  source: Source
  relationship?: SourceRelationship
}) {
  const colors = tierColors[source.tier] || tierColors[3]
  const label = tierLabels[source.tier] || 'T3'
  const publisher = source.publisher || new URL(source.url).hostname.replace('www.', '')

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-bg/50 text-xs font-medium hover:bg-card transition-colors ${colors}`}
    >
      {relationship === 'contradicts' && <AlertTriangle className="w-3 h-3 text-tier-3" />}
      <span className="font-bold">{label}</span>
      <span className="text-text-muted">&middot;</span>
      <span className="text-text-muted truncate max-w-[120px]">{publisher}</span>
      <ExternalLink className="w-3 h-3 text-text-dim" />
    </a>
  )
}
