import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  users, knowledgeBase, workflows, templates, actions, risks, metrics,
  type User, type InsertUser,
  type KnowledgeBase, type InsertKnowledgeBase,
  type Workflow, type InsertWorkflow,
  type Template, type InsertTemplate,
  type Action, type InsertAction,
  type Risk, type InsertRisk,
  type Metric, type InsertMetric,
} from "../shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Knowledge Base
  getKnowledgeBaseItems(): Promise<KnowledgeBase[]>;
  getKnowledgeBaseItem(id: number): Promise<KnowledgeBase | undefined>;
  createKnowledgeBaseItem(item: InsertKnowledgeBase): Promise<KnowledgeBase>;
  updateKnowledgeBaseItem(id: number, item: Partial<InsertKnowledgeBase>): Promise<KnowledgeBase | undefined>;
  deleteKnowledgeBaseItem(id: number): Promise<boolean>;

  // Workflows
  getWorkflows(): Promise<Workflow[]>;
  getWorkflow(id: number): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, workflow: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;

  // Templates
  getTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: number): Promise<boolean>;

  // Actions
  getActions(): Promise<Action[]>;
  getAction(id: number): Promise<Action | undefined>;
  createAction(action: InsertAction): Promise<Action>;
  updateAction(id: number, action: Partial<InsertAction>): Promise<Action | undefined>;
  deleteAction(id: number): Promise<boolean>;

  // Risks
  getRisks(): Promise<Risk[]>;
  getRisk(id: number): Promise<Risk | undefined>;
  createRisk(risk: InsertRisk): Promise<Risk>;
  updateRisk(id: number, risk: Partial<InsertRisk>): Promise<Risk | undefined>;
  deleteRisk(id: number): Promise<boolean>;

  // Metrics
  getMetrics(): Promise<Metric[]>;
  createMetric(metric: InsertMetric): Promise<Metric>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser) {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  // Knowledge Base
  async getKnowledgeBaseItems() {
    return db.select().from(knowledgeBase);
  }

  async getKnowledgeBaseItem(id: number) {
    const [item] = await db.select().from(knowledgeBase).where(eq(knowledgeBase.id, id));
    return item;
  }

  async createKnowledgeBaseItem(item: InsertKnowledgeBase) {
    const [created] = await db.insert(knowledgeBase).values(item).returning();
    return created;
  }

  async updateKnowledgeBaseItem(id: number, item: Partial<InsertKnowledgeBase>) {
    const [updated] = await db.update(knowledgeBase).set(item).where(eq(knowledgeBase.id, id)).returning();
    return updated;
  }

  async deleteKnowledgeBaseItem(id: number) {
    const result = await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Workflows
  async getWorkflows() {
    return db.select().from(workflows);
  }

  async getWorkflow(id: number) {
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id));
    return workflow;
  }

  async createWorkflow(workflow: InsertWorkflow) {
    const [created] = await db.insert(workflows).values(workflow).returning();
    return created;
  }

  async updateWorkflow(id: number, workflow: Partial<InsertWorkflow>) {
    const [updated] = await db.update(workflows).set(workflow).where(eq(workflows.id, id)).returning();
    return updated;
  }

  async deleteWorkflow(id: number) {
    const result = await db.delete(workflows).where(eq(workflows.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Templates
  async getTemplates() {
    return db.select().from(templates);
  }

  async getTemplate(id: number) {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }

  async createTemplate(template: InsertTemplate) {
    const [created] = await db.insert(templates).values(template).returning();
    return created;
  }

  async updateTemplate(id: number, template: Partial<InsertTemplate>) {
    const [updated] = await db.update(templates).set(template).where(eq(templates.id, id)).returning();
    return updated;
  }

  async deleteTemplate(id: number) {
    const result = await db.delete(templates).where(eq(templates.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Actions
  async getActions() {
    return db.select().from(actions);
  }

  async getAction(id: number) {
    const [action] = await db.select().from(actions).where(eq(actions.id, id));
    return action;
  }

  async createAction(action: InsertAction) {
    const [created] = await db.insert(actions).values(action).returning();
    return created;
  }

  async updateAction(id: number, action: Partial<InsertAction>) {
    const [updated] = await db.update(actions).set(action).where(eq(actions.id, id)).returning();
    return updated;
  }

  async deleteAction(id: number) {
    const result = await db.delete(actions).where(eq(actions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Risks
  async getRisks() {
    return db.select().from(risks);
  }

  async getRisk(id: number) {
    const [risk] = await db.select().from(risks).where(eq(risks.id, id));
    return risk;
  }

  async createRisk(risk: InsertRisk) {
    const [created] = await db.insert(risks).values(risk).returning();
    return created;
  }

  async updateRisk(id: number, risk: Partial<InsertRisk>) {
    const [updated] = await db.update(risks).set(risk).where(eq(risks.id, id)).returning();
    return updated;
  }

  async deleteRisk(id: number) {
    const result = await db.delete(risks).where(eq(risks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Metrics
  async getMetrics() {
    return db.select().from(metrics);
  }

  async createMetric(metric: InsertMetric) {
    const [created] = await db.insert(metrics).values(metric).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
