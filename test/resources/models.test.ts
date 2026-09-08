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

  it("list conserva providerId y maxCharacters del listado", async () => {
    mockFetch({
      json: [{
        id: "m1", name: "Studio", description: null, providerId: "p1", maxCharacters: 2000,
        isActive: true, sortOrder: 1, createdAt: "2026-01-01",
      }],
    });
    const [modelo] = await createClient().models.list();
    expect(modelo.providerId).toBe("p1");
    expect(modelo.maxCharacters).toBe(2000);
  });

  it("get interpola el id en la ruta y devuelve el detalle recortado", async () => {
    // Respuesta real del detalle: el backend lo sirve con un select reducido,
    // sin providerId ni maxCharacters. El tipo TtsModel ya no promete ninguno.
    const { calls } = mockFetch({
      json: {
        id: "m1", name: "Studio", description: null,
        isActive: true, sortOrder: 1, createdAt: "2026-01-01",
      },
    });
    const modelo = await createClient().models.get("m1");
    expect(calls[0].url).toBe("https://api.test/v1/tts-models/m1");
    expect(Object.keys(modelo)).not.toContain("providerId");
    expect(Object.keys(modelo)).not.toContain("maxCharacters");
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
