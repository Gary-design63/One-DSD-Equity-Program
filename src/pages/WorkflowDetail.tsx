import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layers, Play } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { getAppData } from '@/data/appData';
import { formatDate, roleName } from '@/lib/helpers';

export default function WorkflowDetail() {
  const { id } = useParams<{ id: string }>();
  const D = getAppData();

  const wf = D.workflows.find(w => w.id === id);
  if (!wf) return <EmptyState message="Workflow not found" />;

  const runs = D.workflowRuns.filter(r => r.workflowId === id);
  const stages = [...wf.stages].sort((a, b) => a.order - b.order);

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/workflows" className="hover:text-blue-600">Workflows</Link>
        <span>/</span>
        <span className="text-gray-900">{wf.name}</span>
      </nav>

      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{wf.name}</h1>
          <StatusBadge text={wf.status} />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <p className="text-gray-700">{wf.description}</p>
        <dl className="grid grid-cols-3 gap-4 mt-4 text-sm">
          <div><dt className="text-gray-500">Owner</dt><dd className="font-medium">{roleName(D, wf.owner)}</dd></div>
          {wf.trigger && <div><dt className="text-gray-500">Trigger</dt><dd>{wf.trigger}</dd></div>}
          {wf.reviewFrequency && <div><dt className="text-gray-500">Review Frequency</dt><dd>{wf.reviewFrequency}</dd></div>}
        </dl>
      </div>

      {/* Stage Pipeline */}
      <div>
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-4">
          <Layers className="w-5 h-5" /> Workflow Stages
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {stages.map((s, i) => (
            <React.Fragment key={i}>
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-center min-w-28">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1">{i + 1}</div>
                <div className="text-xs font-medium text-blue-900">{s.name}</div>
              </div>
              {i < stages.length - 1 && <span className="text-gray-400 text-lg">›</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Runs */}
        <div className="lg:col-span-2">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
            <Play className="w-5 h-5" /> Runs
          </h2>
          {runs.length === 0 ? <EmptyState message="No runs for this workflow" /> : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Title','Stage','Status','Priority','Target'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {runs.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link to={`/workflows/run/${r.id}`} className="font-medium text-blue-600 hover:underline">{r.title}</Link>
                      </td>
                      <td className="px-4 py-3"><StatusBadge text={r.currentStage} color="primary" /></td>
                      <td className="px-4 py-3"><StatusBadge text={r.status} /></td>
                      <td className="px-4 py-3"><StatusBadge text={r.priority} /></td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(r.targetDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {wf.requiredDocs && wf.requiredDocs.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Required Documents</h3>
              <ul className="space-y-1">
                {wf.requiredDocs.map(docId => {
                  const doc = D.documents.find(d => d.id === docId);
                  return doc ? (
                    <li key={docId}>
                      <Link to={`/knowledge-base/${docId}`} className="text-sm text-blue-600 hover:underline">{doc.shortTitle || doc.title}</Link>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          )}
          {wf.outputTemplates && wf.outputTemplates.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Output Templates</h3>
              <ul className="space-y-1">
                {wf.outputTemplates.map(tid => {
                  const t = D.templates.find(t => t.id === tid);
                  return t ? (
                    <li key={tid}>
                      <Link to={`/templates/${tid}`} className="text-sm text-blue-600 hover:underline">{t.name}</Link>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          )}
          {wf.relatedMetrics && wf.relatedMetrics.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Related Metrics</h3>
              <ul className="space-y-1">
                {wf.relatedMetrics.map(kId => {
                  const k = D.kpis.find(k => k.id === kId);
                  return k ? (
                    <li key={kId}>
                      <Link to="/metrics" className="text-sm text-blue-600 hover:underline">{k.name}</Link>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
