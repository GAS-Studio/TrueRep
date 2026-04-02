import type { ConfidenceGrade } from '@/lib/types'
import { CONFIDENCE_META } from '@/lib/constants'

const gradeStyles: Record<ConfidenceGrade, string> = {
  A: 'bg-grade-a/15 text-grade-a border-grade-a/30',
  B: 'bg-grade-b/15 text-grade-b border-grade-b/30',
  C: 'bg-grade-c/15 text-grade-c border-grade-c/30',
  D: 'bg-grade-d/15 text-grade-d border-grade-d/30',
  hold: 'bg-grade-hold/15 text-grade-hold border-grade-hold/30',
}

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
  const style = gradeStyles[grade]
  const meta = CONFIDENCE_META[grade]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${style}`}
      title={meta.description}
    >
      Grade {grade === 'hold' ? 'Hold' : grade}
      {showLabel && <span className="font-medium">&ndash; {gradeLabels[grade]}</span>}
    </span>
  )
}
