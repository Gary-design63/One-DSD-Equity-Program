import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, GraduationCap } from 'lucide-react';
import { StatusBadge, TypeBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { EntityModal, useCRUD } from '@/components/shared/EntityModal';
import { getAppData } from '@/data/appData';
import { useAuth } from '@/hooks/useAuth';

export default function Learning() {
  const D = getAppData();
  const { user } = useAuth();
  const { saveLearningAsset } = useCRUD();

  const [typeFilter, setTypeFilter] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');
  const [reqFilter, setReqFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [, forceUpdate] = useState(0);

  const types = useMemo(() => [...new Set(D.learningAssets.map(a => a.type))].sort(), [D.learningAssets]);
  const audiences = useMemo(() => [...new Set(D.learningAssets.flatMap(a => a.audience || []))].sort(), [D.learningAssets]);

  const filtered = useMemo(() => {
    let assets = D.learningAssets;
    if (typeFilter) assets = assets.filter(a => a.type === typeFilter);
    if (audienceFilter) assets = assets.filter(a => (a.audience || []).includes(audienceFilter));
    if (reqFilter) assets = assets.filter(a => a.requiredOrOptional === reqFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      assets = assets.filter(a => (a.title + ' ' + a.description).toLowerCase().includes(q));
    }
    return assets;
  }, [D.learningAssets, typeFilter, audienceFilter, reqFilter, searchQuery]);

  const assetFields = [
    { name: 'title', label: 'Title', type: 'text' as const, required: true, placeholder: 'Learning asset title' },
    { name: 'type', label: 'Type', type: 'select' as const, required: true, options: ['Course', 'Microlearning', 'Job Aid'] },
    { name: 'description', label: 'Description', type: 'textarea' as const, required: true, rows: 3 },
    { name: 'requiredOrOptional', label: 'Required / Optional', type: 'select' as const, required: true, options: ['Required', 'Optional'] },
    { name: 'estimatedDuration', label: 'Estimated Duration', type: 'text' as const, placeholder: 'e.g., 45 minutes' },
    { name: 'owner', label: 'Owner', type: 'select' as const, required: true, placeholder: 'Select owner',
      options: D.roles.map(r => ({ value: r.id, label: r.name })) },
    { name: 'status', label: 'Status', type: 'select' as const, required: true, options: ['Active', 'Draft', 'Under Review', 'Archived'] },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <GraduationCap className="w-5 h-5" /> Learning Portal
        </h2>
        {user?.isAdmin && (
          <button
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="w-4 h-4" /> Add Learning Asset
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm" value={audienceFilter} onChange={e => setAudienceFilter(e.target.value)}>
          <option value="">All Audiences</option>
          {audiences.map(a => <option key={a}>{a}</option>)}
        </select>
        <select className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm" value={reqFilter} onChange={e => setReqFilter(e.target.value)}>
          <option value="">Required & Optional</option>
          <option>Required</option>
          <option>Optional</option>
        </select>
        <input
          type="search"
          className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm flex-1 min-w-48"
          placeholder="Search learning assets…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? <EmptyState message="No learning assets match filters" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(a => (
            <Link
              key={a.id}
              to={`/learning/${a.id}`}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all block"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-medium text-gray-900 leading-tight">{a.title}</span>
                <TypeBadge type={a.type} />
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">{a.description.slice(0, 100)}…</p>
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge text={a.requiredOrOptional} />
                {a.estimatedDuration && <span className="text-xs text-gray-500">{a.estimatedDuration}</span>}
              </div>
              <div className="flex flex-wrap gap-1">
                {(a.audience || []).map(au => (
                  <span key={au} className="inline-flex items-center rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600">{au}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}

      <EntityModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Learning Asset"
        fields={assetFields}
        initialData={{ type: 'Course', requiredOrOptional: 'Optional', status: 'Active' }}
        onSave={(data) => {
          saveLearningAsset(data);
          setAddOpen(false);
          forceUpdate(n => n + 1);
        }}
      />
    </div>
  );
}
