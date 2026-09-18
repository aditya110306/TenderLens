import React from 'react';
import { AlertTriangle, TrendingUp, Shield, CheckCircle } from 'lucide-react';

type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'clear';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const configs: Record<RiskLevel, { label: string; className: string; icon: React.ElementType; dot: string }> = {
  critical: { label: 'Critical', className: 'risk-critical', icon: AlertTriangle, dot: 'bg-red-500' },
  high:     { label: 'High',     className: 'risk-high',     icon: AlertTriangle, dot: 'bg-orange-500' },
  medium:   { label: 'Medium',   className: 'risk-medium',   icon: TrendingUp,    dot: 'bg-amber-500' },
  low:      { label: 'Low',      className: 'risk-low',      icon: Shield,        dot: 'bg-lime-500' },
  clear:    { label: 'Clear',    className: 'risk-clear',    icon: CheckCircle,   dot: 'bg-green-500' },
};

export function RiskBadge({ level, score, showScore = false, size = 'md' }: RiskBadgeProps) {
  const cfg = configs[level];
  const Icon = cfg.icon;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-3 py-1' : '';

  return (
    <span className={`${cfg.className} ${sizeClass} whitespace-nowrap`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
      {cfg.label}
      {showScore && score !== undefined && <span className="ml-1 opacity-70">{score}</span>}
    </span>
  );
}

interface RiskScoreGaugeProps {
  score: number;
  size?: number;
}

export function RiskScoreGauge({ score, size = 80 }: RiskScoreGaugeProps) {
  const level: RiskLevel = score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 40 ? 'medium' : score >= 20 ? 'low' : 'clear';
  const colors: Record<RiskLevel, string> = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#d97706',
    low: '#65a30d',
    clear: '#16a34a',
  };
  const color = colors[level];
  const circumference = 2 * Math.PI * 35;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="35" fill="none" stroke="#1f2937" strokeWidth="8" />
        <circle
          cx="40" cy="40" r="35" fill="none"
          stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
        <text x="40" y="40" textAnchor="middle" dominantBaseline="central" fill={color} fontSize="18" fontWeight="700" fontFamily="Inter">
          {score}
        </text>
      </svg>
      <RiskBadge level={level} size="sm" />
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { className: string; label: string }> = {
    new: { className: 'status-new', label: 'New' },
    under_review: { className: 'status-review', label: 'Under Review' },
    escalated: { className: 'status-escalated', label: 'Escalated' },
    resolved: { className: 'status-resolved', label: 'Resolved' },
  };
  const cfg = configs[status] || { className: 'status-new', label: status };
  return <span className={cfg.className}>{cfg.label}</span>;
}

export function DepartmentBadge({ dept }: { dept: string }) {
  const colors: Record<string, string> = {
    'Health': 'bg-red-950/40 text-red-300 border-red-800/40',
    'Infrastructure': 'bg-blue-950/40 text-blue-300 border-blue-800/40',
    'IT': 'bg-violet-950/40 text-violet-300 border-violet-800/40',
    'Education': 'bg-yellow-950/40 text-yellow-300 border-yellow-800/40',
    'Defence': 'bg-slate-800/60 text-slate-300 border-slate-700/40',
    'Transport': 'bg-cyan-950/40 text-cyan-300 border-cyan-800/40',
    'Environment': 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40',
    'Social Services': 'bg-pink-950/40 text-pink-300 border-pink-800/40',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${colors[dept] || 'bg-gray-800 text-gray-300 border-gray-700'}`}>
      {dept}
    </span>
  );
}
