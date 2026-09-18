import { Router, Request, Response } from 'express';
import { getSeedData } from '../seed/index';

const router = Router();

// Scripted AI assistant response engine
function generateResponse(query: string): { response: string; relatedCases?: string[]; relatedVendors?: string[] } {
  const { cases, vendors, stats } = getSeedData();
  const q = query.toLowerCase();

  // ── Greeting ──
  if (q.match(/^(hi|hello|hey|good morning|good evening)/)) {
    return { response: `Hello! I'm the TenderLens AI assistant. I can help you explore procurement anomalies, review flagged cases, analyse vendor patterns, and answer questions about the dataset. What would you like to know?` };
  }

  // ── Overview / Stats ──
  if (q.match(/overview|summary|stats|statistics|how many|total/)) {
    return {
      response: `**Dataset Overview:**\n- **${stats.totalTenders}** tenders analysed across 8 departments\n- **${stats.flaggedCount}** cases flagged for review (${Math.round(stats.flaggedCount / stats.totalTenders * 100)}% of dataset)\n- **${stats.criticalCount}** critical risk, **${stats.highCount}** high risk, **${stats.mediumCount}** medium risk\n- Total contract value: **₹${(stats.totalContractValue / 100).toFixed(0)} Crore**\n- Average risk score: **${stats.avgRiskScore}/100**`,
    };
  }

  // ── Highest risk cases ──
  if (q.match(/highest risk|top cases|most suspicious|priority|critical cases/)) {
    const top5 = [...cases].filter(c => c.flagged).sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
    const list = top5.map(c => `- **${c.id}** — ${c.title} (Score: ${c.riskScore}/100, ${c.riskLevel})`).join('\n');
    return {
      response: `**Top 5 Highest Risk Cases:**\n${list}\n\nWould you like me to explain the signals for any of these?`,
      relatedCases: top5.map(c => c.id),
    };
  }

  // ── Single bidder ──
  if (q.match(/single bidder|one bidder|sole bidder/)) {
    const sb = cases.filter(c => c.signals.find(s => s.rule === 'single_bidder' && s.triggered));
    return {
      response: `**Single Bidder Pattern:**\n${sb.length} tenders received only one valid bid. This is a key competition indicator — industry best practice recommends minimum 3 competitive bids.\n\nAffected cases include:\n${sb.slice(0, 5).map(c => `- **${c.id}**: ${c.title} (${c.department})`).join('\n')}`,
      relatedCases: sb.slice(0, 5).map(c => c.id),
    };
  }

  // ── Price deviation ──
  if (q.match(/price deviation|underpriced|below median|low bid/)) {
    const pd = cases.filter(c => c.signals.find(s => s.rule === 'price_deviation' && s.triggered));
    return {
      response: `**Price Deviation Anomalies:**\n${pd.length} cases where the winning bid was more than 40% below the category median price.\n\nThese patterns may indicate unrealistic delivery capability, loss-leader pricing, or other concerns:\n${pd.slice(0, 5).map(c => `- **${c.id}**: ${c.title} — ₹${c.awardedValue?.toFixed(0)} Lakh (${c.category})`).join('\n')}`,
      relatedCases: pd.slice(0, 5).map(c => c.id),
    };
  }

  // ── Split contracts ──
  if (q.match(/split contract|threshold|below threshold|multiple lots/)) {
    const sc = cases.filter(c => c.signals.find(s => s.rule === 'split_contract' && s.triggered));
    return {
      response: `**Split Contract Pattern:**\n${sc.length} contracts identified where the same vendor received multiple awards in the same department within 30 days, each below the ₹50 Lakh approval threshold.\n\nExamples:\n${sc.slice(0, 5).map(c => `- **${c.id}**: ${c.title} — ₹${c.awardedValue?.toFixed(0)} Lakh (${c.department})`).join('\n')}\n\nSplit contracting circumvents higher-level approval requirements.`,
      relatedCases: sc.slice(0, 5).map(c => c.id),
    };
  }

  // ── Vendor network / shared address ──
  if (q.match(/shared address|shared director|vendor network|related vendor|common director/)) {
    const sr = cases.filter(c => c.signals.find(s => s.rule === 'shared_relation' && s.triggered));
    const sharedVendors = ['V001', 'V002', 'V003', 'V004', 'V005', 'V006', 'V007', 'V008'];
    return {
      response: `**Vendor Relationship Network:**\nI've identified ${sr.length} cases involving vendors with shared registered addresses or common directors.\n\nKey clusters:\n- **Cluster A**: Apex Infrastructure, BuildRight Solutions, Metro Constructs — all registered at 14 Commerce Park, Industrial Estate, Sector 7\n- **Cluster B**: TechVision IT, DigiSoft Solutions, CloudMatrix Technologies — shared registration at 221B Techno Hub, MIDC\n\nThese relationships are visible in the Vendor Graph view.`,
      relatedVendors: sharedVendors,
    };
  }

  // ── Unusual timing ──
  if (q.match(/timing|weekend|non.working|unusual award|quick award/)) {
    const ut = cases.filter(c => c.signals.find(s => s.rule === 'unusual_timing' && s.triggered));
    return {
      response: `**Unusual Award Timing:**\n${ut.length} contracts were awarded either on non-working days (weekends) or within 1-2 days of bid closing — both outside normal governance windows.\n\nExamples:\n${ut.slice(0, 5).map(c => `- **${c.id}**: ${c.title} — Awarded: ${c.awardedAt}`).join('\n')}`,
      relatedCases: ut.slice(0, 5).map(c => c.id),
    };
  }

  // ── Specific case query ──
  const caseMatch = q.match(/case[- ]?(\d+)|case[- ]?(case-\d+)/i);
  if (caseMatch) {
    const caseNum = caseMatch[1] || caseMatch[2];
    const c = cases.find(x => x.id === `CASE-${caseNum.padStart(3, '0')}` || x.id.toLowerCase() === caseNum.toLowerCase());
    if (c) {
      const triggered = c.signals.filter(s => s.triggered);
      return {
        response: `**${c.id}: ${c.title}**\n- Risk Score: **${c.riskScore}/100** (${c.riskLevel})\n- Department: ${c.department}\n- Awarded Value: ₹${c.awardedValue?.toFixed(0)} Lakh\n- Status: ${c.caseStatus}\n\n**Triggered Signals (${triggered.length}):**\n${triggered.map(s => `- ${s.label}: +${s.score} pts`).join('\n')}`,
        relatedCases: [c.id],
      };
    }
  }

  // ── Vendor specific query ──
  const vendorNameMatch = vendors.find(v => q.includes(v.name.toLowerCase().split(' ')[0].toLowerCase()));
  if (vendorNameMatch) {
    const vendorCases = cases.filter(c => c.awardedTo === vendorNameMatch.id);
    return {
      response: `**${vendorNameMatch.name}**\n- Risk Score: ${vendorNameMatch.riskScore}/100\n- Total Contracts: ${vendorNameMatch.totalContracts}\n- Total Value: ₹${vendorNameMatch.totalContractsValue.toFixed(0)} Lakh\n- Flagged Cases: ${vendorNameMatch.flaggedCases}\n- Location: ${vendorNameMatch.city}, ${vendorNameMatch.state}\n- Categories: ${vendorNameMatch.category.join(', ')}`,
      relatedVendors: [vendorNameMatch.id],
    };
  }

  // ── Health department ──
  if (q.match(/health|medical|hospital|pharma/)) {
    const healthCases = cases.filter(c => c.department === 'Health' && c.flagged);
    return {
      response: `**Health Department Analysis:**\n${healthCases.length} flagged cases in the Health department.\n\nKey patterns:\n- Split contracts for medical supplies (same vendor, multiple lots under threshold)\n- Single-bidder digital health tenders\n- Price deviations in surgical consumables\n\nTop flagged cases:\n${healthCases.slice(0, 4).map(c => `- **${c.id}**: ${c.title} (${c.riskScore}/100)`).join('\n')}`,
      relatedCases: healthCases.slice(0, 4).map(c => c.id),
    };
  }

  // ── Infrastructure department ──
  if (q.match(/infrastructure|construction|road|bridge|civil/)) {
    const infCases = cases.filter(c => c.department === 'Infrastructure' && c.flagged);
    return {
      response: `**Infrastructure Department Analysis:**\n${infCases.length} flagged cases.\n\nKey patterns include split road maintenance contracts and weekend-awarded large contracts.\n\nTop cases:\n${infCases.slice(0, 4).map(c => `- **${c.id}**: ${c.title} (${c.riskScore}/100)`).join('\n')}`,
      relatedCases: infCases.slice(0, 4).map(c => c.id),
    };
  }

  // ── IT department ──
  if (q.match(/\bit\b|technology|software|digital|cyber/)) {
    const itCases = cases.filter(c => c.department === 'IT' && c.flagged);
    return {
      response: `**IT Department Analysis:**\n${itCases.length} flagged cases in the IT department.\n\nNotable patterns: single-bidder ERP contracts, price deviations in hardware, and rapid award timings for digital services.\n\n${itCases.slice(0, 4).map(c => `- **${c.id}**: ${c.title} (${c.riskScore}/100)`).join('\n')}`,
      relatedCases: itCases.slice(0, 4).map(c => c.id),
    };
  }

  // ── Escalated cases ──
  if (q.match(/escalat/)) {
    const esc = cases.filter(c => c.caseStatus === 'escalated');
    return {
      response: `**Escalated Cases:**\n${esc.length} cases are currently escalated for senior review.\n\n${esc.map(c => `- **${c.id}**: ${c.title} (${c.riskScore}/100, assigned to ${c.assignee || 'Unassigned'})`).join('\n')}`,
      relatedCases: esc.map(c => c.id),
    };
  }

  // ── Win rate ──
  if (q.match(/win rate|winning vendor|dominant vendor/)) {
    const highWinRate = cases.filter(c => c.signals.find(s => s.rule === 'win_rate_cluster' && s.triggered));
    return {
      response: `**High Win-Rate Vendors:**\n${highWinRate.length} cases involve vendors with win rates exceeding 70% in their category.\n\nThis concentration warrants evaluation process review:\n${highWinRate.slice(0, 5).map(c => `- **${c.id}**: ${c.title} — Vendor: ${c.awardedToName}`).join('\n')}`,
      relatedCases: highWinRate.slice(0, 5).map(c => c.id),
    };
  }

  // ── Default fallback ──
  return {
    response: `I can help you with:\n- **Case queries**: "What are the highest risk cases?" or "Tell me about CASE-001"\n- **Pattern analysis**: "Show single bidder cases" or "Price deviation analysis"\n- **Vendor intelligence**: "Tell me about Apex Infrastructure" or "Show shared address vendors"\n- **Department analysis**: "Health department cases" or "IT department anomalies"\n- **Timing patterns**: "Show unusual award timing"\n- **Statistics**: "Give me an overview of the dataset"\n\nWhat would you like to explore?`,
  };
}

// POST /api/assistant
router.post('/', (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query required' });

  // Simulate slight processing delay
  const result = generateResponse(query);
  return res.json({
    query,
    ...result,
    timestamp: new Date().toISOString(),
    model: 'TenderLens Intelligence v1.0',
  });
});

export default router;
