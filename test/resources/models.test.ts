import { describe, expect, it } from "vitest";
import { createClient, mockFetch } from "../helpers.js";

describe("ModelsResource", () => {
  it("list devuelve los modelos activos", async () => {
    const { calls } = mockFetch({
      json: [{
        id: "m1", name: "Studio", description: null, providerId: "p1", maxCharacters: 2000,
        isActive: true, sortOrder: 1, createdAt: "2026-01-01",
      }],
    });
    const modelos = await createClient().models.list();
    expect(calls[0].url).toBe("https://api.test/v1/tts-models");
    expect(modelos[0].id).toBe("m1");
  });

  it("get interpola el id en la ruta", async () => {
    const { calls } = mockFetch({ json: { id: "m1" } });
    await createClient().models.get("m1");
    expect(calls[0].url).toBe("https://api.test/v1/tts-models/m1");
  });

  it("languages y liteLanguages usan rutas distintas", async () => {
    const { calls } = mockFetch({ json: [] });
    const models = createClient().models;
    await models.languages();
    await models.liteLanguages();
    expect(calls[0].url).toBe("https://api.test/v1/tts-models/languages");
    expect(calls[1].url).toBe("https://api.test/v1/tts-models/languages/lite");
  });

  it("config lee el endpoint de configuración", async () => {
    const { calls } = mockFetch({ json: { full: true, lite: false } });
    const cfg = await createClient().models.config();
    expect(calls[0].url).toBe("https://api.test/v1/tts-models/config");
    expect(cfg.full).toBe(true);
  });
});
