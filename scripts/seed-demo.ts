import { runIngest } from './ingest'
import { runScoreTopics } from './score-topics'
import { runExtractClaims } from './extract-claims'
import { runCorroborate } from './corroborate'
import { runDraftArticle } from './draft-article'
import { runFactCheck } from './fact-check'
import { supabaseAdmin } from '../lib/supabase'
import type { Article } from '../lib/types'

async function main() {
  console.log('🚀 Starting TrueRep pipeline...')
  console.log('='.repeat(60))

  // Step 1: Ingest topics from RSS feeds
  console.log('\n📡 Step 1: Ingesting topics...')
  try {
    await runIngest()
  } catch (err) {
    console.error('❌ Ingest failed:', err)
    console.log('   Continuing with existing topics...')
  }

  // Step 2: Score topics
  console.log('\n📊 Step 2: Scoring topics...')
  try {
    await runScoreTopics()
  } catch (err) {
    console.error('❌ Score-topics failed:', err)
    console.log('   Continuing with existing scores...')
  }

  // Step 3: Extract claims from top topics
  console.log('\n🔍 Step 3: Extracting claims...')
  try {
    await runExtractClaims()
  } catch (err) {
    console.error('❌ Extract-claims failed:', err)
    console.log('   Continuing with existing claims...')
  }

  // Step 4: Corroborate claims with additional sources
  console.log('\n🔗 Step 4: Corroborating claims...')
  try {
    await runCorroborate()
  } catch (err) {
    console.error('❌ Corroborate failed:', err)
    console.log('   Continuing with existing corroboration...')
  }

  // Step 5: Draft articles from verified claims
  console.log('\n✍️  Step 5: Drafting articles...')
  try {
    await runDraftArticle()
  } catch (err) {
    console.error('❌ Draft-article failed:', err)
    console.log('   Continuing with existing drafts...')
  }

  // Step 6: Fact-check and publish
  console.log('\n✅ Step 6: Fact-checking and publishing...')
  try {
    await runFactCheck()
  } catch (err) {
    console.error('❌ Fact-check failed:', err)
    console.log('   Continuing...')
  }

  // Step 7: Summary
  console.log('\n' + '='.repeat(60))

  const { data: published } = await supabaseAdmin
    .from('articles')
    .select('headline, desk_id, confidence_grade')
    .eq('published', true)
    .order('published_at', { ascending: false })

  const articles = (published ?? []) as Pick<Article, 'headline' | 'desk_id' | 'confidence_grade'>[]

  console.log(`\n✅ Pipeline complete. ${articles.length} article(s) published.\n`)

  if (articles.length > 0) {
    // Print summary table
    const col1 = 20
    const col2 = 60
    const col3 = 8
    console.log(
      'Desk'.padEnd(col1) +
      'Headline'.padEnd(col2) +
      'Grade'.padEnd(col3),
    )
    console.log('-'.repeat(col1 + col2 + col3))
    for (const a of articles) {
      console.log(
        a.desk_id.padEnd(col1) +
        a.headline.slice(0, col2 - 2).padEnd(col2) +
        a.confidence_grade.padEnd(col3),
      )
    }
  } else {
    console.log('No articles were published. Check the logs above for errors.')
    console.log('Tips:')
    console.log('  - Verify your .env.local has valid SUPABASE and OPENROUTER credentials')
    console.log('  - Run npx tsx scripts/ingest.ts standalone to debug ingestion')
    console.log('  - Free-tier OpenRouter models may have rate limits or downtime')
  }
}

main().catch((err) => {
  console.error('\n💥 Pipeline crashed:', err)
  process.exit(1)
})
