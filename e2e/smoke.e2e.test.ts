import { beforeAll, describe, expect, it } from "vitest";
import { VoceaClient } from "../src/index.js";

const apiKey = process.env.VOCEA_API_KEY;

// Sin credencial la suite se salta, no falla: el CI no define VOCEA_API_KEY.
describe.skipIf(!apiKey)("e2e contra la API real", () => {
  let vocea: VoceaClient;

  beforeAll(() => {
    vocea = new VoceaClient({
      apiKey: apiKey as string,
      // Cadena vacía en el .env debe comportarse como "no definida".
      baseUrl: process.env.VOCEA_BASE_URL || undefined,
    });
  });

  it("models.list() devuelve modelos con la forma que declaran los tipos", async () => {
    const modelos = await vocea.models.list();
    expect(Array.isArray(modelos)).toBe(true);
    expect(modelos.length).toBeGreaterThan(0);
    const modelo = modelos[0];
    expect(typeof modelo.id).toBe("string");
    expect(typeof modelo.name).toBe("string");
    expect(typeof modelo.isActive).toBe("boolean");
  });

  it("users.balance() devuelve creditsBalance numérico", async () => {
    const saldo = await vocea.users.balance();
    expect(typeof saldo.creditsBalance).toBe("number");
  });

  it("voices.list() devuelve una página con la forma declarada", async () => {
    const pagina = await vocea.voices.list({ page: 1, limit: 5 });
    expect(Array.isArray(pagina.items)).toBe(true);
    expect(typeof pagina.total).toBe("number");
    expect(pagina.page).toBe(1);
  });

  it("una key inválida produce VoceaError 401", async () => {
    const malo = new VoceaClient({
      apiKey: "vca_key_invalida",
      baseUrl: process.env.VOCEA_BASE_URL || undefined,
    });
    await expect(malo.users.balance()).rejects.toThrow(/401/);
  });

  // Este es el test que habría detectado la deriva que corrigió la Task 6:
  // los tipos decían una cosa y la API devolvía otra.
  it("la API no ha añadido campos que los tipos desconozcan", async () => {
    const declaradosEnVoice = [
      "id", "name", "status", "failureReason", "cloneAudioDuration",
      "languageCode", "countryId", "regionId", "ageRange", "gender",
      "country", "region", "isPublicRequest", "isPublic", "timesUsed",
      "creditsEarnedTotal", "publicRejectReason", "hasSamplePreview",
      "isFavorited", "favoritesCount", "providers", "lastUsedAt",
      "createdAt", "updatedAt", "deletedAt", "langSet",
    ];

    const pagina = await vocea.voices.list({ page: 1, limit: 1 });
    if (pagina.items.length === 0) return; // cuenta sin voces: nada que comparar

    const desconocidos = Object.keys(pagina.items[0]).filter(
      (clave) => !declaradosEnVoice.includes(clave),
    );
    expect(desconocidos, "campos nuevos en la API que Voice no declara").toEqual([]);
  });

  it("creditsEarnedTotal sigue llegando como string decimal", async () => {
    const pagina = await vocea.voices.list({ page: 1, limit: 1 });
    if (pagina.items.length === 0) return;
    // Si esto pasa a "number", el backend ha cambiado y el tipo debe seguirlo.
    expect(typeof pagina.items[0].creditsEarnedTotal).toBe("string");
  });

  it("los modelos exponen maxCharacters y providerId", async () => {
    const modelos = await vocea.models.list();
    expect(typeof modelos[0].maxCharacters).toBe("number");
    expect(typeof modelos[0].providerId).toBe("string");
  });
});
