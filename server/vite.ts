import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Development: serve the existing vanilla JS static app from /public
export function serveDevStatic(app: Express) {
  const publicPath = path.resolve(__dirname, "../public");
  const htmlPath = path.resolve(__dirname, "../index.html");

  app.use(express.static(publicPath));
  app.use((_req, res) => {
    res.sendFile(htmlPath);
  });
}

// Production: serve from dist/public (copied during build)
export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "../dist/public");

  if (!fs.existsSync(distPath)) {
    throw new Error(`Build directory not found: ${distPath}. Run \`npm run build\` first.`);
  }

  app.use(express.static(distPath));
  app.use((_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

export { log };
