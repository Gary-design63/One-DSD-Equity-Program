import { eq } from "drizzle-orm";
import {
  type User, type InsertUser,
  type KnowledgeBase, type InsertKnowledgeBase,
  type Workflow, type InsertWorkflow,
  type Template, type InsertTemplate,
  type Action, type InsertAction,
  type Risk, type InsertRisk,
  type Metric, type InsertMetric,
} from "../shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getKnowledgeBaseItems(): Promise<KnowledgeBase[]>;
  getKnowledgeBaseItem(id: number): Promise<KnowledgeBase | undefined>;
  createKnowledgeBaseItem(item: InsertKnowledgeBase): Promise<KnowledgeBase>;
  updateKnowledgeBaseItem(id: number, item: Partial<InsertKnowledgeBase>): Promise<KnowledgeBase | undefined>;
  deleteKnowledgeBaseItem(id: number): Promise<boolean>;

  getWorkflows(): Promise<Workflow[]>;
  getWorkflow(id: number): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, workflow: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;

  getTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: number): Promise<boolean>;

  getActions(): Promise<Action[]>;
  getAction(id: number): Promise<Action | undefined>;
  createAction(action: InsertAction): Promise<Action>;
  updateAction(id: number, action: Partial<InsertAction>): Promise<Action | undefined>;
  deleteAction(id: number): Promise<boolean>;

  getRisks(): Promise<Risk[]>;
  getRisk(id: number): Promise<Risk | undefined>;
  createRisk(risk: InsertRisk): Promise<Risk>;
  updateRisk(id: number, risk: Partial<InsertRisk>): Promise<Risk | undefined>;
  deleteRisk(id: number): Promise<boolean>;

  getMetrics(): Promise<Metric[]>;
  createMetric(metric: InsertMetric): Promise<Metric>;
}

// ─── In-Memory Storage (works without a database) ────────────────────────────

function makeId() { return Date.now() + Math.floor(Math.random() * 1000); }
function now() { return new Date(); }

export class MemoryStorage implements IStorage {
  private users: User[] = [
    { id: 1, username: "admin", password: "placeholder", displayName: "Program Administrator", role: "admin", createdAt: now() },
  ];

  private kbItems: KnowledgeBase[] = [
    { id: 1, title: "DHS Equity Analysis Toolkit", content: "Comprehensive toolkit for conducting equity analyses across DSD programs.", category: "Governing Authority", tags: ["equity", "analysis", "toolkit"], authorId: 1, createdAt: now(), updatedAt: now() },
    { id: 2, title: "National CLAS Standards", content: "Culturally and Linguistically Appropriate Services standards guide.", category: "Federal/State", tags: ["CLAS", "standards", "language access"], authorId: 1, createdAt: now(), updatedAt: now() },
    { id: 3, title: "Accessibility Review Checklist", content: "Step-by-step checklist for reviewing DSD materials for accessibility compliance.", category: "Program Operations", tags: ["accessibility", "compliance", "checklist"], authorId: 1, createdAt: now(), updatedAt: now() },
    { id: 4, title: "Community Engagement Playbook", content: "Guidance on facilitating authentic community engagement in policy and program design.", category: "Equity Analysis", tags: ["community", "engagement", "outreach"], authorId: 1, createdAt: now(), updatedAt: now() },
    { id: 5, title: "Equity Scan vs. Full Analysis Guide", content: "Criteria for determining whether an equity scan or full analysis is appropriate.", category: "Program Operations", tags: ["equity scan", "analysis scope"], authorId: 1, createdAt: now(), updatedAt: now() },
  ];

