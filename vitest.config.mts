import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    // The first run downloads a MongoDB binary for the in-memory server.
    hookTimeout: 120_000,
    // Test files share one in-memory database, so run them one at a time.
    fileParallelism: false,
  },
});
