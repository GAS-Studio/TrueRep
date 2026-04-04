import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { DESKS } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="bg-primary text-white/70 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-white font-bold text-xs font-headline">TR</span>
              </div>
              <span className="font-headline text-lg font-bold text-white">TrueRep</span>
            </div>
            <p className="text-sm leading-relaxed text-white/50">
              Evidence-first fitness news. Every claim backed by primary sources.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Desks</h4>
            <ul className="space-y-2">
              {Object.values(DESKS).map((desk) => (
                <li key={desk.id}>
                  <Link href={`/${desk.id}`} className="text-sm hover:text-white transition-colors">
                    {desk.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">About</h4>
            <ul className="space-y-2">
              <li><Link href="/pipeline" className="text-sm hover:text-white transition-colors">Evidence Pipeline</Link></li>
              <li><span className="text-sm">Built by GAS Studio</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} GAS Studio. Powered by OpenRouter &amp; Supabase.
          </p>
          <p className="text-xs text-white/30">
            Content is for informational purposes only. Not medical advice.
          </p>
        </div>
      </div>
    </footer>
  )
}
