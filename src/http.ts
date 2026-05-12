import { VoceaError } from "./error.js";
import type { VoceaErrorBody } from "./types.js";

export interface HttpClientOptions {
  baseUrl: string;
  apiKey: string;
}

export class HttpClient {
  readonly baseUrl: string;
  private apiKey: string;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
  }

  private authHeader(): Record<string, string> {
    return { Authorization: `Bearer ${this.apiKey}` };
  }

  async request<T>(
    method: string,
    path: string,
    options: { json?: unknown; form?: FormData; query?: Record<string, string | number | undefined> } = {},
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (options.query) {
      for (const [k, v] of Object.entries(options.query)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }

    const headers: Record<string, string> = { ...this.authHeader() };
    let body: BodyInit | undefined;

    if (options.json !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(options.json);
    } else if (options.form) {
      body = options.form;
    }

    const res = await fetch(url.toString(), { method, headers, body });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({
        statusCode: res.status,
        message: res.statusText,
      }))) as VoceaErrorBody;
      throw new VoceaError(res.status, err);
    }

    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return undefined as T;
    }
    return res.json() as Promise<T>;
  }

  async stream(method: string, path: string): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, { method, headers: this.authHeader() });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({ statusCode: res.status, message: res.statusText }))) as VoceaErrorBody;
      throw new VoceaError(res.status, err);
    }
    return res;
  }
}
