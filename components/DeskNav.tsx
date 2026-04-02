'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DESKS } from '@/lib/constants'
import type { DeskId } from '@/lib/types'

const deskList = Object.values(DESKS)

export default function DeskNav({ activeDesk }: { activeDesk?: DeskId }) {
  const pathname = usePathname()

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {deskList.map((desk) => {
        const isActive = activeDesk === desk.id || pathname === `/${desk.id}`
        return (
          <Link
            key={desk.id}
            href={`/${desk.id}`}
            className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border"
            style={{
              backgroundColor: isActive ? desk.color : 'transparent',
              borderColor: isActive ? desk.color : 'var(--color-border)',
              color: isActive ? '#030712' : desk.color,
            }}
          >
            {desk.name}
          </Link>
        )
      })}
    </div>
  )
}
