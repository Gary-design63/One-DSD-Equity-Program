import React, { useState, useMemo } from 'react';
import { Plus, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { EntityModal, ConfirmDeleteModal, useCRUD } from '@/components/shared/EntityModal';
import { getAppData } from '@/data/appData';
import { useAuth } from '@/hooks/useAuth';
import { roleName } from '@/lib/helpers';

export default function Risks() {
  const D = getAppData();
  const { user } = useAuth();
  const { saveRisk, deleteRisk } = useCRUD();

  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editRisk, setEditRisk] = useState<typeof D.risks[0] | null>(null);
  const [deleteRisk_, setDeleteRisk] = useState<typeof D.risks[0] | null>(null);
  const [, forceUpdate] = useState(0);

  const filtered = useMemo(() => {
    let items = D.risks;
    if (severityFilter) items = items.filter(r => r.severity === severityFilter);
    if (statusFilter) items = items.filter(r => r.status === statusFilter);
    return items;
  }, [D.risks, severityFilter, statusFilter]);

  const riskFields = [
    { name: 'title', label: 'Title', type: 'text' as const, required: true, placeholder: 'Risk title' },
    { name: 'description', label: 'Description', type: 'textarea' as const, required: true, rows: 3 },
    { name: 'severity', label: 'Severity', type: 'select' as const, required: true, options: ['High', 'Medium', 'Low'] },
    { name: 'likelihood', label: 'Likelihood', type: 'select' as const, required: true, options: ['High', 'Medium', 'Low'] },
    { name: 'status', label: 'Status', type: 'select' as const, required: true, options: ['Active', 'Monitoring', 'Mitigated', 'Closed'] },
    { name: 'owner', label: 'Owner', type: 'select' as const, required: true, placeholder: 'Select owner',
      options: D.roles.map(r => ({ value: r.id, label: r.name })) },
    { name: 'mitigationPlan', label: 'Mitigation Plan', type: 'textarea' as const, required: true, rows: 4 },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <AlertTriangle className="w-5 h-5" /> Risk Registry
        </h2>
        {user?.isAdmin && (
          <button
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="w-4 h-4" /> Add Risk
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <select className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
          <option value="">All Severities</option>
          <option>High</option><option>Medium</option><option>Low</option>
        </select>
        <select className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option>Active</option><option>Monitoring</option><option>Mitigated</option><option>Closed</option>
        </select>
      </div>

      {filtered.length === 0 ? <EmptyState message="No risks match filters" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <span className="font-medium text-gray-900">{r.title}</span>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <StatusBadge text={r.status} />
                  {user?.isAdmin && (
                    <>
                      <button onClick={() => setEditRisk(r)} className="p-1 hover:bg-gray-100 rounded">
                        <Pencil className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      <button onClick={() => setDeleteRisk(r)} className="p-1 hover:bg-red-50 rounded">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{r.description}</p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
                <dt className="text-gray-500">Severity</dt><dd><StatusBadge text={r.severity} /></dd>
                <dt className="text-gray-500">Likelihood</dt><dd><StatusBadge text={r.likelihood} /></dd>
                <dt className="text-gray-500">Owner</dt><dd className="text-gray-700 text-xs">{roleName(D, r.owner)}</dd>
              </dl>
              <div className="bg-gray-50 rounded-lg p-3 mt-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-1">Mitigation Plan</h4>
                <p className="text-sm text-gray-600">{r.mitigationPlan}</p>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {(r.linkedKPIs || []).map(kId => {
                  const k = D.kpis.find(k => k.id === kId);
                  return k ? <Link key={kId} to="/metrics" className="text-xs text-blue-600 hover:underline">{k.id}</Link> : null;
                })}
                {(r.linkedWorkflows || []).map(wId => {
                  const w = D.workflows.find(w => w.id === wId);
                  return w ? <Link key={wId} to={`/workflows/${wId}`} className="text-xs text-blue-600 hover:underline">{w.name}</Link> : null;
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <EntityModal
        open={addOpen || editRisk !== null}
        onClose={() => { setAddOpen(false); setEditRisk(null); }}
        title={editRisk ? 'Edit Risk' : 'Add Risk'}
        fields={riskFields}
        initialData={editRisk ? (editRisk as unknown as Record<string, unknown>) : { severity: 'Medium', likelihood: 'Medium', status: 'Active' }}
        onSave={(data) => {
          if (editRisk) {
            saveRisk(data, editRisk);
            setEditRisk(null);
          } else {
            saveRisk(data);
            setAddOpen(false);
          }
          forceUpdate(n => n + 1);
        }}
      />

      {deleteRisk_ && (
        <ConfirmDeleteModal
          open={true}
          onClose={() => setDeleteRisk(null)}
          entityType="Risk"
          entityName={deleteRisk_.title}
          onConfirm={() => {
            deleteRisk(deleteRisk_.id);
            setDeleteRisk(null);
            forceUpdate(n => n + 1);
          }}
        />
      )}
    </div>
  );
}
