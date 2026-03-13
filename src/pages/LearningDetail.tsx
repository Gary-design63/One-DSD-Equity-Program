import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { StatusBadge, TypeBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { EntityModal, ConfirmDeleteModal, useCRUD } from '@/components/shared/EntityModal';
import { getAppData } from '@/data/appData';
import { useAuth } from '@/hooks/useAuth';
import { roleName } from '@/lib/helpers';

interface Completion {
  user_name?: string;
  user_id?: string;
  completed_at: string;
}

export default function LearningDetail() {
  const { id } = useParams<{ id: string }>();
  const D = getAppData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { saveLearningAsset, deleteLearningAsset } = useCRUD();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [completionsLoading, setCompletionsLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [, forceUpdate] = useState(0);

  const asset = D.learningAssets.find(a => a.id === id);

  const loadCompletions = async () => {
    if (!id) return;
    const apiUrl = window.AGENT_API_URL || 'http://localhost:3000';
    try {
      const res = await fetch(`${apiUrl}/api/learning/completions?assetId=${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error('Backend unavailable');
      const data = await res.json();
      setCompletions(data.completions || []);
    } catch {
      setCompletions([]);
    } finally {
      setCompletionsLoading(false);
    }
  };

  useEffect(() => { loadCompletions(); }, [id]);

  if (!asset) return <EmptyState message="Learning asset not found" />;

  const handleMarkComplete = async () => {
    const apiUrl = window.AGENT_API_URL || 'http://localhost:3000';
    const userId = user?.email || 'consultant';
    const userName = user?.name || userId;
    setMarkingComplete(true);
    try {
      await fetch(`${apiUrl}/api/learning/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: id, userId, userName }),
      });
      await loadCompletions();
    } catch {
      alert('Could not record completion. Make sure the backend is running.');
    } finally {
      setMarkingComplete(false);
    }
  };

  const editFields = [
    { name: 'title', label: 'Title', type: 'text' as const, required: true },
    { name: 'type', label: 'Type', type: 'select' as const, required: true, options: ['Course', 'Microlearning', 'Job Aid'] },
    { name: 'description', label: 'Description', type: 'textarea' as const, required: true, rows: 3 },
    { name: 'requiredOrOptional', label: 'Required / Optional', type: 'select' as const, required: true, options: ['Required', 'Optional'] },
    { name: 'estimatedDuration', label: 'Estimated Duration', type: 'text' as const },
    { name: 'owner', label: 'Owner', type: 'select' as const, required: true, placeholder: 'Select owner',
      options: D.roles.map(r => ({ value: r.id, label: r.name })) },
    { name: 'status', label: 'Status', type: 'select' as const, required: true, options: ['Active', 'Draft', 'Under Review', 'Archived'] },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/learning" className="hover:text-blue-600">Learning Portal</Link>
        <span>/</span>
        <span className="text-gray-900">{asset.title}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{asset.title}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <TypeBadge type={asset.type} />
            <StatusBadge text={asset.requiredOrOptional} />
            <StatusBadge text={asset.status} />
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
            <p className="text-sm text-gray-700">{asset.description}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-gray-500">Type</dt><dd>{asset.type}</dd>
              {asset.estimatedDuration && <><dt className="text-gray-500">Duration</dt><dd>{asset.estimatedDuration}</dd></>}
              <dt className="text-gray-500">Required / Optional</dt><dd><StatusBadge text={asset.requiredOrOptional} /></dd>
              <dt className="text-gray-500">Owner</dt><dd>{roleName(D, asset.owner)}</dd>
              <dt className="text-gray-500">Status</dt><dd><StatusBadge text={asset.status} /></dd>
            </dl>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Audience</h3>
            <div className="flex flex-wrap gap-2">
              {(asset.audience || []).map(au => (
                <span key={au} className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-700">{au}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Source Docs */}
          {(asset.sourceDocs || []).length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Source Documents</h3>
              <ul className="space-y-1">
                {(asset.sourceDocs || []).map(docId => {
                  const doc = D.documents.find(d => d.id === docId);
                  return doc ? <li key={docId}><Link to={`/knowledge-base/${docId}`} className="text-sm text-blue-600 hover:underline">{doc.shortTitle || doc.title}</Link></li> : null;
                })}
              </ul>
            </div>
          )}

          {/* Linked Workflows */}
          {(asset.linkedWorkflows || []).length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Linked Workflows</h3>
              <ul className="space-y-1">
                {(asset.linkedWorkflows || []).map(wId => {
                  const w = D.workflows.find(w => w.id === wId);
                  return w ? <li key={wId}><Link to={`/workflows/${wId}`} className="text-sm text-blue-600 hover:underline">{w.name}</Link></li> : null;
                })}
              </ul>
            </div>
          )}

          {/* Completion Tracking */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Completion Tracking</h3>
            {completionsLoading ? (
              <p className="text-sm text-gray-500">Loading completions…</p>
            ) : completions.length > 0 ? (
              <div>
                <p className="text-sm text-gray-500 mb-2">{completions.length} completion{completions.length > 1 ? 's' : ''} recorded</p>
                <ul className="divide-y divide-gray-100">
                  {completions.map((c, i) => (
                    <li key={i} className="flex justify-between py-1.5 text-sm">
                      <span>{c.user_name || c.user_id}</span>
                      <span className="text-gray-500">{new Date(c.completed_at).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No completions recorded yet.</p>
            )}
            <button
              onClick={handleMarkComplete}
              disabled={markingComplete}
              className="mt-3 flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {markingComplete ? 'Marking…' : 'Mark as Complete'}
            </button>
          </div>
        </div>
      </div>

      <EntityModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Learning Asset"
        fields={editFields}
        initialData={asset as unknown as Record<string, unknown>}
        onSave={(data) => {
          saveLearningAsset(data, asset);
          setEditOpen(false);
          forceUpdate(n => n + 1);
        }}
      />
      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        entityType="Learning Asset"
        entityName={asset.title}
        onConfirm={() => deleteLearningAsset(id!, () => navigate('/learning'))}
      />
    </div>
  );
}
