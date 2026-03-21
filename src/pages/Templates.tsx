import React, { useState } from "react";
import { useData } from "../store";
import { Template } from "../data";
import {
  Card, SectionHeader, Badge, Table, Tr, Td, SearchBar, FilterSelect,
  DetailPanel, StatRow, EmptyState, Modal, FieldRow, inputCls, selectCls,
  textareaCls, FormButtons,
} from "../components/shared";
import { Plus, Edit2, Trash2 } from "lucide-react";

function TemplateForm({ tmpl, onSave, onCancel }: {
  tmpl: Partial<Template>;
  onSave: (t: Partial<Template>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Template>>(tmpl);
  const set = (k: keyof Template, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <FieldRow label="Name">
        <input className={inputCls} value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} required />
      </FieldRow>
      <FieldRow label="Type">
        <select className={selectCls} value={form.type ?? "Template"} onChange={(e) => set("type", e.target.value)}>
          <option>Form</option><option>Template</option><option>Checklist</option><option>Report</option><option>Log</option>
        </select>
      </FieldRow>
      <FieldRow label="Status">
        <select className={selectCls} value={form.status ?? "Active"} onChange={(e) => set("status", e.target.value)}>
          <option>Active</option><option>In Development</option><option>Archived</option>
        </select>
      </FieldRow>
      <FieldRow label="Version">
        <input className={inputCls} value={form.version ?? "1.0"} onChange={(e) => set("version", e.target.value)} />
      </FieldRow>
      <FieldRow label="Owner (Role ID)">
        <input className={inputCls} value={form.owner ?? ""} onChange={(e) => set("owner", e.target.value)} />
      </FieldRow>
      <FieldRow label="Audience">
        <input className={inputCls} value={form.audience ?? ""} onChange={(e) => set("audience", e.target.value)} />
      </FieldRow>
      <FieldRow label="Description">
        <textarea className={textareaCls} rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
      </FieldRow>
      <FormButtons onCancel={onCancel} submitLabel={tmpl.id ? "Save Changes" : "Add Template"} />
    </form>
  );
}

export default function Templates() {
  const { data, addTemplate, updateTemplate, deleteTemplate } = useData();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [modal, setModal] = useState<null | "add" | { tmpl: Template }>(null);
  const [confirmDelete, setConfirmDelete] = useState<Template | null>(null);

  const types = [...new Set(data.templates.map((t) => t.type))];

  const filtered = data.templates.filter((t) => {
    const q = search.toLowerCase();
    const matchQ = !q || t.name.toLowerCase().includes(q) || t.type.toLowerCase().includes(q);
    const matchType = !typeFilter || t.type === typeFilter;
    const matchStatus = !statusFilter || t.status === statusFilter;
    return matchQ && matchType && matchStatus;
  });

  const detail = detailId ? data.templates.find((t) => t.id === detailId) : null;

  if (detail) {
    const owner = data.roles.find((r) => r.id === detail.owner);
    const linkedWfs = detail.linkedWorkflows.map((id) => data.workflows.find((w) => w.id === id)).filter(Boolean);
    const linkedDocs = detail.linkedDocs.map((id) => data.documents.find((d) => d.id === id)).filter(Boolean);
    return (
      <DetailPanel
        title={detail.name}
        onBack={() => setDetailId(null)}
        badge={<Badge text={detail.type} />}
        meta={<><span>v{detail.version}</span><Badge text={detail.status} /><span>Owner: {owner?.name ?? detail.owner}</span></>}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-sm text-gray-600">{detail.description}</p>
            </Card>
            {linkedWfs.length > 0 && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-3">Linked Workflows</h3>
                <div className="space-y-1">
                  {linkedWfs.map((w) => w && (
                    <div key={w.id} className="text-sm text-blue-700 font-medium">{w.name}</div>
                  ))}
                </div>
              </Card>
            )}
            {linkedDocs.length > 0 && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-3">Linked Documents</h3>
                <div className="space-y-1">
                  {linkedDocs.map((d) => d && (
                    <div key={d.id} className="text-sm text-gray-600">{d.shortTitle || d.title}</div>
                  ))}
                </div>
              </Card>
            )}
          </div>
          <div>
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
              <StatRow label="ID" value={detail.id} />
              <StatRow label="Type" value={detail.type} />
              <StatRow label="Version" value={detail.version} />
              <StatRow label="Status" value={<Badge text={detail.status} />} />
              <StatRow label="Audience" value={detail.audience} />
              <StatRow label="Owner" value={owner?.name ?? detail.owner} />
            </Card>
          </div>
        </div>
      </DetailPanel>
    );
  }

  return (
    <div>
      <SectionHeader
        title="Templates"
        action={
          <button onClick={() => setModal("add")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            <Plus size={15} /> Add Template
          </button>
        }
      />
      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search templates…" />
        <FilterSelect value={typeFilter} onChange={setTypeFilter} options={types} placeholder="All Types" />
        <FilterSelect value={statusFilter} onChange={setStatusFilter} options={["Active", "In Development", "Archived"]} placeholder="All Statuses" />
        {(search || typeFilter || statusFilter) && (
          <button onClick={() => { setSearch(""); setTypeFilter(""); setStatusFilter(""); }} className="text-sm text-gray-500 hover:text-gray-700">Clear</button>
        )}
      </div>

      <Card className="p-0 overflow-hidden">
        <Table headers={["Name", "Type", "Version", "Audience", "Status", "Actions"]}>
          {filtered.length === 0 && <tr><td colSpan={6}><EmptyState message="No templates match your filters." /></td></tr>}
          {filtered.map((t) => (
            <Tr key={t.id} onClick={() => setDetailId(t.id)}>
              <Td>
                <div className="font-medium text-gray-900">{t.name}</div>
                <div className="text-xs text-gray-400">{t.id}</div>
              </Td>
              <Td><Badge text={t.type} /></Td>
              <Td className="text-xs text-gray-500">v{t.version}</Td>
              <Td className="text-xs text-gray-500">{t.audience}</Td>
              <Td><Badge text={t.status} /></Td>
              <Td>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setModal({ tmpl: t })} className="text-gray-400 hover:text-blue-600 p-1"><Edit2 size={14} /></button>
                  <button onClick={() => setConfirmDelete(t)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>

      {modal && (
        <Modal title={modal === "add" ? "Add Template" : "Edit Template"} onClose={() => setModal(null)} size="lg">
          <TemplateForm
            tmpl={modal === "add" ? { status: "Active", type: "Template", version: "1.0" } : (modal as { tmpl: Template }).tmpl}
            onSave={(form) => {
              if (modal === "add") addTemplate(form as Omit<Template, "id">);
              else updateTemplate({ ...(modal as { tmpl: Template }).tmpl, ...form } as Template);
              setModal(null);
            }}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDelete(null)} size="sm">
          <p className="text-sm text-gray-600 mb-5">Delete <strong>{confirmDelete.name}</strong>?</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
            <button onClick={() => { deleteTemplate(confirmDelete.id); setConfirmDelete(null); }} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
