/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    testTimeout: 15000,
  },
  resolve: {
    alias: {
      "@backend": path.resolve(__dirname, "src"),
    },
  },
});

