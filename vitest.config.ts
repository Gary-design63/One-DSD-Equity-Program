import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["public/**/*.{test,spec}.{js,ts}"],
    passWithNoTests: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./public") },
  },
});
