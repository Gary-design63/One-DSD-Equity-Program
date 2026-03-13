import express from "express";
import session from "express-session";
import { createServer } from "http";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
const MemStore = MemoryStore(session);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "one-dsd-equity-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    store: new MemStore({ checkPeriod: 86400000 }),
  })
);

// Request logger middleware
app.use((req, _res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJson: unknown;

  const originalJson = _res.json.bind(_res);
  _res.json = function (body) {
    capturedJson = body;
    return originalJson(body);
  };

  _res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${_res.statusCode} in ${duration}ms`;
      if (capturedJson) {
        logLine += ` :: ${JSON.stringify(capturedJson).slice(0, 80)}`;
      }
      if (logLine.length > 120) logLine = logLine.slice(0, 119) + "…";
      log(logLine);
    }
  });

  next();
});

registerRoutes(app);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = (err as { status?: number }).status ?? 500;
  const message = err.message ?? "Internal Server Error";
  res.status(status).json({ message });
  if (status >= 500) console.error(err);
});

const server = createServer(app);
const PORT = Number(process.env.PORT ?? 5000);

(async () => {
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  server.listen(PORT, "0.0.0.0", () => {
    log(`Server running on port ${PORT}`);
  });
})();
