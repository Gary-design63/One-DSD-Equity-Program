import React, { useState } from "react";
import { useData } from "../store";
import { Role } from "../data";
import {
  Card, SectionHeader, Badge, Table, Tr, Td, DetailPanel, StatRow,
  EmptyState, Modal, FieldRow, inputCls, selectCls, textareaCls, FormButtons,
} from "../components/shared";
import { Plus, Edit2, Trash2, Users } from "lucide-react";

function RoleForm({ role, onSave, onCancel }: { role: Partial<Role>; onSave: (r: Partial<Role>) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Partial<Role>>(role);
  const set = (k: keyof Role, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <FieldRow label="Name">
        <input className={inputCls} value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} required />
      </FieldRow>
      <FieldRow label="Type">
        <input className={inputCls} value={form.type ?? ""} onChange={(e) => set("type", e.target.value)} placeholder="e.g. Program Owner, Reviewer, Contributor" />
      </FieldRow>
      <FieldRow label="Purpose">
        <textarea className={textareaCls} rows={3} value={form.purpose ?? ""} onChange={(e) => set("purpose", e.target.value)} />
      </FieldRow>
      <FormButtons onCancel={onCancel} submitLabel={role.id ? "Save Changes" : "Add Role"} />
    </form>
  );
}

export default function Roles() {
  const { data, addRole, updateRole, deleteRole } = useData();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [modal, setModal] = useState<null | "add" | { role: Role }>(null);
  const [confirmDelete, setConfirmDelete] = useState<Role | null>(null);

  const detail = detailId ? data.roles.find((r) => r.id === detailId) : null;

  if (detail) {
    const ownedDocs = data.documents.filter((d) => d.owner === detail.id);
    const ownedTemplates = data.templates.filter((t) => t.owner === detail.id);
    const ownedAssets = data.learningAssets.filter((a) => a.owner === detail.id);
    const ownedWfs = data.workflows.filter((w) => w.owner === detail.id);
    const assignedRuns = data.workflowRuns.filter((r) => r.assignedTo === detail.id);
    const ownedActions = data.actions.filter((a) => a.owner === detail.id);

    return (
      <DetailPanel
        title={detail.name}
        onBack={() => setDetailId(null)}
        badge={<Badge text={detail.type} />}
        meta={<><span>{detail.id}</span><Badge text={detail.active ? "Active" : "Inactive"} /></>}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Purpose</h3>
              <p className="text-sm text-gray-600">{detail.purpose}</p>
            </Card>
            {detail.responsibilities.length > 0 && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-3">Responsibilities</h3>
                <ul className="list-disc list-inside space-y-1">
                  {detail.responsibilities.map((r, i) => <li key={i} className="text-sm text-gray-600">{r}</li>)}
                </ul>
              </Card>
            )}
            {detail.decisionAuthority.length > 0 && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-3">Decision Authority</h3>
                <ul className="list-disc list-inside space-y-1">
                  {detail.decisionAuthority.map((r, i) => <li key={i} className="text-sm text-gray-600">{r}</li>)}
                </ul>
              </Card>
            )}
          </div>
          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Owned Assets</h3>
              {[
                { label: "Workflows", items: ownedWfs },
                { label: "Documents", items: ownedDocs },
                { label: "Templates", items: ownedTemplates },
                { label: "Learning Assets", items: ownedAssets },
                { label: "Actions", items: ownedActions },
                { label: "Active Runs", items: assignedRuns },
              ].map(({ label, items }) => (
                <StatRow key={label} label={label} value={
                  items.length > 0
                    ? <span className="text-blue-700 font-medium">{items.length}</span>
                    : <span className="text-gray-400">None</span>
                } />
              ))}
            </Card>
          </div>
        </div>
      </DetailPanel>
    );
  }

  return (
    <div>
      <SectionHeader
        title="Roles"
        action={
          <button onClick={() => setModal("add")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            <Plus size={15} /> Add Role
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.roles.map((role) => {
          const ownedCount = [
            data.documents, data.templates, data.learningAssets, data.workflows
          ].flatMap((arr) => arr).filter((x: any) => x.owner === role.id).length;
          return (
            <Card key={role.id} onClick={() => setDetailId(role.id)} className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-blue-500 shrink-0 mt-0.5" />
                  <h3 className="text-sm font-semibold text-gray-900">{role.name}</h3>
                </div>
                <Badge text={role.type} />
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{role.purpose}</p>
              <div className="flex gap-3 text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">
                <span>{role.responsibilities.length} responsibilities</span>
                <span>{ownedCount} assets</span>
              </div>
              <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setModal({ role })} className="text-gray-400 hover:text-blue-600 p-1"><Edit2 size={13} /></button>
                <button onClick={() => setConfirmDelete(role)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={13} /></button>
              </div>
            </Card>
          );
        })}
      </div>

      {modal && (
        <Modal title={modal === "add" ? "Add Role" : "Edit Role"} onClose={() => setModal(null)} size="lg">
          <RoleForm
            role={modal === "add" ? { active: true, responsibilities: [], decisionAuthority: [], reviewScope: [] } : (modal as { role: Role }).role}
            onSave={(form) => {
              if (modal === "add") addRole(form as Omit<Role, "id">);
              else updateRole({ ...(modal as { role: Role }).role, ...form } as Role);
              setModal(null);
            }}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDelete(null)} size="sm">
          <p className="text-sm text-gray-600 mb-5">Delete role <strong>{confirmDelete.name}</strong>?</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
            <button onClick={() => { deleteRole(confirmDelete.id); setConfirmDelete(null); }} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
