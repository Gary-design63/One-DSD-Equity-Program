import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Play, Plus } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { EntityModal, useCRUD } from '@/components/shared/EntityModal';
import { getAppData } from '@/data/appData';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, roleName } from '@/lib/helpers';

export default function Workflows() {
  const D = getAppData();
  const { user } = useAuth();
  const { saveRun } = useCRUD();
  const [addRunOpen, setAddRunOpen] = useState(false);
  const [, forceUpdate] = useState(0);

  const runFields = [
    { name: 'title', label: 'Title', type: 'text' as const, required: true, placeholder: 'Run title' },
    { name: 'description', label: 'Description', type: 'textarea' as const, rows: 3 },
    { name: 'workflowId', label: 'Workflow', type: 'select' as const, required: true, placeholder: 'Select workflow',
      options: D.workflows.map(w => ({ value: w.id, label: w.name })) },
    { name: 'status', label: 'Status', type: 'select' as const, required: true, options: ['In Progress', 'On Hold', 'Completed'] },
    { name: 'priority', label: 'Priority', type: 'select' as const, required: true, options: ['High', 'Medium', 'Low'] },
    { name: 'requestedBy', label: 'Requested By', type: 'select' as const, required: true, placeholder: 'Select role',
      options: D.roles.map(r => ({ value: r.id, label: r.name })) },
    { name: 'assignedTo', label: 'Assigned To', type: 'select' as const, required: true, placeholder: 'Select role',
      options: D.roles.map(r => ({ value: r.id, label: r.name })) },
    { name: 'startDate', label: 'Start Date', type: 'date' as const },
    { name: 'targetDate', label: 'Target Date', type: 'date' as const },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <Layers className="w-5 h-5" /> Workflows
        </h2>
      </div>

      {/* Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {D.workflows.map(w => {
          const runs = D.workflowRuns.filter(r => r.workflowId === w.id);
          const activeCount = runs.filter(r => r.status !== 'Completed').length;
          return (
            <Link
              key={w.id}
              to={`/workflows/${w.id}`}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all block"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-medium text-gray-900">{w.name}</span>
                <StatusBadge text={w.status} />
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{w.description.slice(0, 120)}…</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {w.stages.length} stages</span>
                <span className="flex items-center gap-1"><Play className="w-3.5 h-3.5" /> {activeCount} active run{activeCount !== 1 ? 's' : ''}</span>
                <span>{roleName(D, w.owner)}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* All Runs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <Play className="w-5 h-5" /> All Workflow Runs
          </h2>
          <button
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            onClick={() => setAddRunOpen(true)}
          >
            <Plus className="w-4 h-4" /> Start New Run
          </button>
        </div>

        {D.workflowRuns.length === 0 ? <EmptyState message="No workflow runs" /> : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Title','Workflow','Stage','Status','Priority','Target'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {D.workflowRuns.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3">
                      <Link to={`/workflows/run/${r.id}`} className="font-medium text-blue-600 hover:underline">{r.title}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{D.workflows.find(w => w.id === r.workflowId)?.name || r.workflowId}</td>
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

      <EntityModal
        open={addRunOpen}
        onClose={() => setAddRunOpen(false)}
        title="Start New Run"
        fields={runFields}
        initialData={{ status: 'In Progress', priority: 'Medium' }}
        onSave={(data) => {
          saveRun(data);
          setAddRunOpen(false);
          forceUpdate(n => n + 1);
        }}
      />
    </div>
  );
}
