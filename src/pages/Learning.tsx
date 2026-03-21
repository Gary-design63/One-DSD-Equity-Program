import React, { useState } from "react";
import { useData } from "../store";
import { LearningAsset } from "../data";
import {
  Card, SectionHeader, Badge, SearchBar, FilterSelect, DetailPanel,
  StatRow, EmptyState, Modal, FieldRow, inputCls, selectCls, textareaCls, FormButtons,
} from "../components/shared";
import { Plus, Edit2, Trash2, Clock, BookOpen } from "lucide-react";

function AssetForm({ asset, onSave, onCancel, roles, workflows }: {
  asset: Partial<LearningAsset>;
  onSave: (a: Partial<LearningAsset>) => void;
  onCancel: () => void;
  roles: { id: string; name: string }[];
  workflows: { id: string; name: string }[];
}) {
  const [form, setForm] = useState<Partial<LearningAsset>>(asset);
  const set = (k: keyof LearningAsset, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <FieldRow label="Title">
        <input className={inputCls} value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} required />
      </FieldRow>
      <FieldRow label="Type">
        <select className={selectCls} value={form.type ?? "Course"} onChange={(e) => set("type", e.target.value)}>
          <option>Course</option><option>Microlearning</option><option>Job Aid</option>
        </select>
      </FieldRow>
      <FieldRow label="Required or Optional">
        <select className={selectCls} value={form.requiredOrOptional ?? "Optional"} onChange={(e) => set("requiredOrOptional", e.target.value)}>
          <option>Required</option><option>Optional</option>
        </select>
      </FieldRow>
      <FieldRow label="Status">
        <select className={selectCls} value={form.status ?? "Active"} onChange={(e) => set("status", e.target.value)}>
          <option>Active</option><option>In Development</option><option>Archived</option>
        </select>
      </FieldRow>
      <FieldRow label="Audience">
        <input className={inputCls} value={form.audience ?? ""} onChange={(e) => set("audience", e.target.value)} />
      </FieldRow>
      <FieldRow label="Estimated Duration">
        <input className={inputCls} value={form.estimatedDuration ?? ""} onChange={(e) => set("estimatedDuration", e.target.value)} placeholder="e.g. 45 minutes" />
      </FieldRow>
      <FieldRow label="Owner (Role ID)">
        <select className={selectCls} value={form.owner ?? ""} onChange={(e) => set("owner", e.target.value)}>
          <option value="">Select role…</option>
          {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </FieldRow>
      <FieldRow label="Description">
        <textarea className={textareaCls} rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
      </FieldRow>
      <FormButtons onCancel={onCancel} submitLabel={asset.id ? "Save Changes" : "Add Asset"} />
    </form>
  );
}

