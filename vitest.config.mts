import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  test: {
    // El tercer argumento es el prefijo: '' significa "todas las variables".
    env: loadEnv(mode, process.cwd(), ""),
    include: ["test/**/*.test.ts"],
    setupFiles: ["test/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      reporter: ["text", "html"],
      thresholds: {
        lines: 95,
        branches: 95,
        functions: 95,
        statements: 95,
      },
    },
  },
}));
