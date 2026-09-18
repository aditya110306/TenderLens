import { Router, Request, Response } from 'express';
import { getSeedData } from '../seed/index';

const router = Router();

// GET /api/dashboard/kpis
router.get('/kpis', (_req: Request, res: Response) => {
  const { stats, flaggedCases, cases } = getSeedData();
  res.json({
    totalTenders: stats.totalTenders,
    flaggedCases: stats.flaggedCount,
    totalContractValue: Math.round(stats.totalContractValue),
    avgRiskScore: stats.avgRiskScore,
    criticalCount: stats.criticalCount,
    highCount: stats.highCount,
    mediumCount: stats.mediumCount,
    changePercent: { flagged: 12, value: 8, risk: -3 },
  });
});

// GET /api/dashboard/trend
router.get('/trend', (_req: Request, res: Response) => {
  const { cases } = getSeedData();
  const months: Record<string, { total: number; flagged: number; critical: number }> = {};

  for (const c of cases) {
    if (!c.createdAt) continue;
    const d = new Date(c.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!months[key]) months[key] = { total: 0, flagged: 0, critical: 0 };
    months[key].total++;
    if (c.flagged) months[key].flagged++;
    if (c.riskLevel === 'critical') months[key].critical++;
  }

  // Return last 12 months sorted
  const sorted = Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, data]) => ({ month, ...data }));

  res.json(sorted);
});

// GET /api/dashboard/priority
router.get('/priority', (_req: Request, res: Response) => {
  const { flaggedCases } = getSeedData();
  const top10 = [...flaggedCases]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 10)
    .map(c => ({
      id: c.id,
      title: c.title,
      department: c.department,
      riskScore: c.riskScore,
      riskLevel: c.riskLevel,
      awardedValue: c.awardedValue,
      triggeredSignals: c.signals.filter(s => s.triggered).map(s => s.label),
      caseStatus: c.caseStatus,
    }));
  res.json(top10);
});

export default router;
