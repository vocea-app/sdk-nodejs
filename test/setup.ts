import { afterEach, beforeEach, vi } from "vitest";

/**
 * Ningún test unitario debe salir a la red. Sustituir `fetch` por uno que
 * lanza convierte un olvido en un fallo ruidoso en vez de en un test lento y
 * dependiente de que la API esté arriba.
 */
function fetchProhibido(): never {
  throw new Error(
    "Un test unitario ha intentado usar fetch. Usa mockFetch() de test/helpers.ts.",
  );
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchProhibido);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
