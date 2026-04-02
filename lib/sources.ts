export const CURATED_SOURCES = {
  supplements: [
    // Tier 1 - Source of Truth
    { url: 'https://ods.od.nih.gov/factsheets/list-all/', publisher: 'NIH ODS', tier: 1, title: 'NIH Office of Dietary Supplements - All Fact Sheets', source_type: 'government' },
    { url: 'https://www.fda.gov/food/dietary-supplements', publisher: 'FDA', tier: 1, title: 'FDA Dietary Supplements Information', source_type: 'government' },
    { url: 'https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts', publisher: 'FDA', tier: 1, title: 'FDA Safety Recalls and Alerts', source_type: 'government' },
    { url: 'https://pubmed.ncbi.nlm.nih.gov/?term=creatine+systematic+review&sort=date', publisher: 'PubMed', tier: 1, title: 'PubMed - Creatine Systematic Reviews', source_type: 'peer_review' },
    { url: 'https://pubmed.ncbi.nlm.nih.gov/?term=protein+supplementation+meta-analysis&sort=date', publisher: 'PubMed', tier: 1, title: 'PubMed - Protein Supplementation Meta-analyses', source_type: 'peer_review' },
    // Tier 2 - Strong Corroboration
    { url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/supplements/art-20044894', publisher: 'Mayo Clinic', tier: 2, title: 'Mayo Clinic - Supplements Overview', source_type: 'hospital' },
    { url: 'https://examine.com/supplements/', publisher: 'Examine.com', tier: 2, title: 'Examine.com Supplement Research Database', source_type: 'research_org' },
  ],
  races: [
    // Tier 1
    { url: 'https://www.worldathletics.org/competition/calendar', publisher: 'World Athletics', tier: 1, title: 'World Athletics Official Competition Calendar', source_type: 'governing_body' },
    { url: 'https://www.ironman.com/races', publisher: 'IRONMAN', tier: 1, title: 'IRONMAN Official Race Calendar', source_type: 'official_organizer' },
    { url: 'https://www.baa.org/', publisher: 'Boston Athletic Association', tier: 1, title: 'Boston Marathon Official Site', source_type: 'official_organizer' },
    { url: 'https://www.wma.org/', publisher: 'World Marathon Majors', tier: 1, title: 'World Marathon Majors', source_type: 'governing_body' },
    // Tier 2
    { url: 'https://www.runnersworld.com/races-places/', publisher: "Runner's World", tier: 2, title: "Runner's World Races Section", source_type: 'news' },
    { url: 'https://www.flotrack.org/', publisher: 'FloTrack', tier: 2, title: 'FloTrack - Track and Field News', source_type: 'sports_media' },
  ],
  strength: [
    // Tier 1
    { url: 'https://www.cdc.gov/physicalactivity/basics/adults/index.htm', publisher: 'CDC', tier: 1, title: 'CDC Physical Activity Guidelines for Adults', source_type: 'government' },
    { url: 'https://www.hhs.gov/fitness/be-active/physical-activity-guidelines-for-americans/index.html', publisher: 'HHS', tier: 1, title: 'HHS Physical Activity Guidelines for Americans', source_type: 'government' },
    { url: 'https://www.acsm.org/education-resources/trending-topics-resources/physical-activity-guidelines', publisher: 'ACSM', tier: 1, title: 'ACSM Physical Activity Guidelines', source_type: 'medical_body' },
    { url: 'https://pubmed.ncbi.nlm.nih.gov/?term=resistance+training+systematic+review&sort=date', publisher: 'PubMed', tier: 1, title: 'PubMed - Resistance Training Reviews', source_type: 'peer_review' },
    { url: 'https://pubmed.ncbi.nlm.nih.gov/?term=strength+training+women+meta-analysis&sort=date', publisher: 'PubMed', tier: 1, title: 'PubMed - Strength Training Women Reviews', source_type: 'peer_review' },
    // Tier 2
    { url: 'https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/strength-training/art-20046670', publisher: 'Mayo Clinic', tier: 2, title: 'Mayo Clinic - Strength Training Guide', source_type: 'hospital' },
    { url: 'https://www.nsca.com/education/articles/', publisher: 'NSCA', tier: 2, title: 'NSCA Strength & Conditioning Articles', source_type: 'medical_body' },
  ],
}
