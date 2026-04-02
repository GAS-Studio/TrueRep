-- TrueRep Database Schema
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS desks (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  color text NOT NULL DEFAULT '#6366f1',
  created_at timestamptz DEFAULT now()
);

INSERT INTO desks (id, name, description, color) VALUES
  ('supplements','Supplements','Evidence-backed supplement news','#10b981'),
  ('races','Races & Events','Official race announcements and event intelligence','#f59e0b'),
  ('strength','Strength Training','Science-based strength and conditioning news','#ef4444')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS sources (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  url text NOT NULL UNIQUE,
  title text NOT NULL,
  publisher text,
  tier int NOT NULL DEFAULT 3,
  tier_justification text,
  source_type text NOT NULL DEFAULT 'article',
  fetch_date timestamptz DEFAULT now(),
  snippet text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS raw_topics (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  desk_id text NOT NULL REFERENCES desks(id),
  title text NOT NULL,
  url text NOT NULL UNIQUE,
  feed_source text NOT NULL,
  published_date timestamptz,
  snippet text,
  score float DEFAULT 0,
  score_breakdown jsonb DEFAULT '{}',
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pipeline_runs (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  desk_id text NOT NULL REFERENCES desks(id),
  status text NOT NULL DEFAULT 'started',
  topic_query text,
  topics_found int DEFAULT 0,
  claims_extracted int DEFAULT 0,
  article_id text,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS articles (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug text NOT NULL UNIQUE,
  desk_id text NOT NULL REFERENCES desks(id),
  pipeline_run_id text REFERENCES pipeline_runs(id),
  headline text NOT NULL,
  subheadline text,
  nut_graf text NOT NULL,
  body_html text NOT NULL,
  body_markdown text,
  practical_takeaway text,
  what_we_dont_know text,
  source_notes text,
  article_type text NOT NULL DEFAULT 'news_brief',
  confidence_grade text NOT NULL DEFAULT 'C',
  confidence_justification text,
  why_this_story text,
  topic_score float DEFAULT 0,
  medical_disclaimer boolean DEFAULT true,
  published boolean DEFAULT false,
  published_at timestamptz,
  last_verified_at timestamptz,
  verification_count int DEFAULT 0,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS claims (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  article_id text NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  claim_text text NOT NULL,
  claim_order int NOT NULL DEFAULT 0,
  category text,
  confidence float DEFAULT 0,
  has_tier1_source boolean DEFAULT false,
  has_corroboration boolean DEFAULT false,
  has_conflict boolean DEFAULT false,
  conflict_description text,
  fact_check_passed boolean,
  fact_check_notes text,
  overstatement_flag boolean DEFAULT false,
  uncited_flag boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS claim_sources (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  claim_id text NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  source_id text NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  relationship text NOT NULL DEFAULT 'supports',
  relevance_note text,
  UNIQUE(claim_id, source_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS articles_desk_idx ON articles(desk_id);
CREATE INDEX IF NOT EXISTS articles_published_idx ON articles(published) WHERE published=true;
CREATE INDEX IF NOT EXISTS claims_article_idx ON claims(article_id);
CREATE INDEX IF NOT EXISTS claim_sources_claim_idx ON claim_sources(claim_id);
CREATE INDEX IF NOT EXISTS raw_topics_desk_idx ON raw_topics(desk_id);
CREATE INDEX IF NOT EXISTS sources_tier_idx ON sources(tier);
