import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { KPI } from '@/types';
import { cn } from '@/lib/utils';

interface KPICardProps {
  kpi: KPI;
}

export function KPICard({ kpi }: KPICardProps) {
  const pct = kpi.target ? Math.round((kpi.currentValue / kpi.target) * 100) : null;
  const diff = kpi.previousValue != null
    ? Math.round(Math.abs(kpi.currentValue - kpi.previousValue) * 100) / 100
    : null;

  const progressColor = pct == null ? '' : pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;
  const trendColor = kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-400';

  return (
    <div className="kpi-card bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 leading-tight">{kpi.name}</span>
        {kpi.dataQuality && <StatusBadge text={kpi.dataQuality} />}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">
        {kpi.unit === 'percentage' ? `${kpi.currentValue}%` : kpi.currentValue}
        {kpi.unit === 'days' && <span className="text-sm font-normal text-gray-500 ml-1">days</span>}
      </div>
      <div className="flex items-center justify-between text-sm">
        {kpi.target && (
          <span className="text-gray-500">
            Target: {kpi.unit === 'percentage' ? `${kpi.target}%` : kpi.target}
          </span>
        )}
        <span className={cn('flex items-center gap-1', trendColor)}>
          <TrendIcon className="w-4 h-4" />
          {diff != null && diff !== 0 && <span>{diff}</span>}
        </span>
      </div>
      {pct != null && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={cn('h-1.5 rounded-full transition-all', progressColor)}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
