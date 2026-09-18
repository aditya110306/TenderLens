import { Router, Request, Response } from 'express';
import { getSeedData } from '../seed/index';
import { ScoredCase, AuditEntry } from '../scoring/anomalyEngine';

const router = Router();

// GET /api/cases — filterable list
router.get('/', (req: Request, res: Response) => {
  const { cases } = getSeedData();
  let result = [...cases];

  const { minRisk, maxRisk, department, category, status, flaggedOnly, page = '1', limit = '50', sortBy = 'riskScore', sortDir = 'desc' } = req.query;

  if (flaggedOnly === 'true') result = result.filter(c => c.flagged);
  if (minRisk) result = result.filter(c => c.riskScore >= Number(minRisk));
  if (maxRisk) result = result.filter(c => c.riskScore <= Number(maxRisk));
  if (department) result = result.filter(c => c.department === department);
  if (category) result = result.filter(c => c.category === category);
  if (status) result = result.filter(c => c.caseStatus === status);

  // Sort
  result.sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortBy === 'riskScore') return dir * (a.riskScore - b.riskScore);
    if (sortBy === 'awardedValue') return dir * ((a.awardedValue || 0) - (b.awardedValue || 0));
    if (sortBy === 'title') return dir * a.title.localeCompare(b.title);
    if (sortBy === 'department') return dir * a.department.localeCompare(b.department);
    if (sortBy === 'awardedAt') return dir * ((a.awardedAt || '').localeCompare(b.awardedAt || ''));
    return 0;
  });

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Number(limit));
  const start = (pageNum - 1) * limitNum;
  const paginated = result.slice(start, start + limitNum);

  res.json({
    total: result.length,
    page: pageNum,
    limit: limitNum,
    data: paginated.map(c => ({
      id: c.id,
      tenderId: c.tenderId,
      title: c.title,
      department: c.department,
      category: c.category,
      riskScore: c.riskScore,
      riskLevel: c.riskLevel,
      awardedValue: c.awardedValue,
      awardedTo: c.awardedTo,
      awardedToName: c.awardedToName,
      awardedAt: c.awardedAt,
      caseStatus: c.caseStatus,
      assignee: c.assignee,
      flagged: c.flagged,
      signalCount: c.signals.filter(s => s.triggered).length,
      location: c.location,
    })),
  });
});

// GET /api/cases/:id — full case detail
router.get('/:id', (req: Request, res: Response) => {
  const { cases, bids } = getSeedData();
  const c = cases.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Case not found' });

  const caseBids = bids.filter(b => b.tenderId === c.tenderId);
  return res.json({ ...c, bids: caseBids });
});

// PATCH /api/cases/:id — update status/assignee
router.patch('/:id', (req: Request, res: Response) => {
  const { cases } = getSeedData();
  const c = cases.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Case not found' });

  const { caseStatus, assignee } = req.body;
  if (caseStatus) c.caseStatus = caseStatus;
  if (assignee !== undefined) c.assignee = assignee;

  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    action: 'Status Updated',
    actor: req.body.actor || 'System',
    detail: `Status changed to ${caseStatus || c.caseStatus}${assignee ? `, assigned to ${assignee}` : ''}`,
  };
  c.auditTrail.push(entry);

  return res.json(c);
});

// POST /api/cases/:id/actions — reviewer actions
router.post('/:id/actions', (req: Request, res: Response) => {
  const { cases } = getSeedData();
  const c = cases.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Case not found' });

  const { action, payload, actor = 'Reviewer' } = req.body;

  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    action: '',
    actor,
    detail: '',
  };

  switch (action) {
    case 'review':
      c.caseStatus = 'under_review';
      entry.action = 'Marked for Review';
      entry.detail = 'Case moved to Under Review status.';
      break;
    case 'escalate':
      c.caseStatus = 'escalated';
      entry.action = 'Escalated';
      entry.detail = `Case escalated for senior review. Reason: ${payload?.reason || 'Not specified'}`;
      break;
    case 'dismiss':
      c.caseStatus = 'resolved';
      entry.action = 'Dismissed as False Positive';
      entry.detail = `Marked as false positive. Reason: ${payload?.reason || 'Not specified'}`;
      break;
    case 'note':
      c.notes.push(`${new Date().toLocaleDateString()} — ${actor}: ${payload?.text || ''}`);
      entry.action = 'Note Added';
      entry.detail = payload?.text || '';
      break;
    case 'assign':
      c.assignee = payload?.assignee || null;
      entry.action = 'Assigned';
      entry.detail = `Assigned to ${payload?.assignee || 'Unassigned'}`;
      break;
    default:
      return res.status(400).json({ error: 'Unknown action' });
  }

  c.auditTrail.push(entry);
  return res.json({ success: true, case: c });
});

// GET /api/cases/kanban/board — kanban view
router.get('/kanban/board', (_req: Request, res: Response) => {
  const { cases } = getSeedData();
  const flagged = cases.filter(c => c.flagged);

  const board = {
    new: flagged.filter(c => c.caseStatus === 'new'),
    under_review: flagged.filter(c => c.caseStatus === 'under_review'),
    escalated: flagged.filter(c => c.caseStatus === 'escalated'),
    resolved: flagged.filter(c => c.caseStatus === 'resolved'),
  };
  res.json(board);
});

export default router;
