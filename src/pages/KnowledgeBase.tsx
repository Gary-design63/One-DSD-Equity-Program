import React, { useState } from "react";
import { useData } from "../store";
import { Document, formatDate, AUTHORITY_LABELS } from "../data";
import {
  Card, SectionHeader, Badge, AuthorityBadge, Table, Tr, Td,
  SearchBar, FilterSelect, DetailPanel, StatRow, EmptyState, Modal,
  FieldRow, inputCls, selectCls, textareaCls, FormButtons,
} from "../components/shared";
import { Plus, Edit2, Trash2 } from "lucide-react";

const BATCHES = [
  "Governing Authority",
  "Institutional Context",
  "One DSD Program Core Internal",
  "Service System Operations",
  "Accessibility and Language Access",
  "Workforce Equity",
  "Equity Analysis and Engagement",
  "Educational and Reusable Resources",
];

const AUTHORITY_TYPES = Object.entries(AUTHORITY_LABELS).map(([rank, label]) => `${rank}. ${label}`);

function DocForm({ doc, onSave, onCancel }: {
  doc: Partial<Document>;
  onSave: (d: Partial<Document>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Document>>(doc);
  const set = (k: keyof Document, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <FieldRow label="Title">
        <input className={inputCls} value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} required />
      </FieldRow>
      <FieldRow label="Short Title">
        <input className={inputCls} value={form.shortTitle ?? ""} onChange={(e) => set("shortTitle", e.target.value)} />
      </FieldRow>
      <FieldRow label="Batch">
        <select className={selectCls} value={form.batch ?? ""} onChange={(e) => set("batch", e.target.value)} required>
          <option value="">Select batch…</option>
          {BATCHES.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </FieldRow>
      <FieldRow label="Authority Rank (1–8)">
        <select className={selectCls} value={form.authorityRank ?? ""} onChange={(e) => set("authorityRank", Number(e.target.value))} required>
          <option value="">Select rank…</option>
          {Object.entries(AUTHORITY_LABELS).map(([rank, label]) => (
            <option key={rank} value={rank}>{rank}. {label}</option>
          ))}
        </select>
      </FieldRow>
      <FieldRow label="Status">
        <select className={selectCls} value={form.status ?? "Active"} onChange={(e) => set("status", e.target.value)}>
          <option>Active</option>
          <option>Archived</option>
        </select>
      </FieldRow>
      <FieldRow label="Owner (Role ID)">
        <input className={inputCls} value={form.owner ?? ""} onChange={(e) => set("owner", e.target.value)} />
      </FieldRow>
      <FieldRow label="Purpose">
        <textarea className={textareaCls} rows={3} value={form.purpose ?? ""} onChange={(e) => set("purpose", e.target.value)} />
      </FieldRow>
      <FieldRow label="Source Organization">
        <input className={inputCls} value={form.sourceOrg ?? ""} onChange={(e) => set("sourceOrg", e.target.value)} />
      </FieldRow>
      <FieldRow label="Effective Date">
        <input type="date" className={inputCls} value={form.effectiveDate ?? ""} onChange={(e) => set("effectiveDate", e.target.value)} />
      </FieldRow>
      <FieldRow label="Review Date">
        <input type="date" className={inputCls} value={form.reviewDate ?? ""} onChange={(e) => set("reviewDate", e.target.value)} />
      </FieldRow>
      <FormButtons onCancel={onCancel} submitLabel={doc.id ? "Save Changes" : "Add Document"} />
    </form>
  );
}

export default function KnowledgeBase() {
  const { data, addDocument, updateDocument, deleteDocument } = useData();
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [rankFilter, setRankFilter] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [modal, setModal] = useState<null | "add" | { doc: Document }>("add" as null);
  const [confirmDelete, setConfirmDelete] = useState<Document | null>(null);

  const filtered = data.documents.filter((d) => {
    const q = search.toLowerCase();
    const matchQ = !q || d.title.toLowerCase().includes(q) || d.shortTitle?.toLowerCase().includes(q) || d.sourceOrg?.toLowerCase().includes(q);
    const matchB = !batchFilter || d.batch === batchFilter;
    const matchR = !rankFilter || d.authorityRank === Number(rankFilter);
    return matchQ && matchB && matchR;
  });

  const detail = detailId ? data.documents.find((d) => d.id === detailId) : null;

  if (detail) {
    const related = data.relationships.filter((r) => r.fromId === detail.id || r.toId === detail.id);
    const owner = data.roles.find((r) => r.id === detail.owner);
    return (
      <DetailPanel
        title={detail.title}
        onBack={() => setDetailId(null)}
        badge={<AuthorityBadge rank={detail.authorityRank} />}
        meta={
          <>
            <span>{detail.batch}</span>
            <span>{detail.sourceOrg}</span>
            <Badge text={detail.status} />
            {detail.sourceOfTruth && <span className="text-blue-600 font-medium">Source of Truth</span>}
          </>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Purpose</h3>
              <p className="text-sm text-gray-600">{detail.purpose}</p>
            </Card>
            {detail.programRelevance && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-3">Program Relevance</h3>
                <p className="text-sm text-gray-600">{detail.programRelevance}</p>
              </Card>
            )}
            {related.length > 0 && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-3">Relationships</h3>
                <div className="space-y-2">
                  {related.map((r) => (
                    <div key={r.id} className="text-xs text-gray-600 flex gap-2">
                      <span className="font-medium text-blue-700">{r.relationshipType}</span>
                      <span>{r.fromId === detail.id ? r.toId : r.fromId}</span>
                      <span className="text-gray-400">({r.strength})</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
              <StatRow label="Document Type" value={detail.documentType} />
              <StatRow label="Format" value={detail.format} />
              <StatRow label="Audience" value={detail.audience} />
              <StatRow label="Authority Type" value={detail.authorityType} />
              <StatRow label="Source Type" value={detail.sourceType} />
              <StatRow label="Effective Date" value={formatDate(detail.effectiveDate)} />
              <StatRow label="Review Date" value={formatDate(detail.reviewDate)} />
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
        title="Knowledge Base"
        action={
          <button
            onClick={() => setModal("add")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            <Plus size={15} /> Add Document
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search documents…" />
        <FilterSelect
          value={batchFilter}
          onChange={setBatchFilter}
          options={BATCHES}
          placeholder="All Batches"
        />
        <FilterSelect
          value={rankFilter}
          onChange={setRankFilter}
          options={Object.keys(AUTHORITY_LABELS)}
          placeholder="All Authority Ranks"
        />
        {(search || batchFilter || rankFilter) && (
          <button onClick={() => { setSearch(""); setBatchFilter(""); setRankFilter(""); }} className="text-sm text-gray-500 hover:text-gray-700">
            Clear
          </button>
        )}
      </div>

      <Card className="p-0 overflow-hidden">
        <Table headers={["Title", "Batch", "Authority", "Owner", "Status", "Actions"]}>
          {filtered.length === 0 && (
            <tr><td colSpan={6}><EmptyState message="No documents match your filters." /></td></tr>
          )}
          {filtered.map((doc) => {
            const owner = data.roles.find((r) => r.id === doc.owner);
            return (
              <Tr key={doc.id} onClick={() => setDetailId(doc.id)}>
                <Td>
                  <div>
                    <div className="font-medium text-gray-900">{doc.shortTitle || doc.title}</div>
                    <div className="text-xs text-gray-400">{doc.id}</div>
                  </div>
                </Td>
                <Td className="text-xs text-gray-500">{doc.batch}</Td>
                <Td><AuthorityBadge rank={doc.authorityRank} /></Td>
                <Td className="text-xs text-gray-500">{owner?.name ?? doc.owner}</Td>
                <Td><Badge text={doc.status} /></Td>
                <Td>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setModal({ doc })} className="text-gray-400 hover:text-blue-600 p-1"><Edit2 size={14} /></button>
                    <button onClick={() => setConfirmDelete(doc)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                  </div>
                </Td>
              </Tr>
            );
          })}
        </Table>
      </Card>

      {/* Add/Edit Modal */}
      {modal && (
        <Modal
          title={modal === "add" ? "Add Document" : "Edit Document"}
          onClose={() => setModal(null)}
          size="lg"
        >
          <DocForm
            doc={modal === "add" ? { status: "Active", authorityRank: 5 } : (modal as { doc: Document }).doc}
            onSave={(form) => {
              if (modal === "add") addDocument(form as Omit<Document, "id">);
              else updateDocument({ ...(modal as { doc: Document }).doc, ...form } as Document);
              setModal(null);
            }}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDelete(null)} size="sm">
          <p className="text-sm text-gray-600 mb-5">Delete <strong>{confirmDelete.title}</strong>?</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
            <button onClick={() => { deleteDocument(confirmDelete.id); setConfirmDelete(null); }} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