  private workflowItems: Workflow[] = [
    { id: 1, title: "Equity Consultation Request", description: "Standard intake and triage workflow for staff equity consultation requests.", status: "Active", steps: [{ id: "1", title: "Receive request", description: "Log incoming request", completed: false }, { id: "2", title: "Triage & assign", description: "Determine scope", completed: false }, { id: "3", title: "Consultation session", description: "Conduct session", completed: false }, { id: "4", title: "Follow-up & close", description: "Send resources", completed: false }], ownerId: 1, createdAt: now(), updatedAt: now() },
    { id: 2, title: "Accessibility Review", description: "Review DSD documents and communications for accessibility compliance.", status: "Active", steps: [{ id: "1", title: "Submit document", completed: false }, { id: "2", title: "Initial review", completed: false }, { id: "3", title: "Remediation", completed: false }, { id: "4", title: "Final approval", completed: false }], ownerId: 1, createdAt: now(), updatedAt: now() },
    { id: 3, title: "Quarterly KPI Reporting", description: "Compile and present quarterly equity program metrics to leadership.", status: "In Progress", steps: [{ id: "1", title: "Collect data", completed: true }, { id: "2", title: "Analyze trends", completed: false }, { id: "3", title: "Prepare report", completed: false }, { id: "4", title: "Present to leadership", completed: false }], ownerId: 1, createdAt: now(), updatedAt: now() },
  ];

  private templateItems: Template[] = [
    { id: 1, title: "Equity Scan Template", description: "Standard form for conducting an initial equity scan of a program or policy.", content: "## Equity Scan\n\n**Program/Policy:** \n**Date:** \n**Reviewer:** \n\n### 1. Population Impact\n\n### 2. Disparate Impact Analysis\n\n### 3. Recommendations\n", category: "Equity Analysis", authorId: 1, createdAt: now(), updatedAt: now() },
    { id: 2, title: "Community Engagement Summary", description: "Template for documenting community engagement activities and outcomes.", content: "## Community Engagement Summary\n\n**Event/Activity:** \n**Date:** \n**Participants:** \n\n### Key Themes\n\n### Action Items\n", category: "Engagement", authorId: 1, createdAt: now(), updatedAt: now() },
    { id: 3, title: "Accessibility Remediation Plan", description: "Template for documenting accessibility findings and remediation steps.", content: "## Accessibility Remediation Plan\n\n**Document/Asset:** \n**Review Date:** \n\n### Findings\n\n### Remediation Steps\n\n### Timeline\n", category: "Accessibility", authorId: 1, createdAt: now(), updatedAt: now() },
    { id: 4, title: "Consultation Follow-up Email", description: "Standard follow-up template after an equity consultation session.", content: "Dear [Name],\n\nThank you for attending today's equity consultation. Below is a summary of resources discussed...\n\nNext steps:\n1.\n2.\n\nPlease reach out with any questions.\n\nBest regards,\nOne DSD Equity Program", category: "Communications", authorId: 1, createdAt: now(), updatedAt: now() },
  ];

  private actionItems: Action[] = [
    { id: 1, title: "Update Equity Analysis Toolkit for FY2026", description: "Revise toolkit to reflect updated federal guidance and staff feedback.", status: "In Progress", priority: "High", dueDate: new Date("2026-03-31"), assigneeId: 1, createdAt: now(), updatedAt: now() },
    { id: 2, title: "Deliver Q1 Equity Training", description: "Facilitate equity fundamentals training for new DSD staff cohort.", status: "Pending", priority: "High", dueDate: new Date("2026-03-20"), assigneeId: 1, createdAt: now(), updatedAt: now() },
    { id: 3, title: "Publish CLAS Standards Summary", description: "Create an accessible one-pager summarizing CLAS standards for program staff.", status: "Pending", priority: "Medium", dueDate: new Date("2026-04-15"), assigneeId: 1, createdAt: now(), updatedAt: now() },
    { id: 4, title: "Compile Q1 FY2026 KPI Report", description: "Gather metrics data and prepare quarterly report for leadership.", status: "In Progress", priority: "High", dueDate: new Date("2026-04-01"), assigneeId: 1, createdAt: now(), updatedAt: now() },
    { id: 5, title: "Accessibility audit — program communications", description: "Audit Q1 outgoing communications for accessibility compliance.", status: "Pending", priority: "Medium", dueDate: new Date("2026-04-30"), assigneeId: 1, createdAt: now(), updatedAt: now() },
  ];

