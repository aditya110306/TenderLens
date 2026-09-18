// Bids seed data — realistic bid sets per tender
import { tenders } from './tenders';

export interface Bid {
  id: string;
  tenderId: string;
  vendorId: string;
  vendorName: string;
  bidAmount: number;  // in INR Lakhs
  submittedAt: string;
  technicalScore: number;
  financialScore: number;
  isWinner: boolean;
  disqualified: boolean;
  notes?: string;
}

// Category median bid amounts (INR Lakhs)
const CATEGORY_MEDIANS: Record<string, number> = {
  'Medical Supplies': 80,
  'Hospital Construction': 2000,
  'Pharmaceuticals': 500,
  'Medical Equipment': 400,
  'Digital Health': 300,
  'Road Construction': 3000,
  'Bridge': 5000,
  'Building': 5000,
  'Civil Works': 3000,
  'Urban Development': 400,
  'Water Supply': 2000,
  'Software': 400,
  'Hardware': 600,
  'Networking': 800,
  'Cybersecurity': 600,
  'Data Analytics': 400,
  'e-Governance': 300,
  'School Construction': 3000,
  'Educational Materials': 200,
  'Training': 200,
  'Digital Education': 300,
  'Defense Equipment': 5000,
  'Security Systems': 2000,
  'Aerospace': 15000,
  'Vehicle Fleet': 2000,
  'Road Maintenance': 500,
  'Public Transit': 1000,
  'Aviation': 8000,
  'Waste Management': 1000,
  'Air Quality': 300,
  'Water Treatment': 2000,
  'Solar Energy': 500,
  'Forestry': 400,
  'Social Housing': 5000,
  'Welfare Services': 200,
  'Food Supply': 1000,
  'Sanitation': 100,
};

function randomBetween(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

// Vendor names for non-winning bids
const GENERIC_BIDDER_NAMES: Record<string, string> = {
  'V001': 'Apex Infrastructure Pvt Ltd', 'V002': 'BuildRight Solutions Ltd', 'V003': 'Metro Constructs India',
  'V004': 'TechVision IT Services', 'V005': 'DigiSoft Solutions Pvt Ltd', 'V006': 'CloudMatrix Technologies',
  'V007': 'GreenBuild Engineering', 'V008': 'EcoStructures Ltd', 'V009': 'Horizon Healthcare Supplies',
  'V010': 'MedEquip India Pvt Ltd', 'V011': 'PharmaStar Distributors', 'V012': 'EduTech Systems India',
  'V013': 'LearnerFirst Pvt Ltd', 'V014': 'TransRoute Logistics', 'V015': 'FleetMaster India',
  'V016': 'PowerGrid Solutions Ltd', 'V017': 'AquaTech Water Systems', 'V018': 'SecureNet Defense Tech',
  'V019': 'SocialFirst NGO Services', 'V020': 'RoadPave Infrastructure', 'V021': 'DataSphere Analytics',
  'V022': 'HealthCare Infrastructure', 'V023': 'GovTech Platform Services', 'V024': 'UrbanPlan Associates',
  'V025': 'SafeRoad Systems', 'V026': 'CleanEnergy Pvt Ltd', 'V027': 'BridgeMakers Co.',
  'V028': 'DigiHealth Solutions', 'V029': 'ForestGuard Systems', 'V030': 'TrainTrack Engineering',
};

const EXTRA_VENDORS = [
  { id: 'EV001', name: 'Bharat Construction Works' },
  { id: 'EV002', name: 'National Build Corp' },
  { id: 'EV003', name: 'Prime Infrastructure Ltd' },
  { id: 'EV004', name: 'Alpha Tech Solutions' },
  { id: 'EV005', name: 'United Software Services' },
  { id: 'EV006', name: 'Royal Healthcare Pvt Ltd' },
  { id: 'EV007', name: 'Global Transport Corp' },
  { id: 'EV008', name: 'EcoSystems India' },
  { id: 'EV009', name: 'Samarth Construction' },
  { id: 'EV010', name: 'Vidya Education Services' },
  { id: 'EV011', name: 'Jan Sewa Foundation' },
  { id: 'EV012', name: 'Rashtriya Pharma Ltd' },
];

export let bids: Bid[] = [];

export function generateBids(): Bid[] {
  const allBids: Bid[] = [];
  let bidCounter = 1;

  for (const tender of tenders) {
    if (!tender.awardedTo || tender.status !== 'awarded') continue;

    const median = CATEGORY_MEDIANS[tender.category] || 500;
    const winnerAmount = tender.awardedValue!;
    const winnerVendorId = tender.awardedTo;
    const winnerName = GENERIC_BIDDER_NAMES[winnerVendorId] || 'Winner Corp';

    // Winning bid
    allBids.push({
      id: `B${String(bidCounter++).padStart(4, '0')}`,
      tenderId: tender.id,
      vendorId: winnerVendorId,
      vendorName: winnerName,
      bidAmount: winnerAmount,
      submittedAt: tender.closingDate,
      technicalScore: tender.isPriceDeviation ? 82 : randomBetween(75, 95),
      financialScore: tender.isPriceDeviation ? 98 : randomBetween(70, 90),
      isWinner: true,
      disqualified: false,
    });

    // Add competing bids unless single-bidder
    if (!tender.isSingleBidder) {
      const numCompetitors = tender.isPriceDeviation ? 3 : randomBetween(1, 3);
      for (let i = 0; i < numCompetitors; i++) {
        const competitor = EXTRA_VENDORS[Math.floor(Math.random() * EXTRA_VENDORS.length)];
        // Competitor bids around median (not the crazy-low winner)
        const competitorAmount = randomBetween(median * 0.85, median * 1.15);
        allBids.push({
          id: `B${String(bidCounter++).padStart(4, '0')}`,
          tenderId: tender.id,
          vendorId: competitor.id,
          vendorName: competitor.name,
          bidAmount: competitorAmount,
          submittedAt: tender.closingDate,
          technicalScore: randomBetween(60, 80),
          financialScore: randomBetween(60, 80),
          isWinner: false,
          disqualified: Math.random() < 0.2,
          notes: Math.random() < 0.2 ? 'Disqualified: incomplete documentation' : undefined,
        });
      }
    }
  }

  bids = allBids;
  return allBids;
}

export default bids;
