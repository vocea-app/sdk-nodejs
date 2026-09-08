import { describe, expect, it } from "vitest";
import { VoceaError } from "../src/error.js";
import { HttpClient } from "../src/http.js";
import { mockFetch } from "./helpers.js";

function client(baseUrl = "https://api.test/v1"): HttpClient {
  return new HttpClient({ apiKey: "vca_test", baseUrl });
}

describe("HttpClient", () => {
  it("compone la URL a partir de baseUrl y path", async () => {
    const { calls } = mockFetch({ json: { ok: true } });
    await client().request("GET", "/voices");
    expect(calls[0].url).toBe("https://api.test/v1/voices");
  });

  it("quita la barra final de baseUrl para no duplicarla", async () => {
    const { calls } = mockFetch({ json: {} });
    await client("https://api.test/v1/").request("GET", "/voices");
    expect(calls[0].url).toBe("https://api.test/v1/voices");
  });

  it("manda la API key como Bearer", async () => {
    const { calls } = mockFetch({ json: {} });
    await client().request("GET", "/users/me");
    expect(calls[0].headers.Authorization).toBe("Bearer vca_test");
  });

  it("omite los parámetros de query con valor undefined", async () => {
    const { calls } = mockFetch({ json: {} });
    await client().request("GET", "/voices", {
      query: { page: 2, limit: undefined },
    });
    expect(calls[0].url).toBe("https://api.test/v1/voices?page=2");
  });

  it("serializa el cuerpo JSON y declara el Content-Type", async () => {
    const { calls } = mockFetch({ json: {} });
    await client().request("POST", "/audios/generate", {
      json: { text: "hola" },
    });
    expect(calls[0].headers["Content-Type"]).toBe("application/json");
    expect(calls[0].body).toBe('{"text":"hola"}');
  });

  it("no pone Content-Type a mano cuando el cuerpo es FormData", async () => {
    const { calls } = mockFetch({ json: {} });
    const form = new FormData();
    form.append("name", "voz");
    await client().request("POST", "/voices/clone", { form });
    // Ponerlo a mano rompería el boundary que calcula fetch.
    expect(calls[0].headers["Content-Type"]).toBeUndefined();
    expect(calls[0].body).toBe(form);
  });

  it("devuelve undefined en un 204 sin intentar parsear JSON", async () => {
    mockFetch({ status: 204 });
    await expect(client().request("DELETE", "/voices/x")).resolves.toBeUndefined();
  });

  it("devuelve undefined cuando content-length es 0", async () => {
    mockFetch({ status: 200, text: "", headers: { "content-length": "0" } });
    await expect(client().request("POST", "/auth/logout")).resolves.toBeUndefined();
  });

  it("lanza VoceaError con el cuerpo de error de la API", async () => {
    mockFetch({
      status: 402,
      json: { statusCode: 402, errorCode: "INSUFFICIENT_BALANCE" },
    });
    await expect(client().request("POST", "/audios/generate")).rejects.toThrow(
      VoceaError,
    );
  });

  it("cae a statusText cuando el cuerpo de error no es JSON", async () => {
    mockFetch({
      status: 500,
      statusText: "Internal Server Error",
      text: "<html>nope</html>",
      headers: { "Content-Type": "text/html" },
    });
    await expect(client().request("GET", "/users/me")).rejects.toThrow(
      "Vocea API error 500: Internal Server Error",
    );
  });

  it("stream() devuelve la Response cruda sin parsear", async () => {
    mockFetch({ status: 200, text: "audio-binario" });
    const res = await client().stream("GET", "/audios/x/download");
    expect(res).toBeInstanceOf(Response);
    await expect(res.text()).resolves.toBe("audio-binario");
  });

  it("stream() lanza VoceaError cuando la respuesta no es ok", async () => {
    mockFetch({ status: 404, json: { statusCode: 404, errorCode: "AUDIO_NOT_FOUND" } });
    await expect(client().stream("GET", "/audios/x/download")).rejects.toThrow(
      "Vocea API error 404: AUDIO_NOT_FOUND",
    );
  });
});
