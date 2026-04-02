import type { SourceTier } from './types'

interface CuratedSource {
  url: string
  publisher: string
  tier: SourceTier
  title: string
  source_type: string
}

export const CURATED_SOURCES: Record<string, CuratedSource[]> = {
  supplements: [
    // TIER 1 — Source of Truth
    {
      url: 'https://ods.od.nih.gov/factsheets/list-all/',
      publisher: 'NIH Office of Dietary Supplements',
      tier: 1,
      title: 'NIH ODS — Complete Supplement Fact Sheets',
      source_type: 'government',
    },
    {
      url: 'https://www.fda.gov/food/dietary-supplements',
      publisher: 'FDA',
      tier: 1,
      title: 'FDA — Dietary Supplements Information Hub',
      source_type: 'government',
    },
    {
      url: 'https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts',
      publisher: 'FDA',
      tier: 1,
      title: 'FDA — Safety Recalls and Alerts',
      source_type: 'government',
    },
    {
      url: 'https://pubmed.ncbi.nlm.nih.gov/?term=creatine+meta-analysis&sort=date',
      publisher: 'PubMed',
      tier: 1,
      title: 'PubMed — Creatine Meta-analyses (latest)',
      source_type: 'peer_review',
    },
    {
      url: 'https://pubmed.ncbi.nlm.nih.gov/?term=protein+supplementation+systematic+review&sort=date',
      publisher: 'PubMed',
      tier: 1,
      title: 'PubMed — Protein Supplementation Systematic Reviews',
      source_type: 'peer_review',
    },
    {
      url: 'https://pubmed.ncbi.nlm.nih.gov/?term=pre-workout+supplement+safety+RCT&sort=date',
      publisher: 'PubMed',
      tier: 1,
      title: 'PubMed — Pre-Workout Supplement Safety Trials',
      source_type: 'peer_review',
    },
    // TIER 2 — Strong Corroboration
    {
      url: 'https://examine.com/supplements/',
      publisher: 'Examine.com',
      tier: 2,
      title: 'Examine.com — Supplement Research Summaries',
      source_type: 'research_org',
    },
    {
      url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/supplements/art-20044894',
      publisher: 'Mayo Clinic',
      tier: 2,
      title: 'Mayo Clinic — Dietary Supplements Overview',
      source_type: 'hospital',
    },
  ],

  races: [
    // TIER 1 — Source of Truth
    {
      url: 'https://www.worldathletics.org/competition/calendar',
      publisher: 'World Athletics',
      tier: 1,
      title: 'World Athletics — Official Competition Calendar',
      source_type: 'governing_body',
    },
    {
      url: 'https://www.ironman.com/races',
      publisher: 'IRONMAN',
      tier: 1,
      title: 'IRONMAN — Official Race Calendar',
      source_type: 'official_organizer',
    },
    {
      url: 'https://www.baa.org/',
      publisher: 'Boston Athletic Association',
      tier: 1,
      title: 'Boston Athletic Association — Official Site',
      source_type: 'official_organizer',
    },
    {
      url: 'https://www.worldmarathonmajors.com/',
      publisher: 'World Marathon Majors',
      tier: 1,
      title: 'World Marathon Majors — Official Site',
      source_type: 'governing_body',
    },
    {
      url: 'https://www.usatriathlon.org/events',
      publisher: 'USA Triathlon',
      tier: 1,
      title: 'USA Triathlon — Official Events',
      source_type: 'governing_body',
    },
    // TIER 2 — Strong Corroboration
    {
      url: 'https://www.runnersworld.com/races-places/',
      publisher: "Runner's World",
      tier: 2,
      title: "Runner's World — Race Coverage",
      source_type: 'sports_media',
    },
    {
      url: 'https://www.outsideonline.com/category/run/',
      publisher: 'Outside Online',
      tier: 2,
      title: 'Outside Online — Running Coverage',
      source_type: 'sports_media',
    },
  ],

  strength: [
    // TIER 1 — Source of Truth
    {
      url: 'https://www.cdc.gov/physicalactivity/basics/adults/index.htm',
      publisher: 'CDC',
      tier: 1,
      title: 'CDC — Physical Activity Guidelines for Adults',
      source_type: 'government',
    },
    {
      url: 'https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines',
      publisher: 'HHS',
      tier: 1,
      title: 'HHS — Physical Activity Guidelines for Americans',
      source_type: 'government',
    },
    {
      url: 'https://www.acsm.org/education-resources/trending-topics-resources/physical-activity-guidelines',
      publisher: 'ACSM',
      tier: 1,
      title: 'ACSM — Exercise Guidelines and Position Stands',
      source_type: 'medical_body',
    },
    {
      url: 'https://pubmed.ncbi.nlm.nih.gov/?term=resistance+training+hypertrophy+meta-analysis&sort=date',
      publisher: 'PubMed',
      tier: 1,
      title: 'PubMed — Resistance Training Hypertrophy Meta-analyses',
      source_type: 'peer_review',
    },
    {
      url: 'https://pubmed.ncbi.nlm.nih.gov/?term=strength+training+women+systematic+review&sort=date',
      publisher: 'PubMed',
      tier: 1,
      title: 'PubMed — Strength Training in Women Reviews',
      source_type: 'peer_review',
    },
    {
      url: 'https://pubmed.ncbi.nlm.nih.gov/?term=progressive+overload+muscle+strength+review&sort=date',
      publisher: 'PubMed',
      tier: 1,
      title: 'PubMed — Progressive Overload and Muscle Strength',
      source_type: 'peer_review',
    },
    // TIER 2 — Strong Corroboration
    {
      url: 'https://www.nsca.com/education/articles/',
      publisher: 'NSCA',
      tier: 2,
      title: 'NSCA — Strength and Conditioning Research Articles',
      source_type: 'medical_body',
    },
    {
      url: 'https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/strength-training/art-20046670',
      publisher: 'Mayo Clinic',
      tier: 2,
      title: 'Mayo Clinic — Strength Training Guide',
      source_type: 'hospital',
    },
  ],
}
