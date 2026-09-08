import { describe, expect, it } from "vitest";
import { createClient, mockFetch } from "../helpers.js";

describe("AudiosResource", () => {
  it("generate manda el cuerpo completo a /audios/generate", async () => {
    const { calls } = mockFetch({ json: { id: "a1" } });
    await createClient().audios.generate({
      voice_id: "v1",
      tts_model_id: "m1",
      text: "Hola",
      language_code: "es",
      speed: 1.2,
      advanced_params: { emotion: "happy" },
    });
    expect(calls[0].method).toBe("POST");
    expect(calls[0].url).toBe("https://api.test/v1/audios/generate");
    expect(JSON.parse(calls[0].body as string)).toEqual({
      voice_id: "v1",
      tts_model_id: "m1",
      text: "Hola",
      language_code: "es",
      speed: 1.2,
      advanced_params: { emotion: "happy" },
    });
  });

  it("generate admite provider_voice_id en lugar de voice_id", async () => {
    const { calls } = mockFetch({ json: { id: "a1" } });
    await createClient().audios.generate({
      provider_voice_id: "pv1",
      text: "Hola",
      language_code: "es",
    });
    expect(JSON.parse(calls[0].body as string)).toEqual({
      provider_voice_id: "pv1",
      text: "Hola",
      language_code: "es",
    });
  });

  it("list pasa la paginación como query", async () => {
    const { calls } = mockFetch({ json: { items: [], total: 0, page: 1, limit: 20 } });
    await createClient().audios.list({ page: 2 });
    expect(calls[0].url).toBe("https://api.test/v1/audios?page=2");
  });

  it("get interpola el id", async () => {
    const { calls } = mockFetch({ json: { id: "a1" } });
    await createClient().audios.get("a1");
    expect(calls[0].url).toBe("https://api.test/v1/audios/a1");
  });

  it("download devuelve la Response sin parsear", async () => {
    mockFetch({ text: "bytes-mp3" });
    const res = await createClient().audios.download("a1");
    await expect(res.text()).resolves.toBe("bytes-mp3");
  });

  it("delete hace DELETE y no devuelve cuerpo", async () => {
    const { calls } = mockFetch({ status: 204 });
    await expect(createClient().audios.delete("a1")).resolves.toBeUndefined();
    expect(calls[0].method).toBe("DELETE");
    expect(calls[0].url).toBe("https://api.test/v1/audios/a1");
  });

  it("playUrl compone la URL pública sin hacer petición", () => {
    const { calls } = mockFetch({ json: {} });
    const url = createClient().audios.playUrl("a1");
    expect(url).toBe("https://api.test/v1/audios/a1/play.mp3");
    expect(calls).toHaveLength(0);
  });
});
