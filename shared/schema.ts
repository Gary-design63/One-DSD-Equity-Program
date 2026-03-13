import { pgTable, text, varchar, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const initiatives = pgTable("initiatives", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  domain: text("domain").notNull(),
  priority: text("priority").notNull(),
  status: text("status").notNull().default("Submitted"),
  requestedBy: text("requested_by").notNull(),
  division: text("division").notNull(),
  targetDate: text("target_date").notNull(),
  assignedTo: text("assigned_to"),
  createdAt: text("created_at").notNull(),
});

export const insertInitiativeSchema = createInsertSchema(initiatives).omit({ id: true, createdAt: true });
export type InsertInitiative = z.infer<typeof insertInitiativeSchema>;
export type Initiative = typeof initiatives.$inferSelect;

export const kpis = pgTable("kpis", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  currentValue: real("current_value").notNull(),
  targetValue: real("target_value").notNull(),
  unit: text("unit").notNull(),
  trend: text("trend").notNull(),
  category: text("category").notNull(),
});

export const insertKpiSchema = createInsertSchema(kpis).omit({ id: true });
export type InsertKpi = z.infer<typeof insertKpiSchema>;
export type Kpi = typeof kpis.$inferSelect;

export const policies = pgTable("policies", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull(),
  reviewer: text("reviewer").notNull(),
  lastUpdated: text("last_updated").notNull(),
  equityScore: real("equity_score").notNull(),
});

export const insertPolicySchema = createInsertSchema(policies).omit({ id: true });
export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type Policy = typeof policies.$inferSelect;

export const equityMemories = pgTable("equity_memories", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  category: text("category").notNull(),
  summary: text("summary").notNull(),
});

export const insertEquityMemorySchema = createInsertSchema(equityMemories).omit({ id: true });
export type InsertEquityMemory = z.infer<typeof insertEquityMemorySchema>;
export type EquityMemory = typeof equityMemories.$inferSelect;

export const knowledgeDocs = pgTable("knowledge_docs", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  fileType: text("file_type").notNull(),
  dateAdded: text("date_added").notNull(),
  category: text("category").notNull(),
});

export const insertKnowledgeDocSchema = createInsertSchema(knowledgeDocs).omit({ id: true });
export type InsertKnowledgeDoc = z.infer<typeof insertKnowledgeDocSchema>;
export type KnowledgeDoc = typeof knowledgeDocs.$inferSelect;

export const users = pgTable("users", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  status: text("status").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
