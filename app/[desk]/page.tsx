import { notFound } from 'next/navigation'
import { DESKS } from '@/lib/constants'
import type { DeskId, Article } from '@/lib/types'
import DeskNav from '@/components/DeskNav'
import FilteredArticles from './FilteredArticles'

async function getArticles(desk: DeskId): Promise<Article[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/articles?desk=${desk}&limit=50`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.articles || []
  } catch {
    return []
  }
}

const deskColors: Record<string, string> = {
  supplements: '#2D6A4F',
  races: '#B8860B',
  strength: '#8B2500',
}

const validDesks = new Set<string>(['supplements', 'races', 'strength'])

export default async function DeskPage({ params }: { params: Promise<{ desk: string }> }) {
  const { desk } = await params
  if (!validDesks.has(desk)) notFound()

  const deskId = desk as DeskId
  const deskMeta = DESKS[deskId]
  const articles = await getArticles(deskId)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <DeskNav activeDesk={deskId} />

      <div className="mt-8 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: deskColors[deskId] }} />
          <h1 className="font-headline text-4xl font-bold text-text">{deskMeta.name}</h1>
        </div>
        <p className="text-text-muted text-lg ml-5">{deskMeta.description}</p>
      </div>

      <FilteredArticles articles={articles} />
    </div>
  )
}

export function generateStaticParams() {
  return [{ desk: 'supplements' }, { desk: 'races' }, { desk: 'strength' }]
}