export default function Learning() {
  const { data, addLearningAsset, updateLearningAsset, deleteLearningAsset } = useData();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [reqFilter, setReqFilter] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [modal, setModal] = useState<null | "add" | { asset: LearningAsset }>(null);
  const [confirmDelete, setConfirmDelete] = useState<LearningAsset | null>(null);

  const filtered = data.learningAssets.filter((a) => {
    const q = search.toLowerCase();
    const matchQ = !q || a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
    const matchType = !typeFilter || a.type === typeFilter;
    const matchReq = !reqFilter || a.requiredOrOptional === reqFilter;
    return matchQ && matchType && matchReq;
  });

  const detail = detailId ? data.learningAssets.find((a) => a.id === detailId) : null;

  if (detail) {
    const owner = data.roles.find((r) => r.id === detail.owner);
    const sourceDocs = detail.sourceDocs.map((id) => data.documents.find((d) => d.id === id)).filter(Boolean);
    const linkedWfs = detail.linkedWorkflows.map((id) => data.workflows.find((w) => w.id === id)).filter(Boolean);
    return (
      <DetailPanel
        title={detail.title}
        onBack={() => setDetailId(null)}
        badge={<Badge text={detail.type} />}
        meta={
          <>
            <Badge text={detail.requiredOrOptional} />
            <Badge text={detail.status} />
            <span className="flex items-center gap-1"><Clock size={12} />{detail.estimatedDuration}</span>
          </>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-sm text-gray-600">{detail.description}</p>
            </Card>
            {sourceDocs.length > 0 && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-3">Source Documents</h3>
                <div className="space-y-1">
                  {sourceDocs.map((d) => d && <div key={d.id} className="text-sm text-gray-600">{d.shortTitle || d.title}</div>)}
                </div>
              </Card>
            )}
            {linkedWfs.length > 0 && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-3">Linked Workflows</h3>
                <div className="space-y-1">
                  {linkedWfs.map((w) => w && <div key={w.id} className="text-sm text-blue-700 font-medium">{w.name}</div>)}
                </div>
              </Card>
            )}
          </div>
          <div>
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
              <StatRow label="ID" value={detail.id} />
              <StatRow label="Type" value={detail.type} />
              <StatRow label="Audience" value={detail.audience} />
              <StatRow label="Duration" value={detail.estimatedDuration} />
              <StatRow label="Owner" value={owner?.name ?? detail.owner} />
            </Card>
          </div>
        </div>
      </DetailPanel>
    );
  }

  const types = [...new Set(data.learningAssets.map((a) => a.type))];

  return (
    <div>
      <SectionHeader
        title="Learning Portal"
        action={
          <button onClick={() => setModal("add")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            <Plus size={15} /> Add Asset
          </button>
        }
      />
      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search learning assets…" />
        <FilterSelect value={typeFilter} onChange={setTypeFilter} options={types} placeholder="All Types" />
        <FilterSelect value={reqFilter} onChange={setReqFilter} options={["Required", "Optional"]} placeholder="All" />
        {(search || typeFilter || reqFilter) && (
          <button onClick={() => { setSearch(""); setTypeFilter(""); setReqFilter(""); }} className="text-sm text-gray-500 hover:text-gray-700">Clear</button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && <EmptyState message="No learning assets match your filters." />}
        {filtered.map((a) => (
          <Card key={a.id} onClick={() => setDetailId(a.id)} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-blue-500 shrink-0 mt-0.5" />
                <h3 className="text-sm font-semibold text-gray-900">{a.title}</h3>
              </div>
              <Badge text={a.requiredOrOptional} />
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">{a.description}</p>
            <div className="flex gap-2 flex-wrap mt-auto pt-2 border-t border-gray-100">
              <Badge text={a.type} />
              <Badge text={a.status} />
              <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                <Clock size={11} /> {a.estimatedDuration}
              </span>
            </div>
            <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setModal({ asset: a })} className="text-gray-400 hover:text-blue-600 p-1"><Edit2 size={13} /></button>
              <button onClick={() => setConfirmDelete(a)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={13} /></button>
            </div>
          </Card>
        ))}
      </div>

      {modal && (
        <Modal title={modal === "add" ? "Add Learning Asset" : "Edit Asset"} onClose={() => setModal(null)} size="lg">
          <AssetForm
            asset={modal === "add" ? { status: "Active", type: "Course", requiredOrOptional: "Optional", sourceDocs: [], linkedWorkflows: [] } : (modal as { asset: LearningAsset }).asset}
            roles={data.roles}
            workflows={data.workflows}
            onSave={(form) => {
              if (modal === "add") addLearningAsset(form as Omit<LearningAsset, "id">);
              else updateLearningAsset({ ...(modal as { asset: LearningAsset }).asset, ...form } as LearningAsset);
              setModal(null);
            }}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDelete(null)} size="sm">
          <p className="text-sm text-gray-600 mb-5">Delete <strong>{confirmDelete.title}</strong>?</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
            <button onClick={() => { deleteLearningAsset(confirmDelete.id); setConfirmDelete(null); }} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
