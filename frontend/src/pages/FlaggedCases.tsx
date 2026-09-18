import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, X } from 'lucide-react';
import { RiskBadge, DepartmentBadge, StatusBadge } from '../components/RiskBadge';
import { getCases, CaseSummary } from '../api';

const DEPARTMENTS = ['Health', 'Infrastructure', 'IT', 'Education', 'Defence', 'Transport', 'Environment', 'Social Services'];
const STATUSES = ['new', 'under_review', 'escalated', 'resolved'];

type SortKey = 'riskScore' | 'awardedValue' | 'title' | 'department' | 'awardedAt';

export default function FlaggedCases() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('riskScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    department: '',
    status: '',
    minRisk: 0,
    maxRisk: 100,
    flaggedOnly: true,
  });

  const fetchCases = () => {
    setLoading(true);
    const qParams: Record<string, string | number | boolean> = {
      sortBy: sortKey, sortDir,
      flaggedOnly: filters.flaggedOnly,
      limit: 100,
    };
    if (filters.department) qParams.department = filters.department;
    if (filters.status) qParams.status = filters.status;
    if (filters.minRisk > 0) qParams.minRisk = filters.minRisk;
    if (filters.maxRisk < 100) qParams.maxRisk = filters.maxRisk;

    getCases(qParams)
      .then(data => {
        setCases(data.data);
        setTotal(data.total);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCases(); }, [sortKey, sortDir, filters]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="w-3 h-3 text-gray-600" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-accent-400" /> : <ArrowDown className="w-3 h-3 text-accent-400" />;
  };

  const riskLevelCounts = {
    critical: cases.filter(c => c.riskLevel === 'critical').length,
    high: cases.filter(c => c.riskLevel === 'high').length,
    medium: cases.filter(c => c.riskLevel === 'medium').length,
    low: cases.filter(c => c.riskLevel === 'low').length,
  };

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Flagged Cases</h2>
          <p className="text-xs text-gray-500 mt-0.5">{total} cases match current filters</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary gap-2 ${showFilters ? 'border-accent-600 text-accent-400' : ''}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filters.department || filters.status || filters.minRisk > 0) && (
              <span className="w-4 h-4 rounded-full bg-accent-600 text-white text-xs flex items-center justify-center">!</span>
            )}
          </button>
        </div>
      </div>

      {/* Risk Level Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { key: 'critical', label: 'Critical', count: riskLevelCounts.critical, color: 'border-red-900/40 bg-red-950/20', text: 'text-red-400' },
          { key: 'high', label: 'High Risk', count: riskLevelCounts.high, color: 'border-orange-900/40 bg-orange-950/20', text: 'text-orange-400' },
          { key: 'medium', label: 'Medium Risk', count: riskLevelCounts.medium, color: 'border-amber-900/40 bg-amber-950/20', text: 'text-amber-400' },
          { key: 'low', label: 'Low Risk', count: riskLevelCounts.low, color: 'border-lime-900/40 bg-lime-950/20', text: 'text-lime-400' },
        ].map(({ key, label, count, color, text }) => (
          <button
            key={key}
            onClick={() => setFilters(f => ({ ...f, department: '' }))}
            className={`card border p-3 text-left hover:opacity-80 transition-opacity ${color}`}
          >
            <p className="text-xs text-gray-400">{label}</p>
            <p className={`text-xl font-bold ${text}`}>{loading ? '—' : count}</p>
          </button>
        ))}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-4 animate-slide-in-up">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Department</label>
              <select
                value={filters.department}
                onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}
                className="input"
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Status</label>
              <select
                value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                className="input"
              >
                <option value="">All Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Min Risk Score: {filters.minRisk}</label>
              <input
                type="range" min={0} max={100} step={5}
                value={filters.minRisk}
                onChange={e => setFilters(f => ({ ...f, minRisk: +e.target.value }))}
                className="w-full accent-accent-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.flaggedOnly}
                  onChange={e => setFilters(f => ({ ...f, flaggedOnly: e.target.checked }))}
                  className="accent-accent-500"
                />
                <span className="text-xs text-gray-300">Flagged only</span>
              </label>
              <button
                onClick={() => setFilters({ department: '', status: '', minRisk: 0, maxRisk: 100, flaggedOnly: true })}
                className="btn-ghost text-xs ml-auto"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table className="table-base">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>
                  <button className="flex items-center gap-1" onClick={() => handleSort('title')}>
                    Title <SortIcon k="title" />
                  </button>
                </th>
                <th>
                  <button className="flex items-center gap-1" onClick={() => handleSort('department')}>
                    Department <SortIcon k="department" />
                  </button>
                </th>
                <th>
                  <button className="flex items-center gap-1" onClick={() => handleSort('riskScore')}>
                    Risk Score <SortIcon k="riskScore" />
                  </button>
                </th>
                <th>Signals</th>
                <th>
                  <button className="flex items-center gap-1" onClick={() => handleSort('awardedValue')}>
                    Value (₹ Lakh) <SortIcon k="awardedValue" />
                  </button>
                </th>
                <th>Vendor</th>
                <th>
                  <button className="flex items-center gap-1" onClick={() => handleSort('awardedAt')}>
                    Award Date <SortIcon k="awardedAt" />
                  </button>
                </th>
                <th>Status</th>
                <th>Assignee</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(8)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(10)].map((_, j) => (
                        <td key={j}><div className="h-3 bg-gray-800 rounded animate-pulse w-3/4" /></td>
                      ))}
                    </tr>
                  ))
                : cases.map(c => (
                    <tr key={c.id} onClick={() => navigate(`/cases/${c.id.replace('CASE-', '')}`)}>
                      <td><span className="font-mono text-xs text-accent-400">{c.id}</span></td>
                      <td>
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-200 line-clamp-1">{c.title}</p>
                          <p className="text-xs text-gray-500 truncate">{c.category}</p>
                        </div>
                      </td>
                      <td><DepartmentBadge dept={c.department} /></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-12 progress-bar">
                            <div
                              className={`progress-fill ${c.riskLevel === 'critical' ? 'bg-red-500' : c.riskLevel === 'high' ? 'bg-orange-500' : c.riskLevel === 'medium' ? 'bg-amber-500' : 'bg-lime-500'}`}
                              style={{ width: `${c.riskScore}%` }}
                            />
                          </div>
                          <RiskBadge level={c.riskLevel} score={c.riskScore} showScore size="sm" />
                        </div>
                      </td>
                      <td>
                        <span className={`text-sm font-medium ${c.signalCount >= 3 ? 'text-red-400' : c.signalCount >= 2 ? 'text-amber-400' : 'text-gray-300'}`}>
                          {c.signalCount} signal{c.signalCount !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="text-sm text-gray-300">₹{c.awardedValue?.toLocaleString() || '—'}</td>
                      <td>
                        <span className="text-xs text-gray-400 truncate max-w-28 block">{c.awardedToName || '—'}</span>
                      </td>
                      <td>
                        <span className="text-xs text-gray-400">{c.awardedAt || '—'}</span>
                      </td>
                      <td><StatusBadge status={c.caseStatus} /></td>
                      <td>
                        <span className="text-xs text-gray-400">{c.assignee || '—'}</span>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
          <span>Showing {cases.length} of {total} cases</span>
          <span>Click any row to view case detail</span>
        </div>
      </div>
    </div>
  );
}
