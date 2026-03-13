import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShieldCheck } from 'lucide-react';
import { StatusBadge, AuthorityBadge, BatchBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { EntityModal, ConfirmDeleteModal, useCRUD } from '@/components/shared/EntityModal';
import { getAppData } from '@/data/appData';
import { useAuth } from '@/hooks/useAuth';

const DOC_BATCHES = [
  'Governing Authority', 'Institutional Context', 'Equity Analysis and Engagement',
  'Accessibility and Language Access', 'Workforce Equity', 'Service System Operations',
  'Training and Reusable Resources', 'One DSD Program Core Internal', 'Program Operations Internal',
  'Data and Measurement Internal', 'Learning Architecture Internal', 'Templates Internal',
];
const AUTHORITY_TYPES = [
  'Federal Guidance', 'Federal/State Law', 'State Policy', 'Enterprise Policy',
  'Division Policy', 'Program Guidance', 'Operational Procedure', 'Training Resource',
];

export default function KnowledgeBase() {
  const D = getAppData();
  const { user } = useAuth();
  const { saveDocument } = useCRUD();

  const [batchFilter, setBatchFilter] = useState('');
  const [authFilter, setAuthFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [, forceUpdate] = useState(0);

  const batches = useMemo(() => [...new Set(D.documents.map(d => d.batch))].sort(), [D.documents]);
  const types = useMemo(() => [...new Set(D.documents.map(d => d.authorityType))].sort(), [D.documents]);

  const filtered = useMemo(() => {
    let docs = D.documents;
    if (batchFilter) docs = docs.filter(d => d.batch === batchFilter);
    if (authFilter) docs = docs.filter(d => d.authorityType === authFilter);
    if (sourceFilter) docs = docs.filter(d => d.sourceType === sourceFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter(d => (d.title + ' ' + (d.shortTitle || '') + ' ' + d.purpose).toLowerCase().includes(q));
    }
    return [...docs].sort((a, b) => a.authorityRank - b.authorityRank);
  }, [D.documents, batchFilter, authFilter, sourceFilter, searchQuery]);

  const docFields = [
    { name: 'title', label: 'Title', type: 'text' as const, required: true, placeholder: 'Full document title' },
    { name: 'shortTitle', label: 'Short Title', type: 'text' as const, placeholder: 'Abbreviated name' },
    { name: 'batch', label: 'Batch', type: 'select' as const, required: true, placeholder: 'Select batch', options: DOC_BATCHES },
    { name: 'authorityType', label: 'Authority Type', type: 'select' as const, required: true, placeholder: 'Select type', options: AUTHORITY_TYPES },
    { name: 'authorityRank', label: 'Authority Rank', type: 'number' as const, required: true, min: 1, max: 8, step: 1 },
    { name: 'sourceType', label: 'Source Type', type: 'select' as const, required: true, options: ['Public', 'Internal'] },
    { name: 'sourceOrg', label: 'Source Organization', type: 'text' as const, placeholder: 'Originating organization' },
    { name: 'documentType', label: 'Document Type', type: 'text' as const, placeholder: 'e.g., Standards / Framework' },
    { name: 'status', label: 'Status', type: 'select' as const, required: true, options: ['Active', 'Draft', 'Under Review', 'Archived', 'Superseded'] },
    { name: 'owner', label: 'Owner', type: 'select' as const, required: true, placeholder: 'Select owner', options: D.roles.map(r => ({ value: r.id, label: r.name })) },
    { name: 'purpose', label: 'Purpose', type: 'textarea' as const, required: true, rows: 3 },
    { name: 'effectiveDate', label: 'Effective Date', type: 'date' as const },
    { name: 'reviewDate', label: 'Review Date', type: 'date' as const },
    { name: 'sourceOfTruth', label: 'Source of Truth', type: 'checkbox' as const, checkLabel: 'This document is the source of truth' },
    { name: 'requiredForCompliance', label: 'Required for Compliance', type: 'checkbox' as const, checkLabel: 'Required for compliance' },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Knowledge Base</h2>
        {user?.isAdmin && (
          <button
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            onClick={() => setAddModalOpen(true)}
          >
            <Plus className="w-4 h-4" /> Add Document
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
          value={batchFilter}
          onChange={e => setBatchFilter(e.target.value)}
        >
          <option value="">All Batches</option>
          {batches.map(b => <option key={b}>{b}</option>)}
        </select>
        <select
          className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
          value={authFilter}
          onChange={e => setAuthFilter(e.target.value)}
        >
          <option value="">All Authority Types</option>
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
        <select
          className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value)}
        >
          <option value="">All Sources</option>
          <option>Public</option>
          <option>Internal</option>
        </select>
        <input
          type="search"
          className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm flex-1 min-w-48"
          placeholder="Search documents…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <p className="text-sm text-gray-500">{filtered.length} document{filtered.length !== 1 ? 's' : ''}</p>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Title','Batch','Authority','Source','Status','SoT'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={6}><EmptyState message="No documents match filters" /></td></tr>
            ) : filtered.map(d => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link to={`/knowledge-base/${d.id}`} className="font-medium text-blue-600 hover:underline">
                    {d.title}
                  </Link>
                </td>
                <td className="px-4 py-3"><BatchBadge batch={d.batch} /></td>
                <td className="px-4 py-3"><AuthorityBadge rank={d.authorityRank} /></td>
                <td className="px-4 py-3"><StatusBadge text={d.sourceType} color={d.sourceType === 'Public' ? 'primary' : 'gold'} /></td>
                <td className="px-4 py-3"><StatusBadge text={d.status} /></td>
                <td className="px-4 py-3">
                  {d.sourceOfTruth ? <ShieldCheck className="w-4 h-4 text-green-600" /> : <span className="text-gray-400">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Document Modal */}
      <EntityModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Document"
        fields={docFields}
        initialData={{ sourceType: 'Public', status: 'Active', authorityRank: 5 }}
        onSave={(data) => {
          saveDocument(data);
          setAddModalOpen(false);
          forceUpdate(n => n + 1);
        }}
      />
    </div>
  );
}
