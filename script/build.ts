import { build } from "vite";
import { build as esbuild } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

console.log("Building client…");
await build({
  root: path.resolve(root, "client"),
  base: "/",
  plugins: [(await import("@vitejs/plugin-react")).default()],
  resolve: {
    alias: {
      "@": path.resolve(root, "client/src"),
      "@shared": path.resolve(root, "shared"),
    },
  },
  build: {
    outDir: path.resolve(root, "dist/public"),
    emptyOutDir: true,
  },
});

console.log("Building server…");
await esbuild({
  entryPoints: [path.resolve(root, "server/index.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: path.resolve(root, "dist/index.js"),
  packages: "external",
});

console.log("Build complete.");
