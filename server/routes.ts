import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import passport from "passport";
import { insertUserSchema, insertKnowledgeBaseSchema, insertWorkflowSchema, insertTemplateSchema, insertActionSchema, insertRiskSchema, insertMetricSchema } from "../shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = req.user as { role: string };
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

export function registerRoutes(app: Express) {
  setupAuth(app);

  // ─── Auth Routes ────────────────────────────────────────────────────────────

  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByUsername(data.username);
      if (existing) {
        return res.status(400).json({ message: "Username already taken" });
      }
      const user = await storage.createUser({
        ...data,
        password: await hashPassword(data.password),
      });
      const { password: _, ...safeUser } = user;
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(safeUser);
      });
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(err).message });
      }
      next(err);
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message ?? "Invalid credentials" });
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        const { password: _, ...safeUser } = user as { password: string; [key: string]: unknown };
        res.json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    const { password: _, ...safeUser } = req.user as { password: string; [key: string]: unknown };
    res.json(safeUser);
  });

  // ─── Knowledge Base Routes ───────────────────────────────────────────────────

  app.get("/api/knowledge-base", requireAuth, async (req, res, next) => {
    try {
      const items = await storage.getKnowledgeBaseItems();
      res.json(items);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/knowledge-base/:id", requireAuth, async (req, res, next) => {
    try {
      const item = await storage.getKnowledgeBaseItem(Number(req.params.id));
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/knowledge-base", requireAuth, async (req, res, next) => {
    try {
      const data = insertKnowledgeBaseSchema.parse(req.body);
      const item = await storage.createKnowledgeBaseItem(data);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof ZodError) return res.status(400).json({ message: fromZodError(err).message });
      next(err);
    }
  });

  app.patch("/api/knowledge-base/:id", requireAuth, async (req, res, next) => {
    try {
      const item = await storage.updateKnowledgeBaseItem(Number(req.params.id), req.body);
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/knowledge-base/:id", requireRole(["admin", "editor"]), async (req, res, next) => {
    try {
      const deleted = await storage.deleteKnowledgeBaseItem(Number(req.params.id));
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (err) {
      next(err);
    }
  });

  // ─── Workflows Routes ────────────────────────────────────────────────────────

  app.get("/api/workflows", requireAuth, async (req, res, next) => {
    try {
      res.json(await storage.getWorkflows());
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/workflows/:id", requireAuth, async (req, res, next) => {
    try {
      const item = await storage.getWorkflow(Number(req.params.id));
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/workflows", requireAuth, async (req, res, next) => {
    try {
      const data = insertWorkflowSchema.parse(req.body);
      res.status(201).json(await storage.createWorkflow(data));
    } catch (err) {
      if (err instanceof ZodError) return res.status(400).json({ message: fromZodError(err).message });
      next(err);
    }
  });

  app.patch("/api/workflows/:id", requireAuth, async (req, res, next) => {
    try {
      const item = await storage.updateWorkflow(Number(req.params.id), req.body);
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/workflows/:id", requireRole(["admin", "editor"]), async (req, res, next) => {
    try {
      const deleted = await storage.deleteWorkflow(Number(req.params.id));
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (err) {
      next(err);
    }
  });

  // ─── Templates Routes ────────────────────────────────────────────────────────

  app.get("/api/templates", requireAuth, async (req, res, next) => {
    try {
      res.json(await storage.getTemplates());
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/templates/:id", requireAuth, async (req, res, next) => {
    try {
      const item = await storage.getTemplate(Number(req.params.id));
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/templates", requireAuth, async (req, res, next) => {
    try {
      const data = insertTemplateSchema.parse(req.body);
      res.status(201).json(await storage.createTemplate(data));
    } catch (err) {
      if (err instanceof ZodError) return res.status(400).json({ message: fromZodError(err).message });
      next(err);
    }
  });

  app.patch("/api/templates/:id", requireAuth, async (req, res, next) => {
    try {
      const item = await storage.updateTemplate(Number(req.params.id), req.body);
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/templates/:id", requireRole(["admin", "editor"]), async (req, res, next) => {
    try {
      const deleted = await storage.deleteTemplate(Number(req.params.id));
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (err) {
      next(err);
    }
  });

  // ─── Actions Routes ──────────────────────────────────────────────────────────

  app.get("/api/actions", requireAuth, async (req, res, next) => {
    try {
      res.json(await storage.getActions());
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/actions/:id", requireAuth, async (req, res, next) => {
    try {
      const item = await storage.getAction(Number(req.params.id));
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/actions", requireAuth, async (req, res, next) => {
    try {
      const data = insertActionSchema.parse(req.body);
      res.status(201).json(await storage.createAction(data));
    } catch (err) {
      if (err instanceof ZodError) return res.status(400).json({ message: fromZodError(err).message });
      next(err);
    }
  });

  app.patch("/api/actions/:id", requireAuth, async (req, res, next) => {
    try {
      const item = await storage.updateAction(Number(req.params.id), req.body);
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/actions/:id", requireRole(["admin", "editor"]), async (req, res, next) => {
    try {
      const deleted = await storage.deleteAction(Number(req.params.id));
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (err) {
      next(err);
    }
  });

  // ─── Risks Routes ────────────────────────────────────────────────────────────

  app.get("/api/risks", requireAuth, async (req, res, next) => {
    try {
      res.json(await storage.getRisks());
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/risks/:id", requireAuth, async (req, res, next) => {
    try {
      const item = await storage.getRisk(Number(req.params.id));
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/risks", requireAuth, async (req, res, next) => {
    try {
      const data = insertRiskSchema.parse(req.body);
      res.status(201).json(await storage.createRisk(data));
    } catch (err) {
      if (err instanceof ZodError) return res.status(400).json({ message: fromZodError(err).message });
      next(err);
    }
  });

  app.patch("/api/risks/:id", requireAuth, async (req, res, next) => {
    try {
      const item = await storage.updateRisk(Number(req.params.id), req.body);
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/risks/:id", requireRole(["admin", "editor"]), async (req, res, next) => {
    try {
      const deleted = await storage.deleteRisk(Number(req.params.id));
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (err) {
      next(err);
    }
  });

  // ─── Metrics Routes ──────────────────────────────────────────────────────────

  app.get("/api/metrics", requireAuth, async (req, res, next) => {
    try {
      res.json(await storage.getMetrics());
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/metrics", requireRole(["admin"]), async (req, res, next) => {
    try {
      const data = insertMetricSchema.parse(req.body);
      res.status(201).json(await storage.createMetric(data));
    } catch (err) {
      if (err instanceof ZodError) return res.status(400).json({ message: fromZodError(err).message });
      next(err);
    }
  });
}