  private riskItems: Risk[] = [
    { id: 1, title: "Staff capacity for equity consultations", description: "High volume of consultation requests may exceed current program capacity.", severity: "High", likelihood: "High", status: "Open", mitigationPlan: "Develop tiered consultation model; create self-service resources for lower-complexity requests.", ownerId: 1, createdAt: now(), updatedAt: now() },
    { id: 2, title: "Outdated governing documents", description: "Federal equity guidance updated; internal documents may not reflect current standards.", severity: "Medium", likelihood: "Medium", status: "Monitoring", mitigationPlan: "Schedule quarterly document review cycle; assign document owner accountability.", ownerId: 1, createdAt: now(), updatedAt: now() },
    { id: 3, title: "Language access gaps in materials", description: "Some DSD materials may not be available in required languages per CLAS standards.", severity: "High", likelihood: "Low", status: "Open", mitigationPlan: "Audit materials inventory; prioritize translation of high-use documents.", ownerId: 1, createdAt: now(), updatedAt: now() },
    { id: 4, title: "Community feedback not integrated", description: "Without structured feedback loops, program improvements may not reflect community needs.", severity: "Medium", likelihood: "Medium", status: "Mitigated", mitigationPlan: "Established quarterly community listening sessions; added feedback item to KPI dashboard.", ownerId: 1, createdAt: now(), updatedAt: now() },
  ];

  private metricItems: Metric[] = [
    { id: 1, name: "Equity Consultations Completed", value: "23", target: "20", category: "Program Operations", period: "Q1 FY2026", createdAt: now() },
    { id: 2, name: "Equity Analyses Supported", value: "8", target: "10", category: "Program Operations", period: "Q1 FY2026", createdAt: now() },
    { id: 3, name: "Accessibility Reviews Completed", value: "15", target: "12", category: "Accessibility", period: "Q1 FY2026", createdAt: now() },
    { id: 4, name: "Staff Trained (Equity Fundamentals)", value: "47", target: "50", category: "Workforce Equity", period: "Q1 FY2026", createdAt: now() },
    { id: 5, name: "Community Engagement Events", value: "4", target: "4", category: "Engagement", period: "Q1 FY2026", createdAt: now() },
    { id: 6, name: "Open Action Items", value: "5", target: "0", category: "Program Operations", period: "Q1 FY2026", createdAt: now() },
  ];

  async getUser(id: number) { return this.users.find(u => u.id === id); }
  async getUserByUsername(username: string) { return this.users.find(u => u.username === username); }
  async createUser(user: InsertUser): Promise<User> {
    const created: User = { id: makeId(), createdAt: now(), displayName: null, role: "viewer", ...user };
    this.users.push(created);
    return created;
  }

  async getKnowledgeBaseItems() { return [...this.kbItems]; }
  async getKnowledgeBaseItem(id: number) { return this.kbItems.find(i => i.id === id); }
  async createKnowledgeBaseItem(item: InsertKnowledgeBase): Promise<KnowledgeBase> {
    const created: KnowledgeBase = { id: makeId(), createdAt: now(), updatedAt: now(), authorId: null, tags: [], ...item };
    this.kbItems.push(created);
    return created;
  }
  async updateKnowledgeBaseItem(id: number, item: Partial<InsertKnowledgeBase>) {
    const idx = this.kbItems.findIndex(i => i.id === id);
    if (idx === -1) return undefined;
    this.kbItems[idx] = { ...this.kbItems[idx], ...item, updatedAt: now() };
    return this.kbItems[idx];
  }
  async deleteKnowledgeBaseItem(id: number) {
    const idx = this.kbItems.findIndex(i => i.id === id);
    if (idx === -1) return false;
    this.kbItems.splice(idx, 1); return true;
  }

