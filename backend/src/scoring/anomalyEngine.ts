// Anomaly scoring engine — deterministic rule-based scoring for ProcureGuard AI

import { Tender } from '../seed/tenders';
import { Vendor } from '../seed/vendors';
import { Bid } from '../seed/bids';

export interface Signal {
  rule: string;
  label: string;
  description: string;
  triggered: boolean;
  score: number;
  maxScore: number;
  weight: number;    // 0-1 fraction of total
  evidence: string[];
}

export interface ScoredCase {
  id: string;
  tenderId: string;
  title: string;
  department: string;
  category: string;
  location: string;
  referenceNo: string;
  description: string;
  publishedAt: string;
  closingDate: string;
  awardedAt: string | null;
  estimatedValue: number;
  awardedValue: number | null;
  awardedTo: string | null;
  awardedToName: string | null;
  status: string;
  riskScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'clear';
  signals: Signal[];
  flagged: boolean;
  caseStatus: 'new' | 'under_review' | 'escalated' | 'resolved';
  assignee: string | null;
  notes: string[];
  auditTrail: AuditEntry[];
  createdAt: string;
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  actor: string;
  detail: string;
}

// Vendor win-rate tracking
export function computeVendorWinRates(tenders: Tender[]): Map<string, Map<string, { wins: number; total: number }>> {
  const map = new Map<string, Map<string, { wins: number; total: number }>>();

  for (const t of tenders) {
    if (t.status !== 'awarded' || !t.awardedTo) continue;
    const category = t.category;
    if (!map.has(category)) map.set(category, new Map());
    const catMap = map.get(category)!;

    // Count winning vendor
    const prev = catMap.get(t.awardedTo) || { wins: 0, total: 0 };
    catMap.set(t.awardedTo, { wins: prev.wins + 1, total: prev.total + 1 });

    // Count all bidders (approximated — award counts as participation)
  }

  return map;
}

