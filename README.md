# TrueRep

An evidence-first fitness news platform that delivers well-researched articles on supplements, races & events, and strength training. Articles are verified across primary sources before publication.

## Tech Stack

- **Framework:** Next.js 16 App Router + TypeScript
- **Database:** Supabase (Postgres)
- **AI:** Venice AI (`llama-3.3-70b` for drafting/scoring, `deepseek-v3.2` for reasoning/fact-check)
- **RSS Parsing:** rss-parser
- **Script Runner:** tsx

## Getting Started

### 1. Clone and install

```bash
npm install
```

### 2. Environment variables

Copy the example file and fill in your keys:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `VENICE_API_KEY` | Venice AI API key |

### 3. Set up the database

Run `supabase/schema.sql` in your Supabase SQL Editor. This creates all tables and inserts the 3 desk rows.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## AI Pipeline

The pipeline ingests news, verifies claims, drafts articles, and publishes them. Run the full pipeline with:

```bash
npx tsx --env-file=.env.local scripts/seed-demo.ts
```

Or run individual steps:

```bash
npx tsx --env-file=.env.local scripts/ingest.ts
npx tsx --env-file=.env.local scripts/score-topics.ts
npx tsx --env-file=.env.local scripts/extract-claims.ts
npx tsx --env-file=.env.local scripts/corroborate.ts
npx tsx --env-file=.env.local scripts/draft-article.ts
npx tsx --env-file=.env.local scripts/fact-check.ts
```

### Pipeline steps

| Step | Script | Description |
|---|---|---|
| 1 | `ingest.ts` | Fetches topics from Google News RSS and PubMed per desk |
| 2 | `score-topics.ts` | Scores topics 0–100 on freshness, source quality, utility, evidence depth |
| 3 | `extract-claims.ts` | Extracts 3–6 verifiable claims from top topics |
| 4 | `corroborate.ts` | Searches PubMed to support or contradict each claim |
| 5 | `draft-article.ts` | Writes a full article from verified claims |
| 6 | `fact-check.ts` | Final LLM review — publishes articles that pass |

### Confidence grades

| Grade | Meaning | Published? |
|---|---|---|
| A | Official source + systematic review + trusted coverage | Yes |
| B | Official source + one strong corroboration | Yes |
| C | Multiple trusted secondaries, no primary source | Yes (framed as "developing") |
| D | Social trend only | No |
| hold | Contradictory evidence | No |

---

## API Reference

Base URL: `http://localhost:3000` (dev) or your deployed URL.

---

### `GET /api/articles`

Returns a list of published articles.

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `desk` | `supplements` \| `races` \| `strength` | Filter by desk |
| `type` | `news_brief` \| `evidence_explainer` \| `practical_guide` \| `event_intelligence` | Filter by article type |
| `limit` | number | Max results (default: 20) |

**Example:**
```
GET /api/articles?desk=supplements&limit=5
```

**Response:**
```json
{
  "articles": [
    {
      "id": "uuid",
      "slug": "vitamin-d3-boosts-immunity-1234567890",
      "desk_id": "supplements",
      "headline": "Vitamin D3 Boosts Immunity",
      "subheadline": "New meta-analysis confirms role in immune regulation",
      "nut_graf": "A large meta-analysis published in...",
      "body_html": "<p>...</p>",
      "article_type": "evidence_explainer",
      "confidence_grade": "B",
      "published_at": "2026-04-02T05:50:55.910083+00:00",
      "desk": {
        "id": "supplements",
        "name": "Supplements",
        "color": "#10b981"
      }
    }
  ]
}
```

---

### `GET /api/articles/[slug]`

Returns a single article with full claims and sources.

**Example:**
```
GET /api/articles/vitamin-d3-boosts-immunity-1234567890
```

**Response:**
```json
{
  "article": {
    "id": "uuid",
    "slug": "vitamin-d3-boosts-immunity-1234567890",
    "headline": "Vitamin D3 Boosts Immunity",
    "body_html": "<p>...</p>",
    "practical_takeaway": "...",
    "what_we_dont_know": "...",
    "source_notes": "...",
    "confidence_grade": "B",
    "medical_disclaimer": true,
    "desk": { "id": "supplements", "name": "Supplements", "color": "#10b981" },
    "claims": [
      {
        "id": "uuid",
        "claim_text": "Vitamin D3 supplementation reduces incidence of respiratory infections.",
        "category": "efficacy",
        "confidence": 0.85,
        "has_tier1_source": true,
        "has_corroboration": true,
        "has_conflict": false,
        "overstatement_flag": false,
        "claim_sources": [
          {
            "relationship": "supports",
            "relevance_note": "Systematic review confirming the claim.",
            "source": {
              "url": "https://pubmed.ncbi.nlm.nih.gov/12345/",
              "title": "Vitamin D and Respiratory Infections: A Systematic Review",
              "tier": 1,
              "publisher": "PubMed"
            }
          }
        ]
      }
    ]
  }
}
```

**Returns `404`** if the article is not found or not published.

---

### `GET /api/pipeline`

Returns the 20 most recent pipeline runs.

**Response:**
```json
{
  "runs": [
    {
      "id": "uuid",
      "desk_id": "supplements",
      "status": "completed",
      "topics_found": 1,
      "claims_extracted": 5,
      "started_at": "2026-04-02T05:50:00+00:00",
      "completed_at": "2026-04-02T05:50:55+00:00",
      "article": {
        "headline": "Vitamin D3 Boosts Immunity",
        "slug": "vitamin-d3-boosts-immunity-1234567890",
        "confidence_grade": "B"
      }
    }
  ]
}
```

---

## Database Schema

| Table | Description |
|---|---|
| `desks` | The 3 content desks (supplements, races, strength) |
| `raw_topics` | Ingested news topics before processing |
| `sources` | All sources found and tiered during pipeline |
| `articles` | Published and draft articles |
| `claims` | Individual verifiable claims extracted per article |
| `claim_sources` | Junction table linking claims to their sources |
| `pipeline_runs` | Log of each pipeline execution |

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── articles/
│   │   │   ├── route.ts          # GET /api/articles
│   │   │   └── [slug]/route.ts   # GET /api/articles/[slug]
│   │   └── pipeline/route.ts     # GET /api/pipeline
├── lib/
│   ├── types.ts                  # Shared TypeScript types
│   ├── constants.ts              # Desks, grades, guardrails
│   ├── supabase.ts               # DB clients + query helpers
│   ├── openrouter.ts             # Venice AI client + generate()
│   └── prompts.ts                # LLM system prompts
├── scripts/
│   ├── seed-demo.ts              # Full pipeline orchestrator
│   ├── ingest.ts
│   ├── score-topics.ts
│   ├── extract-claims.ts
│   ├── corroborate.ts
│   ├── draft-article.ts
│   └── fact-check.ts
└── supabase/
    └── schema.sql                # Full Postgres schema
```
