import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, TrendingUp, Clock, MessageSquare, FileText, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { RiskBadge, RiskScoreGauge, DepartmentBadge, StatusBadge } from '../components/RiskBadge';
import { getCase, performCaseAction, CaseDetail, Signal } from '../api';

function SignalRow({ signal }: { signal: Signal }) {
  const [open, setOpen] = useState(signal.triggered);
  const color = signal.triggered
    ? signal.score >= 20 ? 'border-red-800/40 bg-red-950/10' : 'border-amber-800/40 bg-amber-950/10'
    : 'border-gray-800 bg-gray-900/30';

  return (
    <div className={`rounded-lg border ${color} overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${signal.triggered ? 'bg-red-600' : 'bg-gray-700'}`}>
          {signal.triggered ? <AlertTriangle className="w-2.5 h-2.5 text-white" /> : <CheckCircle className="w-2.5 h-2.5 text-gray-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${signal.triggered ? 'text-gray-100' : 'text-gray-400'}`}>{signal.label}</span>
            {signal.triggered && (
              <span className="text-xs text-red-400 font-semibold">+{signal.score} pts</span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{signal.description}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-20 progress-bar">
            <div
              className={`progress-fill ${signal.triggered ? 'bg-red-500' : 'bg-gray-700'}`}
              style={{ width: `${(signal.score / signal.maxScore) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 w-10 text-right">{signal.score}/{signal.maxScore}</span>
          {open ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
        </div>
      </button>
      {open && signal.triggered && signal.evidence.length > 0 && (
        <div className="px-4 pb-4 space-y-1.5">
          <p className="text-xs font-medium text-gray-400 mb-2">Supporting Evidence:</p>
          {signal.evidence.map((ev, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
              <span className="text-red-400 flex-shrink-0 mt-0.5">→</span>
              <span>{ev}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    const caseId = `CASE-${id.padStart(3, '0')}`;
    getCase(caseId)
      .then(data => { setCaseData(data); setLoading(false); })
      .catch(() => {
        // Try without padding
        getCase(`CASE-${id}`)
          .then(data => { setCaseData(data); setLoading(false); })
          .catch(() => setLoading(false));
      });
  }, [id]);

  const doAction = async (action: string, payload?: Record<string, string>) => {
    if (!caseData) return;
    setActionLoading(true);
    try {
      const result = await performCaseAction(caseData.id, action, payload, 'Admin');
      setCaseData(result.case);
      setMessage(`Action "${action}" completed successfully.`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 card animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">Case not found.</p>
        <button onClick={() => navigate('/cases')} className="btn-secondary mt-4">Back to Cases</button>
      </div>
    );
  }

  const triggeredSignals = caseData.signals.filter(s => s.triggered);
  const timeline = [
    { date: caseData.publishedAt, event: 'Tender Published', color: 'bg-accent-600' },
    { date: caseData.closingDate, event: 'Bid Closing', color: 'bg-gray-600' },
    ...(caseData.awardedAt ? [{ date: caseData.awardedAt, event: 'Contract Awarded', color: 'bg-amber-600' }] : []),
    ...caseData.auditTrail.map(a => ({ date: a.timestamp.split('T')[0], event: a.action, color: 'bg-blue-600' })),
  ];

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/cases')} className="btn-ghost">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-gray-700">/</span>
        <span className="font-mono text-sm text-accent-400">{caseData.id}</span>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {/* Left: case metadata */}
        <div className="col-span-3 space-y-5">
          {/* Header card */}
          <div className="card p-5">
            <div className="flex items-start gap-5">
              <RiskScoreGauge score={caseData.riskScore} size={90} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <DepartmentBadge dept={caseData.department} />
                  <StatusBadge status={caseData.caseStatus} />
                  {triggeredSignals.length > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-red-950/40 text-red-400 border border-red-800/40 rounded-full">
                      {triggeredSignals.length} signals triggered
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white">{caseData.title}</h2>
                <p className="text-sm text-gray-400 mt-1">{caseData.description}</p>
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
                  <span>Ref: <span className="font-mono text-gray-300">{caseData.referenceNo}</span></span>
                  <span>Location: <span className="text-gray-300">{caseData.location}</span></span>
                  <span>Category: <span className="text-gray-300">{caseData.category}</span></span>
                  {caseData.assignee && <span>Assigned: <span className="text-gray-300">{caseData.assignee}</span></span>}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end flex-shrink-0">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Est. Value</p>
                  <p className="text-sm text-gray-300">₹{caseData.estimatedValue?.toLocaleString()} Lakh</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Awarded Value</p>
                  <p className="text-lg font-bold text-white">₹{caseData.awardedValue?.toLocaleString() || '—'} L</p>
                </div>
              </div>
            </div>
          </div>

          {/* Signal Breakdown */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Anomaly Signal Breakdown</h3>
                <p className="text-xs text-gray-500">{triggeredSignals.length} of {caseData.signals.length} rules triggered • Composite score: {caseData.riskScore}/100</p>
              </div>
              <RiskBadge level={caseData.riskLevel} size="lg" />
            </div>
            <div className="space-y-2">
              {caseData.signals.map(s => <SignalRow key={s.rule} signal={s} />)}
            </div>
          </div>

          {/* Bid Comparison Table */}
          {caseData.bids.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Bid Comparison</h3>
              <div className="table-container">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Vendor</th>
                      <th>Bid Amount (₹ Lakh)</th>
                      <th>Technical Score</th>
                      <th>Financial Score</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {caseData.bids.map((bid, i) => (
                      <tr key={i} className={bid.isWinner ? '!bg-amber-950/20' : ''}>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-200">{bid.vendorName}</span>
                            {bid.isWinner && (
                              <span className="text-xs px-1.5 py-0.5 bg-amber-900/40 text-amber-400 border border-amber-800/30 rounded">Winner</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`text-sm font-medium ${bid.isWinner ? 'text-amber-300' : 'text-gray-300'}`}>
                            ₹{bid.bidAmount?.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-12 progress-bar">
                              <div className="progress-fill bg-accent-500" style={{ width: `${bid.technicalScore}%` }} />
                            </div>
                            <span className="text-xs text-gray-400">{Math.round(bid.technicalScore)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-12 progress-bar">
                              <div className="progress-fill bg-green-500" style={{ width: `${bid.financialScore}%` }} />
                            </div>
                            <span className="text-xs text-gray-400">{Math.round(bid.financialScore)}</span>
                          </div>
                        </td>
                        <td>
                          {bid.disqualified
                            ? <span className="text-xs text-red-400">Disqualified</span>
                            : bid.isWinner
                            ? <span className="text-xs text-amber-400">Awarded</span>
                            : <span className="text-xs text-gray-500">Not Selected</span>
                          }
                        </td>
                        <td><span className="text-xs text-gray-500">{bid.notes || '—'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Case Timeline</h3>
            <div className="relative">
              <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-800" />
              <div className="space-y-4">
                {timeline.map((t, i) => (
                  <div key={i} className="flex items-start gap-4 pl-7 relative">
                    <div className={`absolute left-0 top-0.5 w-5 h-5 rounded-full ${t.color} flex items-center justify-center flex-shrink-0`}>
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-gray-300">{t.event}</p>
                        <span className="text-xs text-gray-600">{t.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          {caseData.notes.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Reviewer Notes</h3>
              <div className="space-y-2">
                {caseData.notes.map((note, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-gray-800/50 rounded-lg">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-300">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions sidebar */}
        <div className="space-y-4">
          {/* Reviewer Actions */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Reviewer Actions</h3>
            {message && (
              <div className="mb-3 p-2 bg-green-950/40 border border-green-800/40 rounded-lg text-xs text-green-300">
                {message}
              </div>
            )}
            <div className="space-y-2">
              <button
                disabled={actionLoading || caseData.caseStatus === 'under_review'}
                onClick={() => doAction('review')}
                className="btn-secondary w-full text-xs justify-center"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Mark Under Review
              </button>
              <button
                disabled={actionLoading || caseData.caseStatus === 'escalated'}
                onClick={() => doAction('escalate', { reason: 'High composite risk score' })}
                className="btn-primary w-full text-xs justify-center bg-amber-700 hover:bg-amber-600"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Escalate Case
              </button>
              <button
                disabled={actionLoading || caseData.caseStatus === 'resolved'}
                onClick={() => doAction('dismiss', { reason: 'Reviewed — within acceptable parameters' })}
                className="btn-ghost w-full text-xs justify-center text-green-400 hover:bg-green-950/30"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Dismiss as False Positive
              </button>
              <button
                onClick={() => navigate(`/reports?case=${caseData.id}`)}
                className="btn-secondary w-full text-xs justify-center"
              >
                <FileText className="w-3.5 h-3.5" />
                Generate Report
              </button>
            </div>
          </div>

          {/* Add Note */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Add Note</h3>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Enter investigation note..."
              className="input text-xs resize-none"
              rows={3}
            />
            <button
              disabled={!noteText.trim() || actionLoading}
              onClick={() => {
                doAction('note', { text: noteText });
                setNoteText('');
              }}
              className="btn-primary w-full text-xs justify-center mt-2"
            >
              Add Note
            </button>
          </div>

          {/* Audit Trail */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Audit Trail</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {caseData.auditTrail.length === 0 ? (
                <p className="text-xs text-gray-500">No actions recorded yet.</p>
              ) : caseData.auditTrail.map((entry, i) => (
                <div key={i} className="text-xs">
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="font-medium text-gray-300">{entry.action}</span>
                    <span>{entry.timestamp.split('T')[0]}</span>
                  </div>
                  <p className="text-gray-500 truncate">{entry.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
