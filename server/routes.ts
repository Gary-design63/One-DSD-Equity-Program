import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInitiativeSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initiatives
  app.get("/api/initiatives", async (_req, res) => {
    const data = await storage.getInitiatives();
    res.json(data);
  });

  app.post("/api/initiatives", async (req, res) => {
    const parsed = insertInitiativeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const initiative = await storage.createInitiative(parsed.data);
    res.status(201).json(initiative);
  });

  // KPIs
  app.get("/api/kpis", async (_req, res) => {
    const data = await storage.getKpis();
    res.json(data);
  });

  // Policies
  app.get("/api/policies", async (_req, res) => {
    const data = await storage.getPolicies();
    res.json(data);
  });

  // Equity Memories
  app.get("/api/equity-memories", async (_req, res) => {
    const data = await storage.getEquityMemories();
    res.json(data);
  });

  // Knowledge Docs
  app.get("/api/knowledge-docs", async (_req, res) => {
    const data = await storage.getKnowledgeDocs();
    res.json(data);
  });

  // Users
  app.get("/api/users", async (_req, res) => {
    const data = await storage.getUsers();
    res.json(data);
  });

  return httpServer;
}
