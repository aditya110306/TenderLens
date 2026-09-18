import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Printer, Download, FileText, AlertTriangle, ChevronRight, Building2, Calendar } from 'lucide-react';
import { getCases, getReport, CaseSummary, Report } from '../api';
import { RiskBadge } from '../components/RiskBadge';

export default function Reports() {
  const [searchParams] = useSearchParams();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(searchParams.get('case') || '');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCases({ flaggedOnly: true, limit: 100 }).then(({ data }) => setCases(data));
  }, []);

  useEffect(() => {
    if (!selectedCaseId) return;
    setLoading(true);
    getReport(selectedCaseId)
      .then(r => { setReport(r); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedCaseId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.summary.caseId}_report.json`;
    a.click();
  };

  const riskColor = (level: string) => {
    const map: Record<string, string> = {
      critical: 'text-red-400 bg-red-950/40',
      high: 'text-orange-400 bg-orange-950/40',
      medium: 'text-amber-400 bg-amber-950/40',
      low: 'text-lime-400 bg-lime-950/40',
      clear: 'text-green-400 bg-green-950/40',
    };
    return map[level] || 'text-gray-400 bg-gray-800';
  };

  return (
    <div className="flex h-full animate-fade-in">
      {/* Case selector sidebar */}
      <div className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800 overflow-y-auto no-print">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-white">Select Case</h3>
          <p className="text-xs text-gray-500 mt-0.5">{cases.length} flagged cases</p>
        </div>
        <div className="p-2">
          {cases.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCaseId(c.id)}
              className={`w-full text-left p-3 rounded-lg mb-1 transition-all ${
                selectedCaseId === c.id
                  ? 'bg-accent-600/20 border border-accent-600/30'
                  : 'hover:bg-gray-800 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-accent-400">{c.id}</span>
                <RiskBadge level={c.riskLevel} size="sm" />
              </div>
              <p className="text-xs text-gray-300 leading-tight line-clamp-2">{c.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.department}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Report area */}
      <div className="flex-1 overflow-auto">
        {!selectedCaseId && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Select a case to generate its investigation report</p>
            </div>
          </div>
        )}

        {selectedCaseId && loading && (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {report && !loading && (
          <div className="p-6 max-w-4xl mx-auto">
            {/* Action buttons */}
            <div className="flex items-center justify-between mb-6 no-print">
              <div>
                <h2 className="text-lg font-bold text-white">Investigation Report</h2>
                <p className="text-xs text-gray-500">Generated: {new Date(report.generatedAt).toLocaleString()} · {report.generatedBy}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleDownloadJSON} className="btn-secondary gap-2">
                  <Download className="w-4 h-4" />
                  Download JSON
                </button>
                <button onClick={handlePrint} className="btn-primary gap-2">
                  <Printer className="w-4 h-4" />
                  Print / Export PDF
                </button>
              </div>
            </div>

            {/* Printable report */}
            <div ref={printRef} className="space-y-5">
              {/* Report Header */}
              <div className="card p-6 border-b-2 border-accent-600">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 bg-gray-800 rounded border border-gray-700 text-gray-400 font-mono">INVESTIGATION REPORT</span>
                      <span className="text-xs text-gray-500">{report.reportId}</span>
                    </div>
                    <h1 className="text-xl font-bold text-white">{report.summary.title}</h1>
                    <p className="text-sm text-gray-400 mt-1">{report.summary.department} · {report.summary.caseId}</p>
                  </div>
                  <div className={`px-4 py-3 rounded-xl text-center ${riskColor(report.summary.riskLevel)}`}>
                    <p className="text-3xl font-bold">{report.summary.riskScore}</p>
                    <p className="text-xs capitalize">{report.summary.riskLevel} Risk</p>
                  </div>
                </div>
              </div>

              {/* Two-column summary */}
              <div className="grid grid-cols-2 gap-4">
                {/* Tender Details */}
                <div className="card p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Tender Details</h3>
                  <div className="space-y-2 text-xs">
                    {[
                      { label: 'Reference No.', value: report.summary.referenceNo },
                      { label: 'Estimated Value', value: `₹${report.tenderDetails.estimatedValue?.toLocaleString()} Lakh` },
                      { label: 'Awarded Value', value: `₹${report.tenderDetails.awardedValue?.toLocaleString() || '—'} Lakh` },
                      { label: 'Published', value: report.tenderDetails.publishedAt },
                      { label: 'Bid Closing', value: report.tenderDetails.closingDate },
                      { label: 'Award Date', value: report.tenderDetails.awardedAt || '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-gray-500">{label}</span>
                        <span className="text-gray-200 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vendor Profile */}
                {report.vendorProfile && (
                  <div className="card p-4">
                    <h3 className="text-sm font-semibold text-white mb-3">Awarded Vendor</h3>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{report.vendorProfile.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{report.vendorProfile.registrationNumber}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <p className="text-gray-400">{report.vendorProfile.address}, {report.vendorProfile.city}</p>
                      <p className="text-gray-400">Est. {report.vendorProfile.establishedYear}</p>
                      <p className="text-gray-400">Directors: {report.vendorProfile.directors?.join(', ')}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Signal Breakdown */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Anomaly Signal Analysis</h3>
                <div className="space-y-3">
                  {report.signalBreakdown.map(s => (
                    <div key={s.rule} className={`p-3 rounded-lg border ${s.triggered ? 'border-red-800/40 bg-red-950/10' : 'border-gray-800 bg-gray-900/30'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${s.triggered ? 'text-red-400' : 'text-gray-500'}`}>
                            {s.triggered ? '⚠' : '✓'} {s.label}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{s.score}/{s.maxScore} pts</span>
                      </div>
                      {s.triggered && s.evidence.map((ev, i) => (
                        <p key={i} className="text-xs text-gray-400 ml-4 mt-0.5">→ {ev}</p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bid Comparison */}
              {report.bidComparison.length > 0 && (
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-white mb-4">Bid Comparison Table</h3>
                  <table className="table-base text-xs">
                    <thead>
                      <tr>
                        <th>Vendor</th>
                        <th>Bid Amount</th>
                        <th>Technical Score</th>
                        <th>Financial Score</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.bidComparison.map((b, i) => (
                        <tr key={i} className={b.isWinner ? '!bg-amber-950/20' : ''}>
                          <td>{b.vendorName} {b.isWinner && <span className="text-amber-400 text-xs">(Winner)</span>}</td>
                          <td>₹{b.bidAmount?.toLocaleString()} L</td>
                          <td>{Math.round(b.technicalScore)}</td>
                          <td>{Math.round(b.financialScore)}</td>
                          <td>{b.disqualified ? 'Disqualified' : b.isWinner ? 'Awarded' : 'Not Selected'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Timeline */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Event Timeline</h3>
                <div className="space-y-2">
                  {report.timeline.map((t, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <div className="flex items-center gap-2 w-24 flex-shrink-0">
                        <Calendar className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-500">{t.date.split('T')[0]}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-300">{t.event}</span>
                        {t.description && <span className="text-gray-500 ml-2">{t.description}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="card p-5 border-amber-800/30">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Recommended Actions
                </h3>
                <ul className="space-y-2">
                  {report.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="text-amber-400 flex-shrink-0">→</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Disclaimer */}
              <div className="card p-4 bg-gray-900/50">
                <p className="text-xs text-gray-500 leading-relaxed">{report.disclaimer}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
