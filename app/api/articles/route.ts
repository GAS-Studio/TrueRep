import { NextRequest, NextResponse } from 'next/server'
import { getArticles } from '@/lib/supabase'
import type { DeskId, ArticleType } from '@/lib/types'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const desk = searchParams.get('desk') as DeskId | null
  const type = searchParams.get('type') as ArticleType | null
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? parseInt(limitParam, 10) : 20

  try {
    const articles = await getArticles({
      ...(desk ? { desk } : {}),
      ...(type ? { type } : {}),
      limit: isNaN(limit) ? 20 : limit,
    })
    return NextResponse.json({ articles })
  } catch (err) {
    console.error('[GET /api/articles]', err)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}
