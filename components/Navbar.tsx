'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ShieldCheck, Menu, X } from 'lucide-react'
import { DESKS } from '@/lib/constants'

const deskList = Object.values(DESKS)

const navLinks = [
  { href: '/', label: 'Home' },
  ...deskList.map((d) => ({ href: `/${d.id}`, label: d.name, color: d.color })),
  { href: '/pipeline', label: 'Pipeline' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <ShieldCheck className="w-7 h-7 text-accent" />
            <span className="text-xl font-bold tracking-tight text-text">
              True<span className="text-accent">Rep</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    color: isActive && 'color' in link ? link.color : undefined,
                    backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : undefined,
                  }}
                >
                  <span
                    className={`${isActive ? 'text-inherit' : 'text-text-muted hover:text-text'} transition-colors`}
                    onMouseEnter={(e) => {
                      if ('color' in link && link.color) {
                        (e.target as HTMLElement).style.color = link.color
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.target as HTMLElement).style.color = ''
                      }
                    }}
                  >
                    {link.label}
                  </span>
                </Link>
              )
            })}
          </nav>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-text-muted hover:text-text hover:bg-card transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <nav className="md:hidden pb-4 space-y-1 border-t border-border pt-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    color: isActive && 'color' in link ? link.color : undefined,
                    backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : undefined,
                  }}
                >
                  <span className={isActive ? '' : 'text-text-muted'}>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        )}
      </div>
    </header>
  )
}
