import express from "express";
import session from "express-session";
import { createServer } from "http";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { serveDevStatic, serveStatic, log } from "./vite";

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
      maxAge: 24 * 60 * 60 * 1000,
    },
    store: new MemStore({ checkPeriod: 86400000 }),
  })
);

// Request logger
app.use((req, _res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJson: unknown;

  const originalJson = _res.json.bind(_res);
  _res.json = function (body) {
    capturedJson = body;
    return originalJson(body);
  };

  _res.on("finish", () => {
    if (reqPath.startsWith("/api")) {
      const duration = Date.now() - start;
      let line = `${req.method} ${reqPath} ${_res.statusCode} in ${duration}ms`;
      if (capturedJson) line += ` :: ${JSON.stringify(capturedJson).slice(0, 80)}`;
      if (line.length > 120) line = line.slice(0, 119) + "…";
      log(line);
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

if (process.env.NODE_ENV === "development") {
  serveDevStatic(app);
} else {
  serveStatic(app);
}

server.listen(PORT, "0.0.0.0", () => {
  log(`Server running on port ${PORT} (${process.env.NODE_ENV ?? "production"})`);
});
