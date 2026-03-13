import React from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, CheckCircle2, AlertTriangle } from 'lucide-react';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { getAppData } from '@/data/appData';
import { formatDate, roleName } from '@/lib/helpers';

const KPI_GROUPS = [
  'Demand & Throughput',
  'Timeliness',
  'Quality & Follow-Through',
  'Learning & Capacity',
  'Accountability & Progress',
];

export default function Dashboard() {
  const D = getAppData();
  const activeRuns = D.workflowRuns.filter(r => r.status !== 'Completed');
  const rp = D.reportingPeriods[0];

  return (
    <div className="page-content p-6 space-y-6">
      {/* Welcome banner */}
      <div className="welcome-banner rounded-xl p-6 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #003865, #005a9c)' }}>
        <div>
          <h1 className="text-2xl font-bold text-white">One DSD Equity Program</h1>
          <p className="text-white/70 mt-1">Disability Services Division — Equity Operating System</p>
        </div>
        <div className="text-right">
          <div className="text-white/80 text-sm flex items-center gap-1">
            <span>📅</span>
            <span>{rp ? rp.name : '—'}</span>
          </div>
        </div>
      </div>

      {/* Snapshot bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'Documents', value: D.documents.length },
          { label: 'Workflows', value: D.workflows.length },
          { label: 'Templates', value: D.templates.length },
          { label: 'KPIs', value: D.kpis.length },
          { label: 'Learning Assets', value: D.learningAssets.length },
          { label: 'Roles', value: D.roles.length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* KPI Groups */}
      {KPI_GROUPS.map(g => {
        const kpis = D.kpis.filter(k => k.dashboardGroup === g);
        if (!kpis.length) return null;
        return (
          <div key={g}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{g}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {kpis.map(k => <KPICard key={k.id} kpi={k} />)}
            </div>
          </div>
        );
      })}

      {/* Active Workflow Runs */}
      <div>
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
          <GitBranch className="w-5 h-5" /> Active Workflow Runs
        </h2>
        {activeRuns.length === 0 ? (
          <EmptyState message="No active workflow runs" />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Title','Workflow','Stage','Status','Priority','Assigned'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeRuns.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3">
                      <Link to={`/workflows/run/${r.id}`} className="font-medium text-blue-600 hover:underline">
                        {r.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{D.workflows.find(w => w.id === r.workflowId)?.name || r.workflowId}</td>
                    <td className="px-4 py-3"><StatusBadge text={r.currentStage} color="primary" /></td>
                    <td className="px-4 py-3"><StatusBadge text={r.status} /></td>
                    <td className="px-4 py-3"><StatusBadge text={r.priority} /></td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{roleName(D, r.assignedTo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Actions */}
      {D.actions.length > 0 && (
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
            <CheckCircle2 className="w-5 h-5" /> Program Actions
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Action','Owner','Status','Priority','Due'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {D.actions.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{a.title}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{roleName(D, a.owner)}</td>
                    <td className="px-4 py-3"><StatusBadge text={a.status} /></td>
                    <td className="px-4 py-3"><StatusBadge text={a.priority} /></td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(a.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Risks */}
      {D.risks.filter(r => r.status === 'Active').length > 0 && (
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
            <AlertTriangle className="w-5 h-5" /> Active Risks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {D.risks.filter(r => r.status === 'Active').map(r => (
              <div key={r.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-gray-900">{r.title}</span>
                  <div className="flex gap-1 shrink-0 ml-2">
                    <StatusBadge text={r.severity} />
                    <StatusBadge text={r.likelihood} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{r.mitigationPlan}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <StatusBadge text={r.status} />
                  <span>·</span>
                  <span>{roleName(D, r.owner)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
