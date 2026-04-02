import { NextResponse } from 'next/server'
import { getPipelineRuns } from '@/lib/supabase'

export async function GET() {
  try {
    const runs = await getPipelineRuns(20)
    return NextResponse.json({ runs })
  } catch (err) {
    console.error('[GET /api/pipeline]', err)
    return NextResponse.json({ error: 'Failed to fetch pipeline runs' }, { status: 500 })
  }
}
