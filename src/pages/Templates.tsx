import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { StatusBadge, TypeBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { EntityModal, useCRUD } from '@/components/shared/EntityModal';
import { getAppData } from '@/data/appData';
import { useAuth } from '@/hooks/useAuth';
import { roleName } from '@/lib/helpers';

export default function Templates() {
  const D = getAppData();
  const { user } = useAuth();
  const { saveTemplate } = useCRUD();
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [, forceUpdate] = useState(0);

  const types = useMemo(() => [...new Set(D.templates.map(t => t.type))].sort(), [D.templates]);

  const filtered = useMemo(() => {
    let tmps = D.templates;
    if (typeFilter) tmps = tmps.filter(t => t.type === typeFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      tmps = tmps.filter(t => t.name.toLowerCase().includes(q));
    }
    return tmps;
  }, [D.templates, typeFilter, searchQuery]);

  const templateFields = [
    { name: 'name', label: 'Name', type: 'text' as const, required: true, placeholder: 'Template name' },
    { name: 'type', label: 'Type', type: 'select' as const, required: true, options: ['Template', 'Form', 'Checklist'] },
    { name: 'description', label: 'Description', type: 'textarea' as const, required: true, rows: 3 },
    { name: 'owner', label: 'Owner', type: 'select' as const, required: true, placeholder: 'Select owner',
      options: D.roles.map(r => ({ value: r.id, label: r.name })) },
    { name: 'audience', label: 'Audience', type: 'text' as const, placeholder: 'Target audience' },
    { name: 'status', label: 'Status', type: 'select' as const, required: true, options: ['Active', 'Draft', 'Under Review', 'Archived'] },
    { name: 'version', label: 'Version', type: 'text' as const, placeholder: 'e.g., 1.0' },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <FileText className="w-5 h-5" /> Templates & Forms
        </h2>
        {user?.isAdmin && (
          <button
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="w-4 h-4" /> Add Template
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
        <input
          type="search"
          className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm flex-1 min-w-48"
          placeholder="Search templates…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Name','Type','Linked Workflows','Owner','Status','Version'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={6}><EmptyState message="No templates match" /></td></tr>
            ) : filtered.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link to={`/templates/${t.id}`} className="font-medium text-blue-600 hover:underline">{t.name}</Link>
                </td>
                <td className="px-4 py-3"><TypeBadge type={t.type} /></td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {(t.linkedWorkflows || []).map(id => D.workflows.find(w => w.id === id)?.name).filter(Boolean).join(', ') || '—'}
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{roleName(D, t.owner)}</td>
                <td className="px-4 py-3"><StatusBadge text={t.status} /></td>
                <td className="px-4 py-3 text-gray-500">{t.version || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EntityModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Template"
        fields={templateFields}
        initialData={{ type: 'Template', status: 'Active', version: '1.0' }}
        onSave={(data) => {
          saveTemplate(data);
          setAddOpen(false);
          forceUpdate(n => n + 1);
        }}
      />
    </div>
  );
}
