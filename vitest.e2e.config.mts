import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  test: {
    env: loadEnv(mode, process.cwd(), ""),
    include: ["e2e/**/*.e2e.test.ts"],
    // La API real puede tardar; el default de 5s se queda corto.
    testTimeout: 30_000,
    // Peticiones reales contra una cuenta compartida: sin paralelismo.
    fileParallelism: false,
  },
}));
