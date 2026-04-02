import { Sparkles } from 'lucide-react'

export default function WhyThisStory({
  text,
  topicScore,
}: {
  text: string | null
  topicScore: number
}) {
  if (!text) return null

  return (
    <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-secondary" />
        <h4 className="text-sm font-bold text-text">Why this story today?</h4>
      </div>
      <p className="text-sm text-text-muted leading-relaxed">{text}</p>
      {topicScore > 0 && (
        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-medium bg-secondary/15 text-secondary">
          Topic relevance: {topicScore}/100
        </span>
      )}
    </div>
  )
}
