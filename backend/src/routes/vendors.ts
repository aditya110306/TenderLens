import { Router, Request, Response } from 'express';
import { getSeedData } from '../seed/index';

const router = Router();

// GET /api/vendors — list with graph edges
router.get('/', (_req: Request, res: Response) => {
  const { vendors, cases } = getSeedData();

  // Build edges: shared address, shared director
  const edges: Array<{ source: string; target: string; type: string; label: string }> = [];
  const seen = new Set<string>();

  for (let i = 0; i < vendors.length; i++) {
    for (let j = i + 1; j < vendors.length; j++) {
      const a = vendors[i];
      const b = vendors[j];
      const key = `${a.id}-${b.id}`;
      if (seen.has(key)) continue;

      if (a.address === b.address) {
        edges.push({ source: a.id, target: b.id, type: 'shared_address', label: 'Shared Address' });
        seen.add(key);
      } else {
        const commonDirs = a.directors.filter(d => b.directors.includes(d));
        if (commonDirs.length > 0) {
          edges.push({ source: a.id, target: b.id, type: 'shared_director', label: `Common Director: ${commonDirs[0]}` });
          seen.add(key);
        }
      }
    }
  }

  // Add co-bidder edges from cases
  for (const c of cases) {
    if (!c.awardedTo) continue;
    // Check if awarded vendor shares relation with other bidders
    const relatedCases = cases.filter(x =>
      x.id !== c.id && x.awardedTo === c.awardedTo && x.flagged
    );
    if (relatedCases.length >= 2) {
      // Already captured in shared address/director
    }
  }

  res.json({
    nodes: vendors.map(v => ({
      id: v.id,
      name: v.name,
      riskScore: v.riskScore,
      winRate: v.winRate,
      totalContracts: v.totalContracts,
      totalContractsValue: v.totalContractsValue,
      flaggedCases: v.flaggedCases,
      category: v.category,
      city: v.city,
      state: v.state,
      status: v.status,
    })),
    edges,
  });
});

// GET /api/vendors/:id — vendor profile
router.get('/:id', (req: Request, res: Response) => {
  const { vendors, cases } = getSeedData();
  const vendor = vendors.find(v => v.id === req.params.id);
  if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

  const vendorCases = cases.filter(c => c.awardedTo === vendor.id);
  const flaggedCount = vendorCases.filter(c => c.flagged).length;

  return res.json({
    ...vendor,
    cases: vendorCases.map(c => ({
      id: c.id,
      title: c.title,
      department: c.department,
      riskScore: c.riskScore,
      riskLevel: c.riskLevel,
      awardedValue: c.awardedValue,
      awardedAt: c.awardedAt,
      caseStatus: c.caseStatus,
    })),
    summary: {
      totalCases: vendorCases.length,
      flaggedCases: flaggedCount,
      totalValue: vendor.totalContractsValue,
      avgRiskScore: vendorCases.length > 0
        ? Math.round(vendorCases.reduce((s, c) => s + c.riskScore, 0) / vendorCases.length)
        : 0,
    },
  });
});

export default router;
