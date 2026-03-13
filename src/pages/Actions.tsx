import React, { useState, useMemo } from 'react';
import { Plus, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { EntityModal, ConfirmDeleteModal, useCRUD } from '@/components/shared/EntityModal';
import { getAppData } from '@/data/appData';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, roleName } from '@/lib/helpers';

export default function Actions() {
  const D = getAppData();
  const { user } = useAuth();
  const { saveAction, deleteAction } = useCRUD();

  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editAction, setEditAction] = useState<typeof D.actions[0] | null>(null);
  const [deleteAction_, setDeleteAction] = useState<typeof D.actions[0] | null>(null);
  const [, forceUpdate] = useState(0);

  const filtered = useMemo(() => {
    let items = D.actions;
    if (statusFilter) items = items.filter(a => a.status === statusFilter);
    if (priorityFilter) items = items.filter(a => a.priority === priorityFilter);
    return items;
  }, [D.actions, statusFilter, priorityFilter]);

  const actionFields = [
    { name: 'title', label: 'Title', type: 'text' as const, required: true, placeholder: 'Action title' },
    { name: 'description', label: 'Description', type: 'textarea' as const, required: true, rows: 3 },
    { name: 'owner', label: 'Owner', type: 'select' as const, required: true, placeholder: 'Select owner',
      options: D.roles.map(r => ({ value: r.id, label: r.name })) },
    { name: 'status', label: 'Status', type: 'select' as const, required: true, options: ['On Track', 'At Risk', 'Overdue', 'Completed'] },
    { name: 'priority', label: 'Priority', type: 'select' as const, required: true, options: ['High', 'Medium', 'Low'] },
    { name: 'dueDate', label: 'Due Date', type: 'date' as const, required: true },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <CheckCircle2 className="w-5 h-5" /> Program Actions
        </h2>
        {user?.isAdmin && (
          <button
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="w-4 h-4" /> Add Action
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <select className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option>On Track</option><option>At Risk</option><option>Overdue</option><option>Completed</option>
        </select>
        <select className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="">All Priorities</option>
          <option>High</option><option>Medium</option><option>Low</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Action','Owner','Status','Priority','Due Date','Linked KPIs','Linked Workflows',''].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={8}><EmptyState message="No actions match filters" /></td></tr>
            ) : filtered.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">{a.description.slice(0, 60)}…</div>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{roleName(D, a.owner)}</td>
                <td className="px-4 py-3"><StatusBadge text={a.status} /></td>
                <td className="px-4 py-3"><StatusBadge text={a.priority} /></td>
                <td className="px-4 py-3 text-gray-600">{formatDate(a.dueDate)}</td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {(a.linkedKPIs || []).map(kId => {
                    const k = D.kpis.find(k => k.id === kId);
                    return k ? <span key={kId} className="mr-1">{k.id}</span> : null;
                  })}
                  {!(a.linkedKPIs || []).length && '—'}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {(a.linkedWorkflows || []).map(wId => {
                    const w = D.workflows.find(w => w.id === wId);
                    return w ? <Link key={wId} to={`/workflows/${wId}`} className="text-blue-600 hover:underline mr-1">{w.name}</Link> : null;
                  })}
                  {!(a.linkedWorkflows || []).length && '—'}
                </td>
                <td className="px-4 py-3">
                  {user?.isAdmin && (
                    <div className="flex gap-1">
                      <button onClick={() => setEditAction(a)} className="p-1 hover:bg-gray-100 rounded">
                        <Pencil className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      <button onClick={() => setDeleteAction(a)} className="p-1 hover:bg-red-50 rounded">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <EntityModal
        open={addOpen || editAction !== null}
        onClose={() => { setAddOpen(false); setEditAction(null); }}
        title={editAction ? 'Edit Action' : 'Add Action'}
        fields={actionFields}
        initialData={editAction ? (editAction as unknown as Record<string, unknown>) : { status: 'On Track', priority: 'Medium' }}
        onSave={(data) => {
          if (editAction) {
            saveAction(data, editAction);
            setEditAction(null);
          } else {
            saveAction(data);
            setAddOpen(false);
          }
          forceUpdate(n => n + 1);
        }}
      />

      {/* Delete Modal */}
      {deleteAction_ && (
        <ConfirmDeleteModal
          open={true}
          onClose={() => setDeleteAction(null)}
          entityType="Action"
          entityName={deleteAction_.title}
          onConfirm={() => {
            deleteAction(deleteAction_.id);
            setDeleteAction(null);
            forceUpdate(n => n + 1);
          }}
        />
      )}
    </div>
  );
}
