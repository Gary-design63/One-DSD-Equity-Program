import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { StatusBadge, TypeBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { EntityModal, ConfirmDeleteModal, useCRUD } from '@/components/shared/EntityModal';
import { getAppData } from '@/data/appData';
import { useAuth } from '@/hooks/useAuth';
import { roleName } from '@/lib/helpers';

export default function TemplateDetail() {
  const { id } = useParams<{ id: string }>();
  const D = getAppData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { saveTemplate, deleteTemplate } = useCRUD();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [, forceUpdate] = useState(0);

  const tmpl = D.templates.find(t => t.id === id);
  if (!tmpl) return <EmptyState message="Template not found" />;

  const editFields = [
    { name: 'name', label: 'Name', type: 'text' as const, required: true },
    { name: 'type', label: 'Type', type: 'select' as const, required: true, options: ['Template', 'Form', 'Checklist'] },
    { name: 'description', label: 'Description', type: 'textarea' as const, required: true, rows: 3 },
    { name: 'owner', label: 'Owner', type: 'select' as const, required: true, placeholder: 'Select owner',
      options: D.roles.map(r => ({ value: r.id, label: r.name })) },
    { name: 'audience', label: 'Audience', type: 'text' as const },
    { name: 'status', label: 'Status', type: 'select' as const, required: true, options: ['Active', 'Draft', 'Under Review', 'Archived'] },
    { name: 'version', label: 'Version', type: 'text' as const },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/templates" className="hover:text-blue-600">Templates</Link>
        <span>/</span>
        <span className="text-gray-900">{tmpl.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tmpl.name}</h1>
          <div className="flex gap-2 mt-2">
            <TypeBadge type={tmpl.type} />
            <StatusBadge text={tmpl.status} />
            <span className="text-sm text-gray-500">v{tmpl.version || '1.0'}</span>
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
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-700">{tmpl.description}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-gray-500">Type</dt><dd>{tmpl.type}</dd>
              <dt className="text-gray-500">Owner</dt><dd>{roleName(D, tmpl.owner)}</dd>
              {tmpl.audience && <><dt className="text-gray-500">Audience</dt><dd>{tmpl.audience}</dd></>}
              <dt className="text-gray-500">Status</dt><dd><StatusBadge text={tmpl.status} /></dd>
            </dl>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Linked Workflows</h3>
            {(tmpl.linkedWorkflows || []).length === 0 ? <p className="text-sm text-gray-500">None</p> :
              <ul className="space-y-1">
                {(tmpl.linkedWorkflows || []).map(wId => {
                  const w = D.workflows.find(w => w.id === wId);
                  return w ? <li key={wId}><Link to={`/workflows/${wId}`} className="text-sm text-blue-600 hover:underline">{w.name}</Link></li> : null;
                })}
              </ul>
            }
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Linked Documents</h3>
            {(tmpl.linkedDocs || []).length === 0 ? <p className="text-sm text-gray-500">None</p> :
              <ul className="space-y-1">
                {(tmpl.linkedDocs || []).map(docId => {
                  const doc = D.documents.find(d => d.id === docId);
                  return doc ? <li key={docId}><Link to={`/knowledge-base/${docId}`} className="text-sm text-blue-600 hover:underline">{doc.shortTitle || doc.title}</Link></li> : null;
                })}
              </ul>
            }
          </div>
        </div>
      </div>

      <EntityModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Template"
        fields={editFields}
        initialData={tmpl as unknown as Record<string, unknown>}
        onSave={(data) => {
          saveTemplate(data, tmpl);
          setEditOpen(false);
          forceUpdate(n => n + 1);
        }}
      />
      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        entityType="Template"
        entityName={tmpl.name}
        onConfirm={() => deleteTemplate(id!, () => navigate('/templates'))}
      />
    </div>
  );
}
