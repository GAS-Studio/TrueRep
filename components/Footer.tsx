import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { DESKS, ARTICLE_TYPES } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-6 h-6 text-accent" />
              <span className="text-lg font-bold text-text tracking-tight">
                True<span className="text-accent">Rep</span>
              </span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              Evidence-first fitness news. Every claim backed by primary sources.
            </p>
            <p className="text-xs text-text-dim mt-3 italic">
              &quot;Discovery can be social. Truth must be primary-source.&quot;
            </p>
          </div>

          {/* Desks */}
          <div>
            <h4 className="text-text font-semibold text-xs uppercase tracking-wider mb-3">Desks</h4>
            <ul className="space-y-2">
              {Object.values(DESKS).map((desk) => (
                <li key={desk.id}>
                  <Link
                    href={`/${desk.id}`}
                    className="text-sm text-text-muted hover:text-text transition-colors"
                  >
                    {desk.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Article Types */}
          <div>
            <h4 className="text-text font-semibold text-xs uppercase tracking-wider mb-3">Formats</h4>
            <ul className="space-y-2">
              {Object.values(ARTICLE_TYPES).map((t) => (
                <li key={t.label}>
                  <span className="text-sm text-text-muted">{t.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-text font-semibold text-xs uppercase tracking-wider mb-3">About</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/pipeline" className="text-sm text-text-muted hover:text-text transition-colors">
                  Evidence Pipeline
                </Link>
              </li>
              <li>
                <span className="text-sm text-text-muted">Built by GAS Studio</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6">
          <p className="text-xs text-text-dim text-center">
            TrueRep does not provide medical advice. All content is for informational purposes only.
            Always consult a healthcare professional before making health decisions.
          </p>
          <p className="mt-3 text-xs text-text-dim/60 text-center">
            &copy; {new Date().getFullYear()} GAS Studio. Powered by OpenRouter &amp; Supabase.
          </p>
        </div>
      </div>
    </footer>
  )
}
