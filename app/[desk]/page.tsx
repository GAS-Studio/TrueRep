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

const validDesks = new Set<string>(['supplements', 'races', 'strength'])

export default async function DeskPage({
  params,
}: {
  params: Promise<{ desk: string }>
}) {
  const { desk } = await params

  if (!validDesks.has(desk)) {
    notFound()
  }

  const deskId = desk as DeskId
  const deskMeta = DESKS[deskId]
  const articles = await getArticles(deskId)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <DeskNav activeDesk={deskId} />

      {/* Desk header */}
      <div className="mt-8 mb-8">
        <div className="w-16 h-1 rounded-full mb-4" style={{ backgroundColor: deskMeta.color }} />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text mb-2">{deskMeta.name}</h1>
        <p className="text-text-muted text-lg">{deskMeta.description}</p>
      </div>

      <FilteredArticles articles={articles} />
    </div>
  )
}

export function generateStaticParams() {
  return [
    { desk: 'supplements' },
    { desk: 'races' },
    { desk: 'strength' },
  ]
}
