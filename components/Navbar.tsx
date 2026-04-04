'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { DESKS } from '@/lib/constants'

const deskList = Object.values(DESKS)
const deskColors: Record<string, string> = {
  supplements: '#2D6A4F',
  races: '#B8860B',
  strength: '#8B2500',
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Masthead */}
        <div className="flex items-center justify-between py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm font-headline">TR</span>
            </div>
            <div>
              <h1 className="font-headline text-2xl font-bold tracking-tight text-text leading-none">
                TrueRep
              </h1>
              <p className="text-[10px] text-text-dim tracking-[0.15em] uppercase">
                Evidence-First Fitness News
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {deskList.map((desk) => {
              const isActive = pathname === `/${desk.id}`
              return (
                <Link
                  key={desk.id}
                  href={`/${desk.id}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-white'
                      : 'text-text-muted hover:bg-card-hover'
                  }`}
                  style={isActive ? { backgroundColor: deskColors[desk.id] } : undefined}
                >
                  {desk.name}
                </Link>
              )
            })}
            <Link
              href="/pipeline"
              className="px-4 py-2 rounded-lg text-sm font-medium text-text-dim hover:text-text hover:bg-card-hover transition-all"
            >
              Our Process
            </Link>
          </nav>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-card-hover"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {open && (
          <nav className="md:hidden pb-4 space-y-1 border-t border-border pt-3">
            {deskList.map((desk) => (
              <Link
                key={desk.id}
                href={`/${desk.id}`}
                onClick={() => setOpen(false)}
                className="block py-2 px-3 rounded-lg text-sm text-text-muted hover:bg-card-hover"
              >
                {desk.name}
              </Link>
            ))}
            <Link href="/pipeline" onClick={() => setOpen(false)} className="block py-2 px-3 rounded-lg text-sm text-text-dim">
              Our Process
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