  async getWorkflows() { return [...this.workflowItems]; }
  async getWorkflow(id: number) { return this.workflowItems.find(w => w.id === id); }
  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    const created: Workflow = { id: makeId(), createdAt: now(), updatedAt: now(), description: null, ownerId: null, steps: [], ...workflow };
    this.workflowItems.push(created);
    return created;
  }
  async updateWorkflow(id: number, workflow: Partial<InsertWorkflow>) {
    const idx = this.workflowItems.findIndex(w => w.id === id);
    if (idx === -1) return undefined;
    this.workflowItems[idx] = { ...this.workflowItems[idx], ...workflow, updatedAt: now() };
    return this.workflowItems[idx];
  }
  async deleteWorkflow(id: number) {
    const idx = this.workflowItems.findIndex(w => w.id === id);
    if (idx === -1) return false;
    this.workflowItems.splice(idx, 1); return true;
  }

  async getTemplates() { return [...this.templateItems]; }
  async getTemplate(id: number) { return this.templateItems.find(t => t.id === id); }
  async createTemplate(template: InsertTemplate): Promise<Template> {
    const created: Template = { id: makeId(), createdAt: now(), updatedAt: now(), description: null, authorId: null, ...template };
    this.templateItems.push(created);
    return created;
  }
  async updateTemplate(id: number, template: Partial<InsertTemplate>) {
    const idx = this.templateItems.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    this.templateItems[idx] = { ...this.templateItems[idx], ...template, updatedAt: now() };
    return this.templateItems[idx];
  }
  async deleteTemplate(id: number) {
    const idx = this.templateItems.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.templateItems.splice(idx, 1); return true;
  }

  async getActions() { return [...this.actionItems]; }
  async getAction(id: number) { return this.actionItems.find(a => a.id === id); }
  async createAction(action: InsertAction): Promise<Action> {
    const created: Action = { id: makeId(), createdAt: now(), updatedAt: now(), description: null, dueDate: null, assigneeId: null, ...action };
    this.actionItems.push(created);
    return created;
  }
  async updateAction(id: number, action: Partial<InsertAction>) {
    const idx = this.actionItems.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    this.actionItems[idx] = { ...this.actionItems[idx], ...action, updatedAt: now() };
    return this.actionItems[idx];
  }
  async deleteAction(id: number) {
    const idx = this.actionItems.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.actionItems.splice(idx, 1); return true;
  }

  async getRisks() { return [...this.riskItems]; }
  async getRisk(id: number) { return this.riskItems.find(r => r.id === id); }
  async createRisk(risk: InsertRisk): Promise<Risk> {
    const created: Risk = { id: makeId(), createdAt: now(), updatedAt: now(), description: null, mitigationPlan: null, ownerId: null, ...risk };
    this.riskItems.push(created);
    return created;
  }
  async updateRisk(id: number, risk: Partial<InsertRisk>) {
    const idx = this.riskItems.findIndex(r => r.id === id);
    if (idx === -1) return undefined;
    this.riskItems[idx] = { ...this.riskItems[idx], ...risk, updatedAt: now() };
    return this.riskItems[idx];
  }
  async deleteRisk(id: number) {
    const idx = this.riskItems.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.riskItems.splice(idx, 1); return true;
  }

  async getMetrics() { return [...this.metricItems]; }
  async createMetric(metric: InsertMetric): Promise<Metric> {
    const created: Metric = { id: makeId(), createdAt: now(), target: null, ...metric };
    this.metricItems.push(created);
    return created;
  }
}

// ─── Database Storage ─────────────────────────────────────────────────────────

export class DatabaseStorage implements IStorage {
  private db: any;
  private s: any;

  constructor(db: any, schema: any) {
    this.db = db;
    this.s = schema;
  }

  async getUser(id: number) { const [u] = await this.db.select().from(this.s.users).where(eq(this.s.users.id, id)); return u; }
  async getUserByUsername(username: string) { const [u] = await this.db.select().from(this.s.users).where(eq(this.s.users.username, username)); return u; }
  async createUser(user: InsertUser) { const [u] = await this.db.insert(this.s.users).values(user).returning(); return u; }

  async getKnowledgeBaseItems() { return this.db.select().from(this.s.knowledgeBase); }
  async getKnowledgeBaseItem(id: number) { const [i] = await this.db.select().from(this.s.knowledgeBase).where(eq(this.s.knowledgeBase.id, id)); return i; }
  async createKnowledgeBaseItem(item: InsertKnowledgeBase) { const [i] = await this.db.insert(this.s.knowledgeBase).values(item).returning(); return i; }
  async updateKnowledgeBaseItem(id: number, item: Partial<InsertKnowledgeBase>) { const [i] = await this.db.update(this.s.knowledgeBase).set(item).where(eq(this.s.knowledgeBase.id, id)).returning(); return i; }
  async deleteKnowledgeBaseItem(id: number) { const r = await this.db.delete(this.s.knowledgeBase).where(eq(this.s.knowledgeBase.id, id)); return (r.rowCount ?? 0) > 0; }

