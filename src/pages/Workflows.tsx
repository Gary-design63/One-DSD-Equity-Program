import React, { useState } from "react";
import { useData } from "../store";
import { Workflow, WorkflowRun, formatDate } from "../data";
import {
  Card, SectionHeader, Badge, Table, Tr, Td, SearchBar, FilterSelect,
  DetailPanel, StatRow, EmptyState, Modal, FieldRow, inputCls, selectCls,
  textareaCls, FormButtons, StagePipeline,
} from "../components/shared";
import { Plus, Edit2, Trash2 } from "lucide-react";

function RunForm({ run, workflows, roles, onSave, onCancel }: {
  run: Partial<WorkflowRun>;
  workflows: Workflow[];
  roles: { id: string; name: string }[];
  onSave: (r: Partial<WorkflowRun>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<WorkflowRun>>(run);
  const set = (k: keyof WorkflowRun, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  const selectedWf = workflows.find((w) => w.id === form.workflowId);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <FieldRow label="Title">
        <input className={inputCls} value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} required />
      </FieldRow>
      <FieldRow label="Workflow">
        <select className={selectCls} value={form.workflowId ?? ""} onChange={(e) => set("workflowId", e.target.value)} required>
          <option value="">Select workflow…</option>
          {workflows.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </FieldRow>
      {selectedWf && (
        <FieldRow label="Current Stage">
          <select className={selectCls} value={form.currentStage ?? ""} onChange={(e) => set("currentStage", e.target.value)}>
            <option value="">Select stage…</option>
            {[...selectedWf.stages].sort((a, b) => a.order - b.order).map((s) => (
              <option key={s.name} value={s.name}>{s.order}. {s.name}</option>
            ))}
          </select>
        </FieldRow>
      )}
      <FieldRow label="Priority">
        <select className={selectCls} value={form.priority ?? "Medium"} onChange={(e) => set("priority", e.target.value)}>
          <option>High</option><option>Medium</option><option>Low</option>
        </select>
      </FieldRow>
      <FieldRow label="Status">
        <select className={selectCls} value={form.status ?? "In Progress"} onChange={(e) => set("status", e.target.value)}>
          <option>In Progress</option><option>Completed</option><option>On Hold</option>
        </select>
      </FieldRow>
      <FieldRow label="Requested By">
        <input className={inputCls} value={form.requestedBy ?? ""} onChange={(e) => set("requestedBy", e.target.value)} />
      </FieldRow>
      <FieldRow label="Assigned To (Role ID)">
        <select className={selectCls} value={form.assignedTo ?? ""} onChange={(e) => set("assignedTo", e.target.value)}>
          <option value="">Select role…</option>
          {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </FieldRow>
      <FieldRow label="Start Date">
        <input type="date" className={inputCls} value={form.startDate ?? ""} onChange={(e) => set("startDate", e.target.value)} />
      </FieldRow>
      <FieldRow label="Target Date">
        <input type="date" className={inputCls} value={form.targetDate ?? ""} onChange={(e) => set("targetDate", e.target.value)} />
      </FieldRow>
      <FieldRow label="Description">
        <textarea className={textareaCls} rows={2} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
      </FieldRow>
      <FieldRow label="Notes">
        <textarea className={textareaCls} rows={2} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
      </FieldRow>
      <FormButtons onCancel={onCancel} submitLabel={run.id ? "Save Changes" : "Create Run"} />
    </form>
  );
}

export default function Workflows() {
  const { data, addWorkflowRun, updateWorkflowRun, deleteWorkflowRun } = useData();
  const [wfDetail, setWfDetail] = useState<string | null>(null);
  const [runDetail, setRunDetail] = useState<string | null>(null);
  const [runFilter, setRunFilter] = useState("");
  const [modal, setModal] = useState<null | "add" | { run: WorkflowRun }>(null);
  const [confirmDelete, setConfirmDelete] = useState<WorkflowRun | null>(null);

  // ─── Run Detail ───────────────────────────────────────────────────────────
  const runDetailObj = runDetail ? data.workflowRuns.find((r) => r.id === runDetail) : null;
  if (runDetailObj) {
    const wf = data.workflows.find((w) => w.id === runDetailObj.workflowId);
    const assignee = data.roles.find((r) => r.id === runDetailObj.assignedTo);
    return (
      <DetailPanel
        title={runDetailObj.title}
        onBack={() => setRunDetail(null)}
        badge={<Badge text={runDetailObj.status} />}
        meta={
          <>
            <span>Run: {runDetailObj.id}</span>
            <span>Workflow: {wf?.name}</span>
            <Badge text={runDetailObj.priority} />
          </>
        }
      >
        {wf && (
          <Card className="mb-5">
            <h3 className="font-semibold text-gray-900 mb-3">Stage Progress</h3>
            <StagePipeline stages={wf.stages} currentStage={runDetailObj.currentStage} />
          </Card>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
            <StatRow label="Requested By" value={runDetailObj.requestedBy} />
            <StatRow label="Assigned To" value={assignee?.name ?? runDetailObj.assignedTo} />
            <StatRow label="Start Date" value={formatDate(runDetailObj.startDate)} />
            <StatRow label="Target Date" value={formatDate(runDetailObj.targetDate)} />
            <StatRow label="Current Stage" value={runDetailObj.currentStage} />
          </Card>
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-sm text-gray-600">{runDetailObj.description}</p>
            {runDetailObj.notes && (
              <div className="mt-3">
                <h4 className="text-xs font-semibold text-gray-500 mb-1">Notes</h4>
                <p className="text-sm text-gray-600">{runDetailObj.notes}</p>
              </div>
            )}
          </Card>
        </div>
      </DetailPanel>
    );
  }

  // ─── Workflow Detail ──────────────────────────────────────────────────────
  const wfDetailObj = wfDetail ? data.workflows.find((w) => w.id === wfDetail) : null;
  if (wfDetailObj) {
    const runs = data.workflowRuns.filter((r) => r.workflowId === wfDetailObj.id);
    const owner = data.roles.find((r) => r.id === wfDetailObj.owner);
    return (
      <DetailPanel
        title={wfDetailObj.name}
        onBack={() => setWfDetail(null)}
        badge={<Badge text={wfDetailObj.status} />}
        meta={<><span>{wfDetailObj.id}</span><span>Owner: {owner?.name ?? wfDetailObj.owner}</span></>}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Stages</h3>
              <StagePipeline stages={wfDetailObj.stages} />
            </Card>
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-sm text-gray-600">{wfDetailObj.description}</p>
            </Card>
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Active Runs</h3>
              {runs.length === 0 ? <EmptyState message="No runs for this workflow." /> : (
                <Table headers={["Run Title", "Stage", "Priority", "Status"]}>
                  {runs.map((r) => (
                    <Tr key={r.id} onClick={() => setRunDetail(r.id)}>
                      <Td className="font-medium">{r.title}</Td>
                      <Td>{r.currentStage}</Td>
                      <Td><Badge text={r.priority} /></Td>
                      <Td><Badge text={r.status} /></Td>
                    </Tr>
                  ))}
                </Table>
              )}
            </Card>
          </div>
          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
              <StatRow label="Trigger" value={wfDetailObj.trigger} />
              <StatRow label="Review Frequency" value={wfDetailObj.reviewFrequency} />
              <StatRow label="Required Docs" value={wfDetailObj.requiredDocs.join(", ") || "—"} />
              <StatRow label="Output Templates" value={wfDetailObj.outputTemplates.join(", ") || "—"} />
            </Card>
          </div>
        </div>
      </DetailPanel>
    );
  }

  // ─── Main View ────────────────────────────────────────────────────────────
  const filteredRuns = data.workflowRuns.filter((r) => !runFilter || r.status === runFilter);

  return (
    <div className="space-y-8">
      {/* Workflow Cards */}
      <section>
        <SectionHeader title="Workflows" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.workflows.map((wf) => {
            const runs = data.workflowRuns.filter((r) => r.workflowId === wf.id);
            const owner = data.roles.find((r) => r.id === wf.owner);
            return (
              <Card key={wf.id} onClick={() => setWfDetail(wf.id)} className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 flex-1">{wf.name}</h3>
                  <Badge text={wf.status} />
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{wf.description}</p>
                <div className="flex gap-3 text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">
                  <span>{wf.stages.length} stages</span>
                  <span>{runs.length} runs</span>
                  <span className="ml-auto">{owner?.name ?? wf.owner}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Workflow Runs */}
      <section>
        <SectionHeader
          title="Workflow Runs"
          action={
            <div className="flex gap-3 items-center">
              <FilterSelect value={runFilter} onChange={setRunFilter} options={["In Progress", "Completed", "On Hold"]} placeholder="All Statuses" />
              <button
                onClick={() => setModal("add")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                <Plus size={15} /> New Run
              </button>
            </div>
          }
        />
        <Card className="p-0 overflow-hidden">
          <Table headers={["Title", "Workflow", "Stage", "Priority", "Target Date", "Status", "Actions"]}>
            {filteredRuns.length === 0 && <tr><td colSpan={7}><EmptyState message="No runs found." /></td></tr>}
            {filteredRuns.map((run) => {
              const wf = data.workflows.find((w) => w.id === run.workflowId);
              return (
                <Tr key={run.id} onClick={() => setRunDetail(run.id)}>
                  <Td className="font-medium">{run.title}</Td>
                  <Td className="text-xs text-gray-500">{wf?.name}</Td>
                  <Td className="text-xs">{run.currentStage}</Td>
                  <Td><Badge text={run.priority} /></Td>
                  <Td>{formatDate(run.targetDate)}</Td>
                  <Td><Badge text={run.status} /></Td>
                  <Td>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setModal({ run })} className="text-gray-400 hover:text-blue-600 p-1"><Edit2 size={14} /></button>
                      <button onClick={() => setConfirmDelete(run)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </Table>
        </Card>
      </section>

      {modal && (
        <Modal title={modal === "add" ? "New Workflow Run" : "Edit Run"} onClose={() => setModal(null)} size="lg">
          <RunForm
            run={modal === "add" ? { status: "In Progress", priority: "Medium", linkedDocs: [], linkedTemplates: [] } : (modal as { run: WorkflowRun }).run}
            workflows={data.workflows}
            roles={data.roles}
            onSave={(form) => {
              if (modal === "add") addWorkflowRun(form as Omit<WorkflowRun, "id">);
              else updateWorkflowRun({ ...(modal as { run: WorkflowRun }).run, ...form } as WorkflowRun);
              setModal(null);
            }}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDelete(null)} size="sm">
          <p className="text-sm text-gray-600 mb-5">Delete run <strong>{confirmDelete.title}</strong>?</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
            <button onClick={() => { deleteWorkflowRun(confirmDelete.id); setConfirmDelete(null); }} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
