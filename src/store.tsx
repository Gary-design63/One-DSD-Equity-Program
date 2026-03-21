import React, { createContext, useContext, useState } from "react";
import {
  AppData,
  APP_DATA,
  Action,
  Risk,
  Document,
  Template,
  WorkflowRun,
  LearningAsset,
  KPI,
  Role,
  nextId,
} from "./data";

interface DataContextValue {
  data: AppData;
  addAction: (a: Omit<Action, "id">) => void;
  updateAction: (a: Action) => void;
  deleteAction: (id: string) => void;
  addRisk: (r: Omit<Risk, "id">) => void;
  updateRisk: (r: Risk) => void;
  deleteRisk: (id: string) => void;
  addDocument: (d: Omit<Document, "id">) => void;
  updateDocument: (d: Document) => void;
  deleteDocument: (id: string) => void;
  addTemplate: (t: Omit<Template, "id">) => void;
  updateTemplate: (t: Template) => void;
  deleteTemplate: (id: string) => void;
  addWorkflowRun: (r: Omit<WorkflowRun, "id">) => void;
  updateWorkflowRun: (r: WorkflowRun) => void;
  deleteWorkflowRun: (id: string) => void;
  addLearningAsset: (a: Omit<LearningAsset, "id">) => void;
  updateLearningAsset: (a: LearningAsset) => void;
  deleteLearningAsset: (id: string) => void;
  updateKPI: (k: KPI) => void;
  addRole: (r: Omit<Role, "id">) => void;
  updateRole: (r: Role) => void;
  deleteRole: (id: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(APP_DATA);

  function mutate<K extends keyof AppData>(key: K, updater: (arr: AppData[K]) => AppData[K]) {
    setData((prev) => ({ ...prev, [key]: updater(prev[key]) }));
  }

  // Actions
  const addAction = (a: Omit<Action, "id">) =>
    mutate("actions", (arr) => [...arr, { ...a, id: nextId("ACT", arr) }]);
  const updateAction = (a: Action) =>
    mutate("actions", (arr) => arr.map((x) => (x.id === a.id ? a : x)));
  const deleteAction = (id: string) =>
    mutate("actions", (arr) => arr.filter((x) => x.id !== id));

  // Risks
  const addRisk = (r: Omit<Risk, "id">) =>
    mutate("risks", (arr) => [...arr, { ...r, id: nextId("RISK", arr) }]);
  const updateRisk = (r: Risk) =>
    mutate("risks", (arr) => arr.map((x) => (x.id === r.id ? r : x)));
  const deleteRisk = (id: string) =>
    mutate("risks", (arr) => arr.filter((x) => x.id !== id));

  // Documents
  const addDocument = (d: Omit<Document, "id">) =>
    mutate("documents", (arr) => [...arr, { ...d, id: nextId("DOC", arr) }]);
  const updateDocument = (d: Document) =>
    mutate("documents", (arr) => arr.map((x) => (x.id === d.id ? d : x)));
  const deleteDocument = (id: string) =>
    mutate("documents", (arr) => arr.filter((x) => x.id !== id));

  // Templates
  const addTemplate = (t: Omit<Template, "id">) =>
    mutate("templates", (arr) => [...arr, { ...t, id: nextId("TMP", arr) }]);
  const updateTemplate = (t: Template) =>
    mutate("templates", (arr) => arr.map((x) => (x.id === t.id ? t : x)));
  const deleteTemplate = (id: string) =>
    mutate("templates", (arr) => arr.filter((x) => x.id !== id));

  // Workflow Runs
  const addWorkflowRun = (r: Omit<WorkflowRun, "id">) =>
    mutate("workflowRuns", (arr) => [...arr, { ...r, id: nextId("RUN", arr) }]);
  const updateWorkflowRun = (r: WorkflowRun) =>
    mutate("workflowRuns", (arr) => arr.map((x) => (x.id === r.id ? r : x)));
  const deleteWorkflowRun = (id: string) =>
    mutate("workflowRuns", (arr) => arr.filter((x) => x.id !== id));

  // Learning Assets
  const addLearningAsset = (a: Omit<LearningAsset, "id">) =>
    mutate("learningAssets", (arr) => [...arr, { ...a, id: nextId("LA", arr) }]);
  const updateLearningAsset = (a: LearningAsset) =>
    mutate("learningAssets", (arr) => arr.map((x) => (x.id === a.id ? a : x)));
  const deleteLearningAsset = (id: string) =>
    mutate("learningAssets", (arr) => arr.filter((x) => x.id !== id));

  // KPIs (edit-only)
  const updateKPI = (k: KPI) =>
    mutate("kpis", (arr) => arr.map((x) => (x.id === k.id ? k : x)));

  // Roles
  const addRole = (r: Omit<Role, "id">) =>
    mutate("roles", (arr) => [...arr, { ...r, id: nextId("ROLE", arr) }]);
  const updateRole = (r: Role) =>
    mutate("roles", (arr) => arr.map((x) => (x.id === r.id ? r : x)));
  const deleteRole = (id: string) =>
    mutate("roles", (arr) => arr.filter((x) => x.id !== id));

  return (
    <DataContext.Provider
      value={{
        data,
        addAction, updateAction, deleteAction,
        addRisk, updateRisk, deleteRisk,
        addDocument, updateDocument, deleteDocument,
        addTemplate, updateTemplate, deleteTemplate,
        addWorkflowRun, updateWorkflowRun, deleteWorkflowRun,
        addLearningAsset, updateLearningAsset, deleteLearningAsset,
        updateKPI,
        addRole, updateRole, deleteRole,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
