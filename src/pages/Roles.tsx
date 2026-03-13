import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Check } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { EntityModal, useCRUD } from '@/components/shared/EntityModal';
import { getAppData } from '@/data/appData';
import { useAuth } from '@/hooks/useAuth';

export default function Roles() {
  const D = getAppData();
  const { user } = useAuth();
  const { saveRole } = useCRUD();
  const [addOpen, setAddOpen] = useState(false);
  const [, forceUpdate] = useState(0);

  const roleFields = [
    { name: 'name', label: 'Name', type: 'text' as const, required: true, placeholder: 'Role name' },
    { name: 'type', label: 'Type', type: 'select' as const, required: true,
      options: ['Program Owner', 'Approver', 'Requester', 'Contributor', 'Analyst'] },
    { name: 'purpose', label: 'Purpose', type: 'textarea' as const, required: true, rows: 3 },
    { name: 'active', label: 'Active', type: 'checkbox' as const, checkLabel: 'Role is currently active' },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <Users className="w-5 h-5" /> Roles & Governance
        </h2>
        {user?.isAdmin && (
          <button
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="w-4 h-4" /> Add Role
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Role','Type','Purpose','Active'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {D.roles.length === 0 ? (
              <tr><td colSpan={4}><EmptyState message="No roles" /></td></tr>
            ) : D.roles.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link to={`/roles/${r.id}`} className="font-medium text-blue-600 hover:underline">{r.name}</Link>
                </td>
                <td className="px-4 py-3"><StatusBadge text={r.type} color="muted" /></td>
                <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">{r.purpose.slice(0, 80)}…</td>
                <td className="px-4 py-3">
                  {r.active ? <Check className="w-4 h-4 text-green-600" /> : <span className="text-gray-400">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EntityModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Role"
        fields={roleFields}
        initialData={{ active: true, type: 'Contributor' }}
        onSave={(data) => {
          saveRole(data);
          setAddOpen(false);
          forceUpdate(n => n + 1);
        }}
      />
    </div>
  );
}
