import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { PipelineRun, DeskId } from '@/lib/types'
import { DESKS } from '@/lib/constants'

async function getPipelineRuns(): Promise<PipelineRun[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/pipeline`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.runs || []
  } catch {
    return []
  }
}

const steps = [
  { num: 1, title: 'Discover', desc: 'Scan RSS feeds, PubMed, and official sources for trending fitness topics.' },
  { num: 2, title: 'Score', desc: 'Rate each topic on freshness, source quality, reader utility, and evidence depth.' },
  { num: 3, title: 'Extract Claims', desc: 'Pull specific, testable factual claims from each source.' },
  { num: 4, title: 'Corroborate', desc: 'Search for supporting or contradicting Tier 1 and Tier 2 sources.' },
  { num: 5, title: 'Draft', desc: 'Generate a structured, evidence-based article from verified claims.' },
  { num: 6, title: 'Fact-Check', desc: 'A second AI pass verifies every numeric claim, citation, and guardrail.' },
  { num: 7, title: 'Publish', desc: 'Only articles with Grade A or B evidence are published.' },
]

export default async function PipelinePage() {
  const runs = await getPipelineRuns()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="rule mb-6" />
      <h1 className="font-headline text-4xl font-bold text-text mb-3">Our Process</h1>
      <p className="text-text-muted text-lg italic mb-8">
        Every article passes through a seven-step automated pipeline. Discovery can be social.
        Truth must be primary-source.
      </p>

      {/* Steps */}
      <div className="space-y-6 mb-12">
        {steps.map((step) => (
          <div key={step.num} className="flex gap-4">
            <span className="font-headline text-2xl font-bold text-border-light w-8 shrink-0">{step.num}</span>
            <div>
              <h3 className="font-headline text-lg font-bold text-text">{step.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent runs */}
      <div className="rule mb-6" />
      <h2 className="font-headline text-2xl font-bold text-text mb-6">Recent Pipeline Runs</h2>

      {runs.length > 0 ? (
        <div className="space-y-4">
          {runs.map((run) => {
            const desk = DESKS[run.desk_id as DeskId]
            const article = run.article as { headline: string; slug: string } | null | undefined
            return (
              <div key={run.id} className="flex items-start gap-4 py-3 border-b border-border">
                <span className="small-caps text-xs text-text-dim w-24 shrink-0">{desk?.name}</span>
                <div className="flex-1 min-w-0">
                  {article ? (
                    <Link href={`/article/${article.slug}`} className="text-sm text-text hover:text-secondary transition-colors font-medium">
                      {article.headline}
                    </Link>
                  ) : (
                    <span className="text-sm text-text-dim italic">No article produced</span>
                  )}
                  <div className="text-xs text-text-dim mt-0.5">
                    {run.topics_found} topics, {run.claims_extracted} claims &middot; {run.status}
                  </div>
                </div>
                <span className="text-xs text-text-dim shrink-0">
                  {formatDistanceToNow(new Date(run.started_at), { addSuffix: true })}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-text-dim italic py-8 text-center">No pipeline runs yet.</p>
      )}

      <div className="py-8 text-center">
        <Link href="/" className="text-sm text-text-dim hover:text-text transition-colors">
          &larr; Back to the front page
        </Link>
      </div>
    </div>
  )
}
