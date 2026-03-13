import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Pencil, Trash2, ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { EntityModal, ConfirmDeleteModal, useCRUD } from '@/components/shared/EntityModal';
import { getAppData } from '@/data/appData';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, roleName } from '@/lib/helpers';

export default function RunDetail() {
  const { id } = useParams<{ id: string }>();
  const D = getAppData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { saveRun, deleteRun } = useCRUD();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [, forceUpdate] = useState(0);

  const run = D.workflowRuns.find(r => r.id === id);
  if (!run) return <EmptyState message="Workflow run not found" />;

  const wf = D.workflows.find(w => w.id === run.workflowId);
  const stages = wf ? [...wf.stages].sort((a, b) => a.order - b.order) : [];
  const currentIdx = stages.findIndex(s => s.name === run.currentStage);

  const canAdvance = run.status !== 'Completed' && run.status !== 'Cancelled';

  const handleAdvanceStage = () => {
    const currentStage = run.currentStage || 'current stage';
    const wfTitle = wf ? wf.name : 'workflow';
    if (!confirm(`Ask the Workflow Architect to advance "${run.title}" from "${currentStage}" to the next stage?`)) return;
    const msg = `Please advance workflow run "${run.title}" (${run.id}) from "${currentStage}" to the next stage. The workflow is "${wfTitle}". Confirm the stage was completed and advance it.`;
    navigate('/assistant');
    // Delay to allow navigation
    setTimeout(() => {
      if (window.AGENT?.submitMessage) window.AGENT.submitMessage(msg);
    }, 500);
  };

  const editFields = [
    { name: 'title', label: 'Title', type: 'text' as const, required: true },
    { name: 'description', label: 'Description', type: 'textarea' as const, rows: 3 },
    ...(wf ? [{ name: 'currentStage', label: 'Current Stage', type: 'select' as const, required: true,
      options: stages.map(s => s.name) }] : []),
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
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/workflows" className="hover:text-blue-600">Workflows</Link>
        <span>/</span>
        {wf && <><Link to={`/workflows/${wf.id}`} className="hover:text-blue-600">{wf.name}</Link><span>/</span></>}
        <span className="text-gray-900">{run.title}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{run.title}</h1>
          <div className="flex gap-2 mt-2">
            <StatusBadge text={run.status} />
            <StatusBadge text={run.priority} />
          </div>
        </div>
        <div className="flex gap-2">
          {canAdvance && (
            <button
              onClick={handleAdvanceStage}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <ChevronRight className="w-3.5 h-3.5" /> Advance Stage
            </button>
          )}
          {user?.isAdmin && (
            <>
              <button onClick={() => setEditOpen(true)} className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => setDeleteOpen(true)} className="flex items-center gap-1 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-md hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stage Pipeline */}
      {stages.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {stages.map((s, i) => {
            const state = i < currentIdx ? 'completed' : i === currentIdx ? 'active' : 'upcoming';
            return (
              <React.Fragment key={i}>
                <div className={`rounded-lg px-4 py-2 text-center min-w-24 border ${
                  state === 'active' ? 'bg-blue-600 border-blue-600 text-white' :
                  state === 'completed' ? 'bg-green-50 border-green-300 text-green-800' :
                  'bg-gray-50 border-gray-200 text-gray-500'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1 ${
                    state === 'active' ? 'bg-white text-blue-600' :
                    state === 'completed' ? 'bg-green-500 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                    {state === 'completed' ? '✓' : i + 1}
                  </div>
                  <div className="text-xs font-medium">{s.name}</div>
                </div>
                {i < stages.length - 1 && <span className="text-gray-400 text-lg">›</span>}
              </React.Fragment>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
            <p className="text-sm text-gray-700 mb-4">{run.description}</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {wf && <><dt className="text-gray-500">Workflow</dt><dd><Link to={`/workflows/${wf.id}`} className="text-blue-600 hover:underline">{wf.name}</Link></dd></>}
              <dt className="text-gray-500">Current Stage</dt><dd><StatusBadge text={run.currentStage} color="primary" /></dd>
              <dt className="text-gray-500">Requested By</dt><dd>{roleName(D, run.requestedBy)}</dd>
              <dt className="text-gray-500">Assigned To</dt><dd>{roleName(D, run.assignedTo)}</dd>
              <dt className="text-gray-500">Start Date</dt><dd>{formatDate(run.startDate)}</dd>
              <dt className="text-gray-500">Target Date</dt><dd>{formatDate(run.targetDate)}</dd>
            </dl>
          </div>
          {run.notes && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-700">{run.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Linked Documents</h3>
            {(run.linkedDocs || []).length === 0 ? <p className="text-sm text-gray-500">None</p> :
              <ul className="space-y-1">
                {(run.linkedDocs || []).map(docId => {
                  const doc = D.documents.find(d => d.id === docId);
                  return doc ? <li key={docId}><Link to={`/knowledge-base/${docId}`} className="text-sm text-blue-600 hover:underline">{doc.shortTitle || doc.title}</Link></li> : null;
                })}
              </ul>
            }
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Linked Templates</h3>
            {(run.linkedTemplates || []).length === 0 ? <p className="text-sm text-gray-500">None</p> :
              <ul className="space-y-1">
                {(run.linkedTemplates || []).map(tid => {
                  const t = D.templates.find(t => t.id === tid);
                  return t ? <li key={tid}><Link to={`/templates/${tid}`} className="text-sm text-blue-600 hover:underline">{t.name}</Link></li> : null;
                })}
              </ul>
            }
          </div>
        </div>
      </div>

      <EntityModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Workflow Run"
        fields={editFields}
        initialData={run as unknown as Record<string, unknown>}
        onSave={(data) => {
          saveRun(data, run);
          setEditOpen(false);
          forceUpdate(n => n + 1);
        }}
      />
      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        entityType="Workflow Run"
        entityName={run.title}
        onConfirm={() => deleteRun(id!, () => navigate('/workflows'))}
      />
    </div>
  );
}