  async getWorkflows() { return this.db.select().from(this.s.workflows); }
  async getWorkflow(id: number) { const [w] = await this.db.select().from(this.s.workflows).where(eq(this.s.workflows.id, id)); return w; }
  async createWorkflow(w: InsertWorkflow) { const [i] = await this.db.insert(this.s.workflows).values(w).returning(); return i; }
  async updateWorkflow(id: number, w: Partial<InsertWorkflow>) { const [i] = await this.db.update(this.s.workflows).set(w).where(eq(this.s.workflows.id, id)).returning(); return i; }
  async deleteWorkflow(id: number) { const r = await this.db.delete(this.s.workflows).where(eq(this.s.workflows.id, id)); return (r.rowCount ?? 0) > 0; }

  async getTemplates() { return this.db.select().from(this.s.templates); }
  async getTemplate(id: number) { const [t] = await this.db.select().from(this.s.templates).where(eq(this.s.templates.id, id)); return t; }
  async createTemplate(t: InsertTemplate) { const [i] = await this.db.insert(this.s.templates).values(t).returning(); return i; }
  async updateTemplate(id: number, t: Partial<InsertTemplate>) { const [i] = await this.db.update(this.s.templates).set(t).where(eq(this.s.templates.id, id)).returning(); return i; }
  async deleteTemplate(id: number) { const r = await this.db.delete(this.s.templates).where(eq(this.s.templates.id, id)); return (r.rowCount ?? 0) > 0; }

  async getActions() { return this.db.select().from(this.s.actions); }
  async getAction(id: number) { const [a] = await this.db.select().from(this.s.actions).where(eq(this.s.actions.id, id)); return a; }
  async createAction(a: InsertAction) { const [i] = await this.db.insert(this.s.actions).values(a).returning(); return i; }
  async updateAction(id: number, a: Partial<InsertAction>) { const [i] = await this.db.update(this.s.actions).set(a).where(eq(this.s.actions.id, id)).returning(); return i; }
  async deleteAction(id: number) { const r = await this.db.delete(this.s.actions).where(eq(this.s.actions.id, id)); return (r.rowCount ?? 0) > 0; }

  async getRisks() { return this.db.select().from(this.s.risks); }
  async getRisk(id: number) { const [r] = await this.db.select().from(this.s.risks).where(eq(this.s.risks.id, id)); return r; }
  async createRisk(r: InsertRisk) { const [i] = await this.db.insert(this.s.risks).values(r).returning(); return i; }
  async updateRisk(id: number, r: Partial<InsertRisk>) { const [i] = await this.db.update(this.s.risks).set(r).where(eq(this.s.risks.id, id)).returning(); return i; }
  async deleteRisk(id: number) { const r2 = await this.db.delete(this.s.risks).where(eq(this.s.risks.id, id)); return (r2.rowCount ?? 0) > 0; }

  async getMetrics() { return this.db.select().from(this.s.metrics); }
  async createMetric(m: InsertMetric) { const [i] = await this.db.insert(this.s.metrics).values(m).returning(); return i; }
}

// ─── Export correct storage based on environment ──────────────────────────────

async function createStorage(): Promise<IStorage> {
  if (process.env.DATABASE_URL) {
    try {
      const { db } = await import("./db.js");
      const schema = await import("../shared/schema.js");
      console.log("[storage] Using PostgreSQL database");
      return new DatabaseStorage(db, schema);
    } catch (e) {
      console.warn("[storage] DB connection failed, falling back to in-memory storage:", e);
    }
  } else {
    console.log("[storage] No DATABASE_URL — using in-memory storage with seed data");
  }
  return new MemoryStorage();
}

export const storage: IStorage = await createStorage();
