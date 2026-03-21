import React, { useState } from "react";
import { useData } from "../store";
import { Action, formatDate } from "../data";
import {
  Card, SectionHeader, Badge, Table, Tr, Td, SearchBar, FilterSelect,
  EmptyState, Modal, FieldRow, inputCls, selectCls, textareaCls, FormButtons,
} from "../components/shared";
import { Plus, Edit2, Trash2 } from "lucide-react";

function ActionForm({ action, roles, onSave, onCancel }: {
  action: Partial<Action>;
  roles: { id: string; name: string }[];
  onSave: (a: Partial<Action>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Action>>(action);
  const set = (k: keyof Action, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <FieldRow label="Title">
        <input className={inputCls} value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} required />
      </FieldRow>
      <FieldRow label="Description">
        <textarea className={textareaCls} rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
      </FieldRow>
      <FieldRow label="Owner">
        <select className={selectCls} value={form.owner ?? ""} onChange={(e) => set("owner", e.target.value)} required>
          <option value="">Select role…</option>
          {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </FieldRow>
      <FieldRow label="Priority">
        <select className={selectCls} value={form.priority ?? "Medium"} onChange={(e) => set("priority", e.target.value)}>
          <option>High</option><option>Medium</option><option>Low</option>
        </select>
      </FieldRow>
      <FieldRow label="Status">
        <select className={selectCls} value={form.status ?? "On Track"} onChange={(e) => set("status", e.target.value)}>
          <option>On Track</option><option>At Risk</option><option>Completed</option><option>Deferred</option>
        </select>
      </FieldRow>
      <FieldRow label="Due Date">
        <input type="date" className={inputCls} value={form.dueDate ?? ""} onChange={(e) => set("dueDate", e.target.value)} />
      </FieldRow>
      <FormButtons onCancel={onCancel} submitLabel={action.id ? "Save Changes" : "Add Action"} />
    </form>
  );
}

export default function Actions() {
  const { data, addAction, updateAction, deleteAction } = useData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [modal, setModal] = useState<null | "add" | { action: Action }>(null);
  const [confirmDelete, setConfirmDelete] = useState<Action | null>(null);

  const filtered = data.actions.filter((a) => {
    const q = search.toLowerCase();
    const matchQ = !q || a.title.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || a.status === statusFilter;
    const matchPriority = !priorityFilter || a.priority === priorityFilter;
    return matchQ && matchStatus && matchPriority;
  });

  return (
    <div>
      <SectionHeader
        title="Actions"
        action={
          <button onClick={() => setModal("add")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            <Plus size={15} /> Add Action
          </button>
        }
      />
      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search actions…" />
        <FilterSelect value={statusFilter} onChange={setStatusFilter} options={["On Track", "At Risk", "Completed", "Deferred"]} placeholder="All Statuses" />
        <FilterSelect value={priorityFilter} onChange={setPriorityFilter} options={["High", "Medium", "Low"]} placeholder="All Priorities" />
        {(search || statusFilter || priorityFilter) && (
          <button onClick={() => { setSearch(""); setStatusFilter(""); setPriorityFilter(""); }} className="text-sm text-gray-500 hover:text-gray-700">Clear</button>
        )}
      </div>

      <Card className="p-0 overflow-hidden">
        <Table headers={["Action", "Owner", "Priority", "Due Date", "Status", ""]}>
          {filtered.length === 0 && <tr><td colSpan={6}><EmptyState message="No actions match your filters." /></td></tr>}
          {filtered.map((a) => {
            const owner = data.roles.find((r) => r.id === a.owner);
            return (
              <Tr key={a.id}>
                <Td>
                  <div className="font-medium text-gray-900">{a.title}</div>
                  {a.description && <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">{a.description}</div>}
                </Td>
                <Td className="text-xs text-gray-500">{owner?.name ?? a.owner}</Td>
                <Td><Badge text={a.priority} /></Td>
                <Td>{formatDate(a.dueDate)}</Td>
                <Td><Badge text={a.status} /></Td>
                <Td>
                  <div className="flex gap-2">
                    <button onClick={() => setModal({ action: a })} className="text-gray-400 hover:text-blue-600 p-1"><Edit2 size={14} /></button>
                    <button onClick={() => setConfirmDelete(a)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                  </div>
                </Td>
              </Tr>
            );
          })}
        </Table>
      </Card>

      {modal && (
        <Modal title={modal === "add" ? "Add Action" : "Edit Action"} onClose={() => setModal(null)} size="md">
          <ActionForm
            action={modal === "add" ? { status: "On Track", priority: "Medium", linkedKPIs: [], linkedWorkflows: [] } : (modal as { action: Action }).action}
            roles={data.roles}
            onSave={(form) => {
              if (modal === "add") addAction(form as Omit<Action, "id">);
              else updateAction({ ...(modal as { action: Action }).action, ...form } as Action);
              setModal(null);
            }}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDelete(null)} size="sm">
          <p className="text-sm text-gray-600 mb-5">Delete action <strong>{confirmDelete.title}</strong>?</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
            <button onClick={() => { deleteAction(confirmDelete.id); setConfirmDelete(null); }} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
