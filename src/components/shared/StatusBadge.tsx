import React from 'react';
import { cn } from '@/lib/utils';

// Status color mapping from the original app.js
const STATUS_COLORS: Record<string, string> = {
  Active: 'success', Completed: 'success', Approved: 'success',
  'Ready for Use': 'success', 'On Track': 'success', Mitigated: 'success',
  'In Progress': 'primary', Tagged: 'primary', Linked: 'primary',
  Monitoring: 'primary',
  Draft: 'gold', 'On Hold': 'gold', 'Under Review': 'gold',
  Proposed: 'gold', Partial: 'gold', 'Needs Validation': 'gold',
  'At Risk': 'warning', 'Manual Entry': 'warning',
  Overdue: 'error', Closed: 'muted', Archived: 'muted',
  Superseded: 'muted', 'Not Yet Operational': 'muted',
  High: 'error', Medium: 'warning', Low: 'success',
  Required: 'primary', Optional: 'muted', Important: 'gold',
};

const AUTHORITY_LABELS: Record<number, string> = {
  1: 'Law/Reg', 2: 'Federal/State', 3: 'Enterprise', 4: 'Division',
  5: 'Program', 6: 'Procedure', 7: 'Educational', 8: 'Archived',
};

const AUTHORITY_COLORS: Record<number, string> = {
  1: 'authority-1', 2: 'authority-1', 3: 'authority-2', 4: 'authority-2',
  5: 'authority-3', 6: 'authority-3', 7: 'authority-4', 8: 'authority-4',
};

const BATCH_COLORS: Record<string, string> = {
  'Governing Authority': 'authority-1',
  'Institutional Context': 'authority-2',
  'Equity Analysis and Engagement': 'primary',
  'Accessibility and Language Access': 'blue',
  'Workforce Equity': 'purple',
  'Service System Operations': 'gold',
  'Educational and Reusable Resources': 'success',
  'One DSD Program Core Internal': 'authority-3',
  'Program Operations Internal': 'authority-3',
  'Data and Measurement Internal': 'authority-3',
  'Learning Architecture Internal': 'authority-3',
  'Templates Internal': 'authority-3',
};

const COLOR_CLASSES: Record<string, string> = {
  success:     'bg-green-100 text-green-800 border-green-200',
  primary:     'bg-blue-100 text-blue-800 border-blue-200',
  gold:        'bg-yellow-100 text-yellow-800 border-yellow-200',
  warning:     'bg-orange-100 text-orange-800 border-orange-200',
  error:       'bg-red-100 text-red-800 border-red-200',
  muted:       'bg-gray-100 text-gray-600 border-gray-200',
  blue:        'bg-blue-100 text-blue-800 border-blue-200',
  purple:      'bg-purple-100 text-purple-800 border-purple-200',
  'authority-1': 'bg-red-900 text-red-100 border-red-700',
  'authority-2': 'bg-blue-900 text-blue-100 border-blue-700',
  'authority-3': 'bg-slate-700 text-slate-100 border-slate-600',
  'authority-4': 'bg-gray-500 text-gray-100 border-gray-400',
};

interface BadgeProps {
  text: string;
  color?: string;
  className?: string;
}

export function StatusBadge({ text, color, className }: BadgeProps) {
  if (!text) return null;
  const c = color || STATUS_COLORS[text] || 'muted';
  const cls = COLOR_CLASSES[c] || COLOR_CLASSES.muted;
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold', cls, className)}>
      {text}
    </span>
  );
}

export function AuthorityBadge({ rank }: { rank: number }) {
  const label = AUTHORITY_LABELS[rank] || 'Unknown';
  const color = AUTHORITY_COLORS[rank] || 'muted';
  const cls = COLOR_CLASSES[color] || COLOR_CLASSES.muted;
  return (
    <span
      className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold', cls)}
      title={`Authority Rank ${rank}`}
    >
      {rank} · {label}
    </span>
  );
}

export function BatchBadge({ batch }: { batch: string }) {
  if (!batch) return null;
  const color = BATCH_COLORS[batch] || 'muted';
  const cls = COLOR_CLASSES[color] || COLOR_CLASSES.muted;
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold', cls)}>
      {batch}
    </span>
  );
}

export function TypeBadge({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    Form: 'primary', Checklist: 'gold', Template: 'muted',
    Microlearning: 'primary', 'Job Aid': 'gold',
    Public: 'primary', Internal: 'gold',
  };
  const color = colorMap[type] || 'muted';
  return <StatusBadge text={type} color={color} />;
}
