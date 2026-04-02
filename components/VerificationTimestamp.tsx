import { RefreshCw, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function VerificationTimestamp({
  lastVerifiedAt,
  verificationCount,
}: {
  lastVerifiedAt: string | null
  verificationCount: number
}) {
  if (!lastVerifiedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-text-dim">
        <Clock className="w-3.5 h-3.5" />
        Pending verification
      </span>
    )
  }

  const timeAgo = formatDistanceToNow(new Date(lastVerifiedAt), { addSuffix: true })

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
      <RefreshCw className="w-3.5 h-3.5 text-grade-a" />
      Last verified {timeAgo}
      <span className="text-text-dim">&middot;</span>
      Verified {verificationCount} {verificationCount === 1 ? 'time' : 'times'}
    </span>
  )
}
