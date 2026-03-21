import React, { useState } from "react";
import { useData } from "../store";
import { Risk } from "../data";
import {
  Card, SectionHeader, Badge, SearchBar, FilterSelect,
  EmptyState, Modal, FieldRow, inputCls, selectCls, textareaCls, FormButtons,
} from "../components/shared";
import { Plus, Edit2, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

function RiskForm({ risk, roles, onSave, onCancel }: {
  risk: Partial<Risk>;
  roles: { id: string; name: string }[];
  onSave: (r: Partial<Risk>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Risk>>(risk);
  const set = (k: keyof Risk, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <FieldRow label="Title">
        <input className={inputCls} value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} required />
      </FieldRow>
      <FieldRow label="Description">
        <textarea className={textareaCls} rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
      </FieldRow>
      <FieldRow label="Severity">
        <select className={selectCls} value={form.severity ?? "Medium"} onChange={(e) => set("severity", e.target.value)}>
          <option>High</option><option>Medium</option><option>Low</option>
        </select>
      </FieldRow>
      <FieldRow label="Likelihood">
        <select className={selectCls} value={form.likelihood ?? "Medium"} onChange={(e) => set("likelihood", e.target.value)}>
          <option>High</option><option>Medium</option><option>Low</option>
        </select>
      </FieldRow>
      <FieldRow label="Status">
        <select className={selectCls} value={form.status ?? "Active"} onChange={(e) => set("status", e.target.value)}>
          <option>Active</option><option>Monitoring</option><option>Mitigated</option><option>Closed</option>
        </select>
      </FieldRow>
      <FieldRow label="Owner">
        <select className={selectCls} value={form.owner ?? ""} onChange={(e) => set("owner", e.target.value)} required>
          <option value="">Select role…</option>
          {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </FieldRow>
      <FieldRow label="Mitigation Plan">
        <textarea className={textareaCls} rows={3} value={form.mitigationPlan ?? ""} onChange={(e) => set("mitigationPlan", e.target.value)} />
      </FieldRow>
      <FormButtons onCancel={onCancel} submitLabel={risk.id ? "Save Changes" : "Add Risk"} />
    </form>
  );
}

const SEVERITY_BORDER: Record<string, string> = {
  High: "border-red-300",
  Medium: "border-yellow-300",
  Low: "border-green-300",
};

export default function Risks() {
  const { data, addRisk, updateRisk, deleteRisk } = useData();
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState<null | "add" | { risk: Risk }>(null);
  const [confirmDelete, setConfirmDelete] = useState<Risk | null>(null);

  const filtered = data.risks.filter((r) => {
    const q = search.toLowerCase();
    const matchQ = !q || r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
    const matchSev = !severityFilter || r.severity === severityFilter;
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchQ && matchSev && matchStatus;
  });

  return (
    <div>
      <SectionHeader
        title="Risks"
        action={
          <button onClick={() => setModal("add")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            <Plus size={15} /> Add Risk
          </button>
        }
      />
      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search risks…" />
        <FilterSelect value={severityFilter} onChange={setSeverityFilter} options={["High", "Medium", "Low"]} placeholder="All Severities" />
        <FilterSelect value={statusFilter} onChange={setStatusFilter} options={["Active", "Monitoring", "Mitigated", "Closed"]} placeholder="All Statuses" />
        {(search || severityFilter || statusFilter) && (
          <button onClick={() => { setSearch(""); setSeverityFilter(""); setStatusFilter(""); }} className="text-sm text-gray-500 hover:text-gray-700">Clear</button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && <EmptyState message="No risks match your filters." />}
        {filtered.map((r) => {
          const owner = data.roles.find((ro) => ro.id === r.owner);
          return (
            <Card key={r.id} className={cn("flex flex-col gap-2 border-l-4", SEVERITY_BORDER[r.severity] ?? "border-gray-300")}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className={r.severity === "High" ? "text-red-500" : r.severity === "Medium" ? "text-yellow-500" : "text-green-500"} />
                  <h3 className="text-sm font-semibold text-gray-900">{r.title}</h3>
                </div>
                <Badge text={r.severity} />
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{r.description}</p>
              {r.mitigationPlan && (
                <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 line-clamp-2">
                  <span className="font-medium">Mitigation: </span>{r.mitigationPlan}
                </div>
              )}
              <div className="flex gap-2 flex-wrap mt-auto pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">Likelihood: <span className="font-medium text-gray-600">{r.likelihood}</span></span>
                <Badge text={r.status} />
                <span className="text-xs text-gray-400 ml-auto">{owner?.name ?? r.owner}</span>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setModal({ risk: r })} className="text-gray-400 hover:text-blue-600 p-1"><Edit2 size={13} /></button>
                <button onClick={() => setConfirmDelete(r)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={13} /></button>
              </div>
            </Card>
          );
        })}
      </div>

      {modal && (
        <Modal title={modal === "add" ? "Add Risk" : "Edit Risk"} onClose={() => setModal(null)} size="lg">
          <RiskForm
            risk={modal === "add" ? { severity: "Medium", likelihood: "Medium", status: "Active", linkedKPIs: [], linkedWorkflows: [] } : (modal as { risk: Risk }).risk}
            roles={data.roles}
            onSave={(form) => {
              if (modal === "add") addRisk(form as Omit<Risk, "id">);
              else updateRisk({ ...(modal as { risk: Risk }).risk, ...form } as Risk);
              setModal(null);
            }}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDelete(null)} size="sm">
          <p className="text-sm text-gray-600 mb-5">Delete risk <strong>{confirmDelete.title}</strong>?</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
            <button onClick={() => { deleteRisk(confirmDelete.id); setConfirmDelete(null); }} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
