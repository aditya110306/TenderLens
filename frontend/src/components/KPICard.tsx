import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconColor?: string;
  change?: number;
  changeLabel?: string;
  highlight?: boolean;
  loading?: boolean;
}

export function KPICard({
  title, value, subtitle, icon: Icon, iconColor = 'text-accent-400',
  change, changeLabel, highlight = false, loading = false
}: KPICardProps) {
  const TrendIcon = change === undefined ? Minus : change > 0 ? TrendingUp : TrendingDown;
  const trendColor = change === undefined ? 'text-gray-500' : change > 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className={`card p-5 flex flex-col gap-3 ${highlight ? 'border-accent-600/30 shadow-glow-blue' : ''} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-800 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
          )}
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gray-800/80 ${iconColor.replace('text-', 'shadow-')}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-gray-800">
          <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
          <span className={`text-xs font-medium ${trendColor}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          {changeLabel && <span className="text-xs text-gray-500">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}

export function StatCard({ label, value, color = 'text-white' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  );
}