export function scoreCase(
  tender: Tender,
  vendors: Vendor[],
  bidsForTender: Bid[],
  categoryMedians: Map<string, number>,
  vendorWinRates: Map<string, Map<string, { wins: number; total: number }>>,
  allTenders: Tender[],
): ScoredCase {
  const vendorMap = new Map(vendors.map(v => [v.id, v]));
  const awardedVendor = tender.awardedTo ? vendorMap.get(tender.awardedTo) : null;

  const signals: Signal[] = [];
  let totalScore = 0;

  // ── RULE 1: Single Bidder ───────────────────────────────────────────────
  const singleBidder = tender.isSingleBidder === true ||
    (bidsForTender.filter(b => !b.disqualified).length === 1);
  signals.push({
    rule: 'single_bidder',
    label: 'Single Bidder Pattern',
    description: 'Tender received only one valid bid, limiting competitive pricing assurance.',
    triggered: singleBidder,
    score: singleBidder ? 25 : 0,
    maxScore: 25,
    weight: 0.25,
    evidence: singleBidder
      ? [`Only ${bidsForTender.filter(b => !b.disqualified).length} qualifying bid received out of ${bidsForTender.length} submissions`, 'Industry expectation: minimum 3 competitive bids for this category']
      : [],
  });
  if (singleBidder) totalScore += 25;

  // ── RULE 2: Price Deviation ─────────────────────────────────────────────
  const median = categoryMedians.get(tender.category) || 0;
  const winBid = tender.awardedValue || 0;
  const priceDeviation = tender.isPriceDeviation === true ||
    (median > 0 && winBid > 0 && winBid < median * 0.6);
  const deviationPct = median > 0 ? Math.round((1 - winBid / median) * 100) : 0;
  signals.push({
    rule: 'price_deviation',
    label: 'Price Deviation from Category Median',
    description: 'Winning bid significantly below the median for similar tenders in this category.',
    triggered: priceDeviation,
    score: priceDeviation ? 20 : 0,
    maxScore: 20,
    weight: 0.20,
    evidence: priceDeviation
      ? [
          `Winning bid: ₹${winBid.toFixed(2)} Lakh`,
          `Category median: ₹${median.toFixed(2)} Lakh`,
          `Deviation: ${deviationPct}% below median (threshold: 40%)`,
          'Significant underpricing may indicate unrealistic delivery capability',
        ]
      : [],
  });
  if (priceDeviation) totalScore += 20;

  // ── RULE 3: Vendor Win-Rate Clustering ─────────────────────────────────
  const catWins = vendorWinRates.get(tender.category);
  const vendorRecord = catWins && tender.awardedTo ? catWins.get(tender.awardedTo) : null;
  const winRateHigh = tender.isHighWinRate === true ||
    (vendorRecord && vendorRecord.total >= 2 && vendorRecord.wins / vendorRecord.total >= 0.7);
  const winRatePct = vendorRecord && vendorRecord.total > 0
    ? Math.round((vendorRecord.wins / vendorRecord.total) * 100)
    : 0;
  signals.push({
    rule: 'win_rate_cluster',
    label: 'Vendor Win-Rate Clustering',
    description: 'Vendor demonstrates unusually high award rate in this procurement category.',
    triggered: !!winRateHigh,
    score: winRateHigh ? 15 : 0,
    maxScore: 15,
    weight: 0.15,
    evidence: winRateHigh
      ? [
          `Win rate: ${winRatePct}% in category "${tender.category}"`,
          `${vendorRecord?.wins || 0} of ${vendorRecord?.total || 0} category tenders awarded to this vendor`,
          'Statistical cluster warrants review of evaluation criteria consistency',
        ]
      : [],
  });
  if (winRateHigh) totalScore += 15;

  // ── RULE 4: Unusual Award Timing ───────────────────────────────────────
  let unusualTiming = false;
  const timingEvidence: string[] = [];
  if (tender.awardedAt && tender.closingDate) {
    const closing = new Date(tender.closingDate);
    const awarded = new Date(tender.awardedAt);
    const dayOfWeek = awarded.getDay(); // 0=Sun, 6=Sat
    const deltaDays = Math.round((awarded.getTime() - closing.getTime()) / (1000 * 60 * 60 * 24));

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      unusualTiming = true;
      timingEvidence.push(`Award issued on ${dayOfWeek === 6 ? 'Saturday' : 'Sunday'} (${tender.awardedAt})`);
      timingEvidence.push('Non-working day awards fall outside standard procurement governance windows');
    }
    if (deltaDays < 2) {
      unusualTiming = true;
      timingEvidence.push(`Award issued only ${deltaDays} day(s) after bid closing (${deltaDays < 0 ? 'before closing!' : 'same day/next day'})`);
      timingEvidence.push('Standard evaluation period for this tender value is 21+ days');
    }
  }
  if (tender.isUnusualTiming) {
    unusualTiming = true;
    if (timingEvidence.length === 0) timingEvidence.push('Award timestamp flagged outside normal governance window');
  }
  signals.push({
    rule: 'unusual_timing',
    label: 'Unusual Award Timing',
    description: 'Contract awarded outside normal working hours, on non-working days, or within an atypically short evaluation window.',
    triggered: unusualTiming,
    score: unusualTiming ? 15 : 0,
    maxScore: 15,
    weight: 0.15,
    evidence: timingEvidence,
  });
  if (unusualTiming) totalScore += 15;

  // ── RULE 5: Split Contracts ─────────────────────────────────────────────
  const SPLIT_THRESHOLD = 50; // INR Lakhs
  let splitContract = false;
  const splitEvidence: string[] = [];
  if (tender.isSplitContract) {
    splitContract = true;
    // Find sibling split contracts
    const siblings = allTenders.filter(t =>
      t.id !== tender.id &&
      t.isSplitContract &&
      t.awardedTo === tender.awardedTo &&
      t.department === tender.department &&
      t.awardedAt && tender.awardedAt &&
      Math.abs(new Date(t.awardedAt).getTime() - new Date(tender.awardedAt!).getTime()) < 30 * 24 * 60 * 60 * 1000
    );
    splitEvidence.push(`${siblings.length + 1} contracts awarded to same vendor in same department within 30 days`);
    splitEvidence.push(`Each contract below ₹${SPLIT_THRESHOLD} Lakh approval threshold`);
    if (siblings.length > 0) {
      const totalVal = siblings.reduce((s, t) => s + (t.awardedValue || 0), 0) + (tender.awardedValue || 0);
      splitEvidence.push(`Combined value: ₹${totalVal.toFixed(2)} Lakh (would require higher-level approval if consolidated)`);
    }
  }
  signals.push({
    rule: 'split_contract',
    label: 'Split Contract Pattern',
    description: 'Multiple small contracts awarded to same vendor in same department within a short timeframe, each below the threshold requiring senior approval.',
    triggered: splitContract,
    score: splitContract ? 15 : 0,
    maxScore: 15,
    weight: 0.15,
    evidence: splitEvidence,
  });
  if (splitContract) totalScore += 15;

  // ── RULE 6: Shared Vendor Address / Director ────────────────────────────
  let sharedRelation = false;
  const relationEvidence: string[] = [];
  if (tender.isSharedVendorRelation && awardedVendor) {
    sharedRelation = true;
    const sharedAddr = vendors.filter(v =>
      v.id !== awardedVendor.id &&
      v.address === awardedVendor.address
    );
    const sharedDir = vendors.filter(v =>
      v.id !== awardedVendor.id &&
      v.directors.some(d => awardedVendor.directors.includes(d))
    );
    const cobidders = bidsForTender.filter(b => b.vendorId !== awardedVendor.id);

    if (sharedAddr.length > 0) {
      relationEvidence.push(`Registered address matches ${sharedAddr.length} other active vendor(s): ${sharedAddr.map(v => v.name).join(', ')}`);
    }
    if (sharedDir.length > 0) {
      const commonDirs = awardedVendor.directors.filter(d =>
        sharedDir.some(v => v.directors.includes(d))
      );
      relationEvidence.push(`Common director(s) with competitor firms: ${commonDirs.join(', ')}`);
    }
    if (relationEvidence.length === 0) {
      relationEvidence.push('Vendor exhibits network relationship patterns with other participants in this tender category');
    }
  }
  signals.push({
    rule: 'shared_relation',
    label: 'Shared Address / Director Pattern',
    description: 'Winning vendor shares a registered address or director with other vendors active in the same procurement space.',
    triggered: sharedRelation,
    score: sharedRelation ? 10 : 0,
    maxScore: 10,
    weight: 0.10,
    evidence: relationEvidence,
  });
  if (sharedRelation) totalScore += 10;

  // ── Compute final risk level ────────────────────────────────────────────
  const flagged = totalScore >= 20;
  let riskLevel: ScoredCase['riskLevel'] = 'clear';
  if (totalScore >= 80) riskLevel = 'critical';
  else if (totalScore >= 60) riskLevel = 'high';
  else if (totalScore >= 40) riskLevel = 'medium';
  else if (totalScore >= 20) riskLevel = 'low';

  // ── Case status (realistic distribution) ───────────────────────────────
  let caseStatus: ScoredCase['caseStatus'] = 'new';
  if (totalScore >= 70) caseStatus = Math.random() < 0.5 ? 'escalated' : 'under_review';
  else if (totalScore >= 40) caseStatus = Math.random() < 0.6 ? 'under_review' : Math.random() < 0.5 ? 'new' : 'resolved';
  else caseStatus = Math.random() < 0.3 ? 'resolved' : 'new';

  const assignees = [null, 'Ananya Mehta', 'Rohan Verma', 'Sanjay Iyer', 'Priya Nair', null, 'Deepak Singh'];
  const assignee = (caseStatus !== 'new') ? assignees[Math.floor(Math.random() * assignees.length)] : null;

  return {
    id: `CASE-${tender.id.replace('T', '')}`,
    tenderId: tender.id,
    title: tender.title,
    department: tender.department,
    category: tender.category,
    location: tender.location,
    referenceNo: tender.referenceNo,
    description: tender.description,
    publishedAt: tender.publishedAt,
    closingDate: tender.closingDate,
    awardedAt: tender.awardedAt,
    estimatedValue: tender.estimatedValue,
    awardedValue: tender.awardedValue,
    awardedTo: tender.awardedTo,
    awardedToName: awardedVendor?.name || null,
    status: tender.status,
    riskScore: totalScore,
    riskLevel,
    signals,
    flagged,
    caseStatus,
    assignee,
    notes: [],
    auditTrail: caseStatus !== 'new' ? [
      {
        timestamp: tender.awardedAt || tender.closingDate,
        action: 'System Detection',
        actor: 'TenderLens',
        detail: `Automated anomaly detection flagged this case with risk score ${totalScore}/100.`
      }
    ] : [],
    createdAt: tender.awardedAt || tender.closingDate,
  };
}
