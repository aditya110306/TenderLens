// Seed index — compose all data and run scoring engine
import { vendors, Vendor } from './vendors';
import { tenders } from './tenders';
import { generateBids, Bid } from './bids';
import { scoreCase, ScoredCase, computeVendorWinRates } from '../scoring/anomalyEngine';

// Category medians (INR Lakhs) — used in scoring
const CATEGORY_MEDIANS: Record<string, number> = {
  'Medical Supplies': 80, 'Hospital Construction': 2000, 'Pharmaceuticals': 500,
  'Medical Equipment': 400, 'Digital Health': 300, 'Road Construction': 3000,
  'Bridge': 5000, 'Building': 5000, 'Civil Works': 3000, 'Urban Development': 400,
  'Water Supply': 2000, 'Software': 400, 'Hardware': 600, 'Networking': 800,
  'Cybersecurity': 600, 'Data Analytics': 400, 'e-Governance': 300,
  'School Construction': 3000, 'Educational Materials': 200, 'Training': 200,
  'Digital Education': 300, 'Defense Equipment': 5000, 'Security Systems': 2000,
  'Aerospace': 15000, 'Vehicle Fleet': 2000, 'Road Maintenance': 500,
  'Public Transit': 1000, 'Aviation': 8000, 'Waste Management': 1000,
  'Air Quality': 300, 'Water Treatment': 2000, 'Solar Energy': 500,
  'Forestry': 400, 'Social Housing': 5000, 'Welfare Services': 200,
  'Food Supply': 1000, 'Sanitation': 100,
};

export interface SeedData {
  vendors: Vendor[];
  tenders: typeof tenders;
  bids: Bid[];
  cases: ScoredCase[];
  flaggedCases: ScoredCase[];
  stats: {
    totalTenders: number;
    totalVendors: number;
    totalBids: number;
    flaggedCount: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    totalContractValue: number;
    avgRiskScore: number;
  };
}

let _seedData: SeedData | null = null;

export function getSeedData(): SeedData {
  if (_seedData) return _seedData;

  console.log('[Seed] Generating bids...');
  const bids = generateBids();

  // Build bid lookup by tender
  const bidsByTender = new Map<string, Bid[]>();
  for (const bid of bids) {
    const list = bidsByTender.get(bid.tenderId) || [];
    list.push(bid);
    bidsByTender.set(bid.tenderId, list);
  }

  // Compute vendor win rates
  const vendorWinRates = computeVendorWinRates(tenders);

  // Category medians map
  const categoryMediansMap = new Map(Object.entries(CATEGORY_MEDIANS));

  console.log('[Seed] Scoring all cases...');
  const cases: ScoredCase[] = tenders
    .filter(t => t.status === 'awarded')
    .map(t => scoreCase(
      t,
      vendors,
      bidsByTender.get(t.id) || [],
      categoryMediansMap,
      vendorWinRates,
      tenders,
    ));

  const flaggedCases = cases.filter(c => c.flagged);

  // Update vendor stats
  const vendorStats = new Map<string, { wins: number; value: number; flagged: number }>();
  for (const c of cases) {
    if (!c.awardedTo) continue;
    const prev = vendorStats.get(c.awardedTo) || { wins: 0, value: 0, flagged: 0 };
    vendorStats.set(c.awardedTo, {
      wins: prev.wins + 1,
      value: prev.value + (c.awardedValue || 0),
      flagged: prev.flagged + (c.flagged ? 1 : 0),
    });
  }

  // Mutate vendor objects with real stats
  for (const vendor of vendors) {
    const stats = vendorStats.get(vendor.id);
    if (stats) {
      vendor.totalContracts = stats.wins;
      vendor.totalContractsValue = stats.value;
      vendor.flaggedCases = stats.flagged;
      // Win rate across all categories
      const totalBids = stats.wins; // approximation
      vendor.winRate = totalBids > 0 ? Math.min(1, stats.wins / Math.max(1, stats.wins + Math.floor(Math.random() * 3))) : 0;
      // Risk score = average of case risk scores for this vendor
      const vendorCases = cases.filter(c => c.awardedTo === vendor.id);
      if (vendorCases.length > 0) {
        vendor.riskScore = Math.round(vendorCases.reduce((s, c) => s + c.riskScore, 0) / vendorCases.length);
      }
    }
  }

  const totalContractValue = cases.reduce((s, c) => s + (c.awardedValue || 0), 0);
  const avgRiskScore = cases.length > 0 ? cases.reduce((s, c) => s + c.riskScore, 0) / cases.length : 0;

  _seedData = {
    vendors,
    tenders,
    bids,
    cases,
    flaggedCases,
    stats: {
      totalTenders: tenders.length,
      totalVendors: vendors.length,
      totalBids: bids.length,
      flaggedCount: flaggedCases.length,
      criticalCount: cases.filter(c => c.riskLevel === 'critical').length,
      highCount: cases.filter(c => c.riskLevel === 'high').length,
      mediumCount: cases.filter(c => c.riskLevel === 'medium').length,
      totalContractValue,
      avgRiskScore: Math.round(avgRiskScore),
    },
  };

  console.log(`[Seed] Done. ${cases.length} cases scored, ${flaggedCases.length} flagged.`);
  return _seedData;
}

export { vendors, tenders, bids };
