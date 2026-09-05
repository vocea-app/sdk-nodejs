import { vi } from "vitest";
import { VoceaClient } from "../src/client.js";

export interface FetchCall {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
}

export interface MockRespuesta {
  status?: number;
  statusText?: string;
  /** Cuerpo JSON. Ignorado si se pasa `text`. */
  json?: unknown;
  /** Cuerpo crudo, para simular respuestas que no son JSON. */
  text?: string;
  headers?: Record<string, string>;
}

/**
 * Sustituye `fetch` global y registra cada llamada. Devuelve el array de
 * llamadas para poder afirmar sobre URL, método, cabeceras y cuerpo exactos.
 */
export function mockFetch(respuesta: MockRespuesta = {}): { calls: FetchCall[] } {
  const calls: FetchCall[] = [];
  const status = respuesta.status ?? 200;

  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL, init?: RequestInit) => {
      calls.push({
        url: String(input),
        method: init?.method ?? "GET",
        headers: (init?.headers ?? {}) as Record<string, string>,
        body: init?.body,
      });

      const cuerpo =
        respuesta.text ?? JSON.stringify(respuesta.json ?? {});

      return new Response(status === 204 ? null : cuerpo, {
        status,
        statusText: respuesta.statusText ?? "",
        headers: respuesta.headers ?? { "Content-Type": "application/json" },
      });
    }),
  );

  return { calls };
}

export function createClient(baseUrl = "https://api.test/v1"): VoceaClient {
  return new VoceaClient({ apiKey: "vca_test", baseUrl });
}
