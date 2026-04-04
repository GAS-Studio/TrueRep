'use client'

import { useState, useEffect } from 'react'

export default function StickyArticleBar({
  headline,
  desk,
}: {
  headline: string
  desk: string
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={`sticky-article-bar ${visible ? 'visible' : ''} fixed top-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-border`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
        <span className="small-caps text-[10px] font-semibold text-text-dim tracking-widest shrink-0">{desk}</span>
        <span className="text-border">|</span>
        <span className="font-headline text-sm font-bold text-text truncate">{headline}</span>
      </div>
    </div>
  )
}
