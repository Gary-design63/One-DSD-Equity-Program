import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { EntityModal, ConfirmDeleteModal, useCRUD } from '@/components/shared/EntityModal';
import { getAppData } from '@/data/appData';
import { useAuth } from '@/hooks/useAuth';

export default function RoleDetail() {
  const { id } = useParams<{ id: string }>();
  const D = getAppData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { saveRole, deleteRole } = useCRUD();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [, forceUpdate] = useState(0);

  const role = D.roles.find(r => r.id === id);
  if (!role) return <EmptyState message="Role not found" />;

  const ownedDocs = D.documents.filter(d => d.owner === id);
  const ownedWfs = D.workflows.filter(w => w.owner === id);
  const ownedKpis = D.kpis.filter(k => k.owner === id);
  const ownedTmps = D.templates.filter(t => t.owner === id);
  const ownedLAs = D.learningAssets.filter(a => a.owner === id);

  const editFields = [
    { name: 'name', label: 'Name', type: 'text' as const, required: true },
    { name: 'type', label: 'Type', type: 'select' as const, required: true,
      options: ['Program Owner', 'Approver', 'Requester', 'Contributor', 'Analyst'] },
    { name: 'purpose', label: 'Purpose', type: 'textarea' as const, required: true, rows: 3 },
    { name: 'active', label: 'Active', type: 'checkbox' as const, checkLabel: 'Role is currently active' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/roles" className="hover:text-blue-600">Roles</Link>
        <span>/</span>
        <span className="text-gray-900">{role.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{role.name}</h1>
          <div className="flex gap-2 mt-2">
            <StatusBadge text={role.type} color="muted" />
            <StatusBadge text={role.active ? 'Active' : 'Inactive'} color={role.active ? 'success' : 'muted'} />
          </div>
        </div>
        {user?.isAdmin && (
          <div className="flex gap-2">
            <button onClick={() => setEditOpen(true)} className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={() => setDeleteOpen(true)} className="flex items-center gap-1 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-md hover:bg-red-50">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Purpose</h3>
            <p className="text-sm text-gray-700">{role.purpose}</p>
          </div>
          {(role.responsibilities || []).length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Responsibilities</h3>
              <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                {role.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
          {(role.decisionAuthority || []).length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Decision Authority</h3>
              <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                {role.decisionAuthority.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
          {(role.reviewScope || []).length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Review Scope</h3>
              <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                {role.reviewScope.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar — owned entities */}
        <div className="space-y-4">
          {ownedDocs.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Owned Documents ({ownedDocs.length})</h3>
              <ul className="space-y-1">
                {ownedDocs.map(d => <li key={d.id}><Link to={`/knowledge-base/${d.id}`} className="text-sm text-blue-600 hover:underline">{d.shortTitle || d.title}</Link></li>)}
              </ul>
            </div>
          )}
          {ownedWfs.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Owned Workflows ({ownedWfs.length})</h3>
              <ul className="space-y-1">
                {ownedWfs.map(w => <li key={w.id}><Link to={`/workflows/${w.id}`} className="text-sm text-blue-600 hover:underline">{w.name}</Link></li>)}
              </ul>
            </div>
          )}
          {ownedKpis.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Owned KPIs ({ownedKpis.length})</h3>
              <ul className="space-y-1">
                {ownedKpis.map(k => <li key={k.id}><Link to="/metrics" className="text-sm text-blue-600 hover:underline">{k.name}</Link></li>)}
              </ul>
            </div>
          )}
          {ownedTmps.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Owned Templates ({ownedTmps.length})</h3>
              <ul className="space-y-1">
                {ownedTmps.map(t => <li key={t.id}><Link to={`/templates/${t.id}`} className="text-sm text-blue-600 hover:underline">{t.name}</Link></li>)}
              </ul>
            </div>
          )}
          {ownedLAs.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Owned Learning Assets ({ownedLAs.length})</h3>
              <ul className="space-y-1">
                {ownedLAs.map(a => <li key={a.id}><Link to={`/learning/${a.id}`} className="text-sm text-blue-600 hover:underline">{a.title}</Link></li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      <EntityModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Role"
        fields={editFields}
        initialData={role as unknown as Record<string, unknown>}
        onSave={(data) => {
          saveRole(data, role);
          setEditOpen(false);
          forceUpdate(n => n + 1);
        }}
      />
      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        entityType="Role"
        entityName={role.name}
        onConfirm={() => deleteRole(id!, () => navigate('/roles'))}
      />
    </div>
  );
}
