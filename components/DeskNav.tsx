'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DESKS } from '@/lib/constants'
import type { DeskId } from '@/lib/types'

const deskList = Object.values(DESKS)
const deskColors: Record<string, string> = {
  supplements: '#2D6A4F',
  races: '#B8860B',
  strength: '#8B2500',
}

export default function DeskNav({ activeDesk }: { activeDesk?: DeskId }) {
  const pathname = usePathname()

  return (
    <div className="flex gap-2">
      {deskList.map((desk) => {
        const isActive = activeDesk === desk.id || pathname === `/${desk.id}`
        const color = deskColors[desk.id]
        return (
          <Link
            key={desk.id}
            href={`/${desk.id}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive ? 'text-white' : 'text-text-muted border border-border hover:border-border-light'
            }`}
            style={isActive ? { backgroundColor: color } : undefined}
          >
            {desk.name}
          </Link>
        )
      })}
    </div>
  )
}
