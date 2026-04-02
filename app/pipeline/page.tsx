import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ShieldCheck, Layers, CheckCircle, Award } from 'lucide-react'
import type { PipelineRun, DeskId } from '@/lib/types'
import { DESKS } from '@/lib/constants'
import PipelineViz from '@/components/PipelineViz'

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

const statusStyles: Record<string, string> = {
  completed: 'bg-grade-a/15 text-grade-a',
  running: 'bg-grade-c/15 text-grade-c',
  started: 'bg-grade-b/15 text-grade-b',
  failed: 'bg-grade-d/15 text-grade-d',
}

export default async function PipelinePage() {
  const runs = await getPipelineRuns()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text mb-3">The Evidence Pipeline</h1>
        <p className="text-text-muted text-lg max-w-2xl">
          Every article passes through a 7-step automated pipeline. AI discovers stories,
          gathers sources, compares claims, and drafts - but only publishes when the evidence
          stack is strong enough.
        </p>
      </div>

      {/* Pipeline visualization */}
      <div className="mb-12 p-6 rounded-xl bg-card border border-border overflow-hidden">
        <PipelineViz />
      </div>

      {/* Quality callouts */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-text mb-6">How it ensures quality</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { Icon: ShieldCheck, title: 'Tier 1 Sources Required', desc: 'NIH, FDA, PubMed, CDC, ACSM, or official event organizers', color: '#10b981' },
            { Icon: Layers, title: '3+ Corroborating Sources', desc: 'Every key claim needs independent supporting evidence', color: '#3b82f6' },
            { Icon: CheckCircle, title: 'Second AI Fact-Check', desc: 'Separate model verifies every numeric claim, citation, and guardrail', color: '#f59e0b' },
            { Icon: Award, title: 'Only Grade A & B Published', desc: 'Grade C gets "what we know so far" framing. D never publishes.', color: '#4CAF7A' },
          ].map((item) => (
            <div key={item.title} className="rounded-xl bg-card border border-border p-5">
              <item.Icon className="w-6 h-6 mb-3" style={{ color: item.color }} />
              <h3 className="text-sm font-bold text-text mb-1">{item.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent runs table */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-text mb-6">Recent Pipeline Runs</h2>
        {runs.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-card border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">Desk</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">Topics</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">Claims</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">Article</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">Started</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => {
                  const desk = DESKS[run.desk_id as DeskId]
                  const article = run.article as { headline: string; slug: string; confidence_grade: string } | null | undefined
                  return (
                    <tr key={run.id} className="border-b border-border/50 hover:bg-card/50">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium" style={{ color: desk?.color }}>
                          {desk?.name || run.desk_id}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[run.status] || 'bg-card text-text-dim'}`}>
                          {run.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-muted">{run.topics_found}</td>
                      <td className="px-4 py-3 text-text-muted">{run.claims_extracted}</td>
                      <td className="px-4 py-3">
                        {article ? (
                          <Link
                            href={`/article/${article.slug}`}
                            className="text-secondary hover:text-accent transition-colors text-sm truncate max-w-[200px] inline-block"
                          >
                            {article.headline}
                          </Link>
                        ) : (
                          <span className="text-text-dim text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-dim text-xs">
                        {formatDistanceToNow(new Date(run.started_at), { addSuffix: true })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 rounded-xl bg-card border border-border">
            <p className="text-text-muted">No pipeline runs yet.</p>
            <p className="text-text-dim text-sm mt-1">Run the seed script to populate data.</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="text-center py-8 rounded-xl bg-card border border-border">
        <p className="text-text-muted mb-3">Want to see a full article with evidence cards?</p>
        <Link
          href="/supplements"
          className="inline-flex px-6 py-3 rounded-full bg-accent text-bg font-bold text-sm hover:bg-accent-light transition-colors"
        >
          Browse Supplements Desk
        </Link>
      </div>
    </div>
  )
}
