import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Flag, DollarSign, AlertTriangle, TrendingUp, Play, ArrowRight, ChevronUp } from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { RiskBadge, DepartmentBadge, StatusBadge } from '../components/RiskBadge';
import { getDashboardKPIs, getDashboardTrend, getDashboardPriority, KPIs, TrendPoint, CaseSummary } from '../api';
import { useDemoMode } from '../context/DemoContext';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl text-xs">
      <p className="text-gray-400 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { startDemo, demoActive } = useDemoMode();

  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [priority, setPriority] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardKPIs(), getDashboardTrend(), getDashboardPriority()])
      .then(([k, t, p]) => {
        setKpis(k);
        setTrend(t);
        setPriority(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatMonth = (m: string) => {
    const [y, mo] = m.split('-');
    return new Date(+y, +mo - 1).toLocaleDateString('en', { month: 'short', year: '2-digit' });
  };

  const chartData = trend.map(t => ({ ...t, month: formatMonth(t.month) }));

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Procurement Intelligence Dashboard</h2>
          <p className="text-xs text-gray-500 mt-0.5">Real-time anomaly detection across government procurement ecosystem</p>
        </div>
        <button
          id="demo-btn"
          onClick={startDemo}
          disabled={demoActive}
          className="btn-primary gap-2"
        >
          <Play className="w-4 h-4" />
          {demoActive ? 'Demo Running...' : 'Run Demo Scenario'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Total Tenders Analysed"
          value={loading ? '—' : kpis?.totalTenders.toLocaleString() || '—'}
          subtitle="FY 2024–25"
          icon={TrendingUp}
          iconColor="text-accent-400"
          loading={loading}
        />
        <KPICard
          title="Flagged Cases"
          value={loading ? '—' : kpis?.flaggedCases.toLocaleString() || '—'}
          subtitle={`${kpis?.criticalCount || 0} critical, ${kpis?.highCount || 0} high`}
          icon={Flag}
          iconColor="text-red-400"
          change={kpis?.changePercent.flagged}
          changeLabel="vs last quarter"
          highlight
          loading={loading}
        />
        <KPICard
          title="Total Contract Value"
          value={loading ? '—' : `₹${((kpis?.totalContractValue || 0) / 100).toFixed(0)} Cr`}
          subtitle="Awarded contracts reviewed"
          icon={DollarSign}
          iconColor="text-emerald-400"
          change={kpis?.changePercent.value}
          changeLabel="vs last quarter"
          loading={loading}
        />
        <KPICard
          title="Avg Risk Score"
          value={loading ? '—' : `${kpis?.avgRiskScore || 0}/100`}
          subtitle="Across all flagged cases"
          icon={AlertTriangle}
          iconColor="text-amber-400"
          change={kpis?.changePercent.risk}
          changeLabel="vs last quarter"
          loading={loading}
        />
      </div>

      {/* Risk Distribution */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Critical Risk', count: kpis?.criticalCount || 0, color: 'bg-red-500', textColor: 'text-red-400', border: 'border-red-900/30' },
          { label: 'High Risk', count: kpis?.highCount || 0, color: 'bg-orange-500', textColor: 'text-orange-400', border: 'border-orange-900/30' },
          { label: 'Medium Risk', count: kpis?.mediumCount || 0, color: 'bg-amber-500', textColor: 'text-amber-400', border: 'border-amber-900/30' },
        ].map(({ label, count, color, textColor, border }) => (
          <div key={label} className={`card border ${border} p-4 flex items-center justify-between`}>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`text-2xl font-bold ${textColor}`}>{loading ? '—' : count}</p>
            </div>
            <div className={`w-10 h-10 rounded-full ${color} opacity-20`} />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-5 gap-4">
        {/* Trend Chart */}
        <div className="col-span-3 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Anomaly Detection Trend</h3>
              <p className="text-xs text-gray-500">Flagged cases over time (last 12 months)</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-accent-500 inline-block" /> Total Awarded</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block" /> Flagged</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="flaggedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" name="Total Awarded" stroke="#3b82f6" fill="url(#totalGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="flagged" name="Flagged" stroke="#ef4444" fill="url(#flaggedGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Signal Distribution */}
        <div className="col-span-2 card p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Top Anomaly Types</h3>
          <p className="text-xs text-gray-500 mb-4">Frequency of detection rules triggered</p>
          <div className="space-y-3">
            {[
              { label: 'Split Contracts', count: 28, color: 'bg-amber-500', pct: 92 },
              { label: 'Single Bidder', count: 22, color: 'bg-red-500', pct: 72 },
              { label: 'Price Deviation', count: 20, color: 'bg-orange-500', pct: 65 },
              { label: 'Unusual Timing', count: 14, color: 'bg-violet-500', pct: 46 },
              { label: 'Shared Relations', count: 32, color: 'bg-blue-500', pct: 100 },
              { label: 'Win-Rate Cluster', count: 12, color: 'bg-green-500', pct: 38 },
            ].map(({ label, count, color, pct }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-28 truncate">{label}</span>
                <div className="flex-1 progress-bar">
                  <div className={`progress-fill ${color}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-5 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority Queue */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div>
            <h3 className="text-sm font-semibold text-white">Priority Investigation Queue</h3>
            <p className="text-xs text-gray-500">Top 10 cases by composite risk score — requiring immediate attention</p>
          </div>
          <button onClick={() => navigate('/cases?flaggedOnly=true')} className="btn-ghost text-xs">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="table-container">
          <table className="table-base">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Title</th>
                <th>Department</th>
                <th>Risk Score</th>
                <th>Value (₹ Lakh)</th>
                <th>Signals</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j}><div className="h-3 bg-gray-800 rounded animate-pulse w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : priority.map(c => (
                <tr key={c.id} onClick={() => navigate(`/cases/${c.id.replace('CASE-', '')}`)}>
                  <td><span className="font-mono text-xs text-accent-400">{c.id}</span></td>
                  <td>
                    <span className="text-sm text-gray-200 line-clamp-1 max-w-xs">{c.title}</span>
                  </td>
                  <td><DepartmentBadge dept={c.department} /></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 progress-bar">
                        <div
                          className={`progress-fill ${c.riskLevel === 'critical' ? 'bg-red-500' : c.riskLevel === 'high' ? 'bg-orange-500' : 'bg-amber-500'}`}
                          style={{ width: `${c.riskScore}%` }}
                        />
                      </div>
                      <RiskBadge level={c.riskLevel} score={c.riskScore} showScore />
                    </div>
                  </td>
                  <td className="text-sm text-gray-300">₹{c.awardedValue?.toLocaleString() || '—'}</td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      {c.triggeredSignals?.slice(0, 2).map((s: string) => (
                        <span key={s} className="text-xs px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded border border-gray-700 whitespace-nowrap">{s.split(' ')[0]}</span>
                      ))}
                    </div>
                  </td>
                  <td><StatusBadge status={c.caseStatus} /></td>
                  <td>
                    <button className="btn-ghost text-xs p-1">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
