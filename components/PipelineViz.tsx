'use client'

import { Rss, BarChart2, Layers, GitMerge, PenLine, CheckCircle, Globe, ArrowRight } from 'lucide-react'

const steps = [
  { num: 1, title: 'Discover', description: 'RSS + PubMed scan for trending topics', Icon: Rss, color: '#2E8B8B' },
  { num: 2, title: 'Score', description: 'Rate freshness, quality, utility, evidence depth', Icon: BarChart2, color: '#2563eb' },
  { num: 3, title: 'Extract', description: 'Pull factual claims from each source', Icon: Layers, color: '#7c3aed' },
  { num: 4, title: 'Corroborate', description: 'Find supporting Tier 1 & 2 sources', Icon: GitMerge, color: '#059669' },
  { num: 5, title: 'Draft', description: 'Generate structured evidence-based article', Icon: PenLine, color: '#d97706' },
  { num: 6, title: 'Fact-Check', description: 'Second AI pass for accuracy', Icon: CheckCircle, color: '#dc2626' },
  { num: 7, title: 'Publish', description: 'Only Grade A & B make it through', Icon: Globe, color: '#4CAF7A' },
]

export default function PipelineViz() {
  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex items-start gap-2 min-w-max px-1 py-2">
        {steps.map((step, i) => (
          <div key={step.num} className="flex items-start">
            <div
              className={`animate-fade-in-up delay-${step.num} flex flex-col items-center w-32 sm:w-36`}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 border-2 shadow-sm"
                style={{
                  borderColor: step.color,
                  backgroundColor: `${step.color}10`,
                }}
              >
                <step.Icon className="w-6 h-6" style={{ color: step.color }} />
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-wider mb-1"
                style={{ color: step.color }}
              >
                Step {step.num}
              </span>
              <h4 className="text-sm font-bold text-text text-center">{step.title}</h4>
              <p className="text-[11px] text-text-dim text-center mt-1 leading-snug px-1">
                {step.description}
              </p>
            </div>

            {i < steps.length - 1 && (
              <div className="flex items-center pt-5 px-1">
                <ArrowRight className="w-4 h-4 text-border-light" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
