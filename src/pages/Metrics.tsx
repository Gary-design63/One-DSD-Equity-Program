import React, { useState } from 'react';
import { BarChart3, Crown, Table2, FileText, Copy, X, Pencil } from 'lucide-react';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { EntityModal, useCRUD } from '@/components/shared/EntityModal';
import { getAppData } from '@/data/appData';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, roleName } from '@/lib/helpers';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const KPI_GROUPS = [
  'Demand & Throughput',
  'Timeliness',
  'Quality & Follow-Through',
  'Learning & Capacity',
  'Accountability & Progress',
];

const LEADERSHIP_KPIS = ['KPI-001', 'KPI-005', 'KPI-007', 'KPI-010', 'KPI-011', 'KPI-012'];

export default function Metrics() {
  const D = getAppData();
  const { user } = useAuth();
  const { saveKPI } = useCRUD();
  const [activeTab, setActiveTab] = useState<'operations' | 'leadership'>('operations');
  const [reportOutput, setReportOutput] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [editKpi, setEditKpi] = useState<(typeof D.kpis[0]) | null>(null);
  const [, forceUpdate] = useState(0);

  const rp = D.reportingPeriods[0];

  const generateReport = async () => {
    const apiUrl = window.AGENT_API_URL || 'http://localhost:3000';
    setReportLoading(true);
    setReportOutput('Generating report… This may take 30-60 seconds.');
    try {
      const res = await fetch(`${apiUrl}/api/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: rp?.name || null, audience: 'leadership' }),
      });
      const data = await res.json();
      setReportOutput(data.report || data.error || 'No report generated');
    } catch (e) {
      setReportOutput(`Error: ${(e as Error).message}\n\nMake sure the backend is running.`);
    } finally {
      setReportLoading(false);
    }
  };

  const kpiEditFields = editKpi ? [
    { name: 'currentValue', label: 'Current Value', type: 'number' as const, required: true, step: 'any' as const },
    { name: 'target', label: 'Target', type: 'number' as const, step: 'any' as const },
    { name: 'trend', label: 'Trend', type: 'select' as const, required: true, options: ['up', 'down', 'flat'] },
    { name: 'dataQuality', label: 'Data Quality', type: 'select' as const, required: true, options: ['High', 'Medium', 'Low', 'Needs Validation'] },
    { name: 'owner', label: 'Owner', type: 'select' as const, required: true, placeholder: 'Select owner',
      options: D.roles.map(r => ({ value: r.id, label: r.name })) },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      {/* Reporting Banner */}
      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <BarChart3 className="w-4 h-4 text-blue-600 shrink-0" />
        <span>Reporting Period: <strong>{rp?.name || '—'}</strong></span>
        {rp && <span className="text-gray-500">{formatDate(rp.startDate)} — {formatDate(rp.endDate)}</span>}
        <button
          onClick={generateReport}
          disabled={reportLoading}
          className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-60"
        >
          <FileText className="w-3.5 h-3.5" />
          {reportLoading ? 'Generating…' : 'Generate Report'}
        </button>
      </div>

      {/* Report Output */}
      {reportOutput && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Generated Report</h3>
            <div className="flex gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(reportOutput)}
                className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
              <button
                onClick={() => setReportOutput(null)}
                className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50"
              >
                <X className="w-3.5 h-3.5" /> Close
              </button>
            </div>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{reportOutput}</pre>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(['operations', 'leadership'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'operations' ? 'Operations Dashboard' : 'Leadership Dashboard'}
          </button>
        ))}
      </div>

      {activeTab === 'operations' ? (
        <div className="space-y-6">
          {/* KPI Groups */}
          {KPI_GROUPS.map(g => {
            const kpis = D.kpis.filter(k => k.dashboardGroup === g);
            if (!kpis.length) return null;
            return (
              <div key={g}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{g}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {kpis.map(k => <KPICard key={k.id} kpi={k} />)}
                </div>
              </div>
            );
          })}

          {/* Full KPI Table */}
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
              <Table2 className="w-5 h-5" /> Full KPI Table
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['ID','Name','Group','Current','Target','Trend','Quality','Owner',''].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {D.kpis.map(k => {
                    const TrendIcon = k.trend === 'up' ? TrendingUp : k.trend === 'down' ? TrendingDown : Minus;
                    const trendColor = k.trend === 'up' ? 'text-green-600' : k.trend === 'down' ? 'text-red-600' : 'text-gray-400';
                    return (
                      <tr key={k.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500 text-xs">{k.id}</td>
                        <td className="px-4 py-3 font-medium">{k.name}</td>
                        <td className="px-4 py-3"><StatusBadge text={k.dashboardGroup} color="muted" /></td>
                        <td className="px-4 py-3 font-bold">{k.unit === 'percentage' ? `${k.currentValue}%` : k.currentValue}{k.unit === 'days' ? ' d' : ''}</td>
                        <td className="px-4 py-3 text-gray-600">{k.target ? (k.unit === 'percentage' ? `${k.target}%` : k.target) : '—'}</td>
                        <td className="px-4 py-3"><TrendIcon className={`w-4 h-4 ${trendColor}`} /></td>
                        <td className="px-4 py-3">{k.dataQuality && <StatusBadge text={k.dataQuality} />}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{roleName(D, k.owner)}</td>
                        <td className="px-4 py-3">
                          {user?.isAdmin && (
                            <button onClick={() => setEditKpi(k)} className="p-1 hover:bg-gray-100 rounded">
                              <Pencil className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
              <Crown className="w-5 h-5" /> Leadership Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {D.kpis.filter(k => LEADERSHIP_KPIS.includes(k.id)).map(k => <KPICard key={k.id} kpi={k} />)}
            </div>
          </div>

          {/* Actions Table */}
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Actions</h2>
            {D.actions.length === 0 ? <EmptyState message="No actions" /> : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>{['Action','Owner','Status','Priority','Due'].map(h => <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">{h}</th>)}</tr>
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
            )}
          </div>

          {/* Risks Table */}
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Risks</h2>
            {D.risks.length === 0 ? <EmptyState message="No risks" /> : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>{['Risk','Severity','Likelihood','Status','Owner'].map(h => <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {D.risks.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{r.title}</td>
                        <td className="px-4 py-3"><StatusBadge text={r.severity} /></td>
                        <td className="px-4 py-3"><StatusBadge text={r.likelihood} /></td>
                        <td className="px-4 py-3"><StatusBadge text={r.status} /></td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{roleName(D, r.owner)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KPI Edit Modal */}
      {editKpi && (
        <EntityModal
          open={true}
          onClose={() => setEditKpi(null)}
          title="Edit KPI"
          fields={kpiEditFields}
          initialData={editKpi as unknown as Record<string, unknown>}
          onSave={(data) => {
            saveKPI(data, editKpi);
            setEditKpi(null);
            forceUpdate(n => n + 1);
          }}
        />
      )}
    </div>
  );
}
