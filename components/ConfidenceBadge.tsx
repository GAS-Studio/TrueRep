import type { ConfidenceGrade } from '@/lib/types'
import { CONFIDENCE_META } from '@/lib/constants'

const gradeLabels: Record<ConfidenceGrade, string> = {
  A: 'High Confidence',
  B: 'Good Confidence',
  C: 'Developing',
  D: 'Insufficient',
  hold: 'On Hold',
}

export default function ConfidenceBadge({
  grade,
  showLabel = false,
}: {
  grade: ConfidenceGrade
  showLabel?: boolean
}) {
  const meta = CONFIDENCE_META[grade]

  return (
    <span className="text-xs text-text-dim" title={meta.description}>
      Grade {grade === 'hold' ? 'Hold' : grade}
      {showLabel && <span> - {gradeLabels[grade]}</span>}
    </span>
  )
}
