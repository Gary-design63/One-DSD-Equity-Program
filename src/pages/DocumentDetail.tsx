import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Pencil, Trash2, ShieldCheck, Save } from 'lucide-react';
import { StatusBadge, AuthorityBadge, BatchBadge } from '@/components/shared/StatusBadge';
import { EntityModal, ConfirmDeleteModal, useCRUD } from '@/components/shared/EntityModal';
import { EmptyState } from '@/components/shared/EmptyState';
import { getAppData } from '@/data/appData';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, roleName, getRelated } from '@/lib/helpers';

const DOC_BATCHES = [
  'Governing Authority', 'Institutional Context', 'Equity Analysis and Engagement',
  'Accessibility and Language Access', 'Workforce Equity', 'Service System Operations',
  'Training and Reusable Resources', 'One DSD Program Core Internal', 'Program Operations Internal',
  'Data and Measurement Internal', 'Learning Architecture Internal', 'Templates Internal',
];

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const D = getAppData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { saveDocument, deleteDocument } = useCRUD();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [, forceUpdate] = useState(0);
  const [versions, setVersions] = useState<Array<{ version: string; changed_by?: string; change_note?: string; created_at: string }>>([]);
  const [versionsLoading, setVersionsLoading] = useState(true);

  const doc = D.documents.find(d => d.id === id);

  useEffect(() => {
    if (!id) return;
    const apiUrl = window.AGENT_API_URL || 'http://localhost:3000';
    setVersionsLoading(true);
    fetch(`${apiUrl}/api/documents/${encodeURIComponent(id)}/versions`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setVersions(data.versions || []);
        setVersionsLoading(false);
      })
      .catch(() => setVersionsLoading(false));
  }, [id]);

  if (!doc) return <EmptyState message="Document not found" />;

  const rels = getRelated(D, id!);
  const relDocs = rels.filter(r => r.fromType === 'Document' || r.toType === 'Document');
  const relWfs = rels.filter(r => r.fromType === 'Workflow' || r.toType === 'Workflow');
  const relKpis = rels.filter(r => r.fromType === 'KPI' || r.toType === 'KPI' || r.fromType === 'Metric' || r.toType === 'Metric');
  const relTraining = rels.filter(r => r.fromType === 'Learning' || r.toType === 'Learning' || r.fromType === 'Educational' || r.toType === 'Educational');

  const docFields = [
    { name: 'title', label: 'Title', type: 'text' as const, required: true },
    { name: 'shortTitle', label: 'Short Title', type: 'text' as const },
    { name: 'batch', label: 'Batch', type: 'select' as const, required: true, placeholder: 'Select batch', options: DOC_BATCHES },
    { name: 'authorityType', label: 'Authority Type', type: 'select' as const, required: true, placeholder: 'Select type',
      options: ['Federal Guidance','Federal/State Law','State Policy','Enterprise Policy','Division Policy','Program Guidance','Operational Procedure','Training Resource'] },
    { name: 'authorityRank', label: 'Authority Rank', type: 'number' as const, required: true, min: 1, max: 8, step: 1 },
    { name: 'sourceType', label: 'Source Type', type: 'select' as const, required: true, options: ['Public', 'Internal'] },
    { name: 'sourceOrg', label: 'Source Organization', type: 'text' as const },
    { name: 'status', label: 'Status', type: 'select' as const, required: true, options: ['Active','Draft','Under Review','Archived','Superseded'] },
    { name: 'owner', label: 'Owner', type: 'select' as const, required: true, placeholder: 'Select owner', options: D.roles.map(r => ({ value: r.id, label: r.name })) },
    { name: 'purpose', label: 'Purpose', type: 'textarea' as const, required: true, rows: 3 },
    { name: 'effectiveDate', label: 'Effective Date', type: 'date' as const },
    { name: 'reviewDate', label: 'Review Date', type: 'date' as const },
    { name: 'sourceOfTruth', label: 'Source of Truth', type: 'checkbox' as const, checkLabel: 'This document is the source of truth' },
    { name: 'requiredForCompliance', label: 'Required for Compliance', type: 'checkbox' as const, checkLabel: 'Required for compliance' },
  ];

  const saveVersion = async () => {
    const note = window.prompt('Enter a change note (optional):') || '';
    const ver = window.prompt('Version label (e.g. 1.1):', '1.0') || '1.0';
    const apiUrl = window.AGENT_API_URL || 'http://localhost:3000';
    try {
      await fetch(`${apiUrl}/api/documents/${encodeURIComponent(id!)}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: ver, contentSnapshot: doc, changedBy: 'Consultant', changeNote: note }),
      });
    } catch {
      alert('Could not save version. Backend required.');
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/knowledge-base" className="hover:text-blue-600">Knowledge Base</Link>
        <span>/</span>
        <span className="text-gray-900">{doc.shortTitle || doc.title}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{doc.title}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <BatchBadge batch={doc.batch} />
            {doc.secondaryBatch && <BatchBadge batch={doc.secondaryBatch} />}
            <AuthorityBadge rank={doc.authorityRank} />
            <StatusBadge text={doc.status} />
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
            <h3 className="font-semibold text-gray-900 mb-3">Document Information</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {[
                ['Short Title', doc.shortTitle],
                ['Authority Type', doc.authorityType],
                ['Source Type', doc.sourceType],
                ['Source Organization', doc.sourceOrg],
                ['Document Type', doc.documentType],
                ['Format', doc.format],
                ['Audience', doc.audience],
                ['Owner', roleName(D, doc.owner)],
                ['Effective Date', formatDate(doc.effectiveDate)],
                ['Review Date', formatDate(doc.reviewDate)],
                ['Processing Status', doc.processingStatus],
                ['Required for Compliance', doc.requiredForCompliance ? 'Yes' : 'No'],
                ['Equity Method', doc.equityMethod],
                ['Institutional Scope', doc.institutionalScope],
                ['Geographic Scope', doc.geographicScope],
              ].filter(([, v]) => v).map(([l, v]) => (
                <React.Fragment key={String(l)}>
                  <dt className="text-gray-500">{l}</dt>
                  <dd className="text-gray-900">{v}</dd>
                </React.Fragment>
              ))}
              <dt className="text-gray-500">Source of Truth</dt>
              <dd>{doc.sourceOfTruth ? <span className="flex items-center gap-1 text-green-600"><ShieldCheck className="w-4 h-4" /> Yes</span> : 'No'}</dd>
            </dl>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Purpose</h3>
            <p className="text-sm text-gray-700">{doc.purpose}</p>
          </div>

          {doc.notes && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-700">{doc.notes}</p>
            </div>
          )}

          {/* Version History */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Version History</h3>
            {versionsLoading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : versions.length > 0 ? (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-gray-500">
                  <th className="pb-2">Version</th><th className="pb-2">Changed By</th><th className="pb-2">Note</th><th className="pb-2">Date</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {versions.map((v, i) => (
                    <tr key={i}>
                      <td className="py-1.5 font-medium">{v.version}</td>
                      <td className="py-1.5 text-gray-600">{v.changed_by || '—'}</td>
                      <td className="py-1.5 text-gray-600">{v.change_note || '—'}</td>
                      <td className="py-1.5 text-gray-500">{new Date(v.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500">No versions saved yet.</p>
            )}
            <button
              onClick={saveVersion}
              className="mt-3 flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <Save className="w-3.5 h-3.5" /> Save Current Version
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Related Docs */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Related Documents</h3>
            {relDocs.length === 0 ? <p className="text-sm text-gray-500">No related documents</p> :
              relDocs.map(r => {
                const otherId = r.fromId === id ? r.toId : r.fromId;
                const other = D.documents.find(d => d.id === otherId);
                return other ? (
                  <div key={r.id} className="py-1.5 border-b border-gray-100 last:border-0">
                    <Link to={`/knowledge-base/${otherId}`} className="text-sm text-blue-600 hover:underline">{other.shortTitle || other.title}</Link>
                    <span className="ml-2 text-xs text-gray-500">{r.relationshipType}</span>
                  </div>
                ) : null;
              })
            }
          </div>

          {/* Related Workflows */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Related Workflows</h3>
            {relWfs.length === 0 && !doc.relatedWorkflow ? <p className="text-sm text-gray-500">None</p> :
              relWfs.length > 0 ? relWfs.map(r => {
                const wfId = r.fromType === 'Workflow' ? r.fromId : r.toId;
                const wf = D.workflows.find(w => w.id === wfId);
                return wf ? (
                  <div key={r.id} className="py-1.5 border-b border-gray-100 last:border-0">
                    <Link to={`/workflows/${wfId}`} className="text-sm text-blue-600 hover:underline">{wf.name}</Link>
                    <span className="ml-2 text-xs text-gray-500">{r.relationshipType}</span>
                  </div>
                ) : null;
              }) : <p className="text-sm text-gray-600">{doc.relatedWorkflow}</p>
            }
          </div>

          {/* Related Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Related Metrics</h3>
            {relKpis.length === 0 ? <p className="text-sm text-gray-500">None</p> :
              relKpis.map(r => {
                const kId = (r.fromType === 'KPI' || r.fromType === 'Metric') ? r.fromId : r.toId;
                const k = D.kpis.find(k => k.id === kId);
                return k ? (
                  <div key={r.id} className="py-1.5 border-b border-gray-100 last:border-0">
                    <Link to="/metrics" className="text-sm text-blue-600 hover:underline">{k.name}</Link>
                    <span className="ml-2 text-xs text-gray-500">{r.relationshipType}</span>
                  </div>
                ) : null;
              })
            }
          </div>

          {/* Related Learning */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Related Educational Resources</h3>
            {relTraining.length === 0 ? <p className="text-sm text-gray-500">None</p> :
              relTraining.map(r => {
                const tId = (r.fromType === 'Learning' || r.fromType === 'Educational') ? r.fromId : r.toId;
                const la = D.learningAssets.find(a => a.id === tId);
                return la ? (
                  <div key={r.id} className="py-1.5 border-b border-gray-100 last:border-0">
                    <Link to={`/learning/${tId}`} className="text-sm text-blue-600 hover:underline">{la.title}</Link>
                    <span className="ml-2 text-xs text-gray-500">{r.relationshipType}</span>
                  </div>
                ) : null;
              })
            }
          </div>
        </div>
      </div>

      {/* Modals */}
      <EntityModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Document"
        fields={docFields}
        initialData={doc as unknown as Record<string, unknown>}
        onSave={(data) => {
          saveDocument(data, doc);
          setEditOpen(false);
          forceUpdate(n => n + 1);
        }}
      />
      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        entityType="Document"
        entityName={doc.title}
        onConfirm={() => deleteDocument(id!, () => navigate('/knowledge-base'))}
      />
    </div>
  );
}
