import { build as esbuild } from "esbuild";
import { cpSync, mkdirSync, copyFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distPublic = path.resolve(root, "dist/public");

// 1. Copy static frontend assets to dist/public/
console.log("Copying static assets to dist/public…");
mkdirSync(distPublic, { recursive: true });

// Copy everything from public/ into dist/public/
cpSync(path.resolve(root, "public"), distPublic, { recursive: true });

// Copy root index.html (it references the public/ assets)
copyFileSync(path.resolve(root, "index.html"), path.resolve(distPublic, "index.html"));

// 2. Bundle the Express server
console.log("Bundling server…");
await esbuild({
  entryPoints: [path.resolve(root, "server/index.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: path.resolve(root, "dist/index.js"),
  packages: "external",
});

console.log("Build complete. Run: NODE_ENV=production node dist/index.js");
