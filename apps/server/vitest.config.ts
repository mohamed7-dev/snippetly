import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    hookTimeout: 30000, // containers need more time
    env: {
      DATABASE_URL: "dummy", // will be overridden in setup
      UPLOADTHING_TOKEN: "dummy",
    },
  },
});
