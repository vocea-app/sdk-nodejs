import { describe, expect, it } from "vitest";
import { createClient, mockFetch } from "../helpers.js";

describe("UsersResource", () => {
  it("me hace GET a /users/me y devuelve el perfil en camelCase", async () => {
    const { calls } = mockFetch({
      json: {
        id: "1",
        email: "m@test.com",
        fullName: "M",
        preferredLanguage: "es",
        role: "user",
        isVerified: true,
        balance: 0,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      },
    });
    const usuario = await createClient().users.me();
    expect(calls[0].method).toBe("GET");
    expect(calls[0].url).toBe("https://api.test/v1/users/me");
    // El SDK no traduce claves: lo que declara el tipo es lo que llega.
    expect(usuario.fullName).toBe("M");
    expect(usuario.preferredLanguage).toBe("es");
  });

  it("update envía el cuerpo en snake_case y recibe la respuesta en camelCase", async () => {
    const { calls } = mockFetch({
      json: {
        id: "1",
        email: "m@test.com",
        fullName: "Nuevo",
        preferredLanguage: "en",
        role: "user",
        isVerified: true,
        balance: 0,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      },
    });
    const actualizado = await createClient().users.update({
      full_name: "Nuevo",
      preferred_language: "en",
    });
    expect(calls[0].method).toBe("PATCH");
    // Petición: snake_case, que es lo que valida UpdateUserDto en el backend.
    expect(JSON.parse(calls[0].body as string)).toEqual({
      full_name: "Nuevo",
      preferred_language: "en",
    });
    // Respuesta: camelCase. Las dos formas conviven en el mismo endpoint.
    expect(actualizado.fullName).toBe("Nuevo");
    expect(actualizado.preferredLanguage).toBe("en");
  });

  it("balance lee /users/me/balance y devuelve el saldo decimal", async () => {
    const { calls } = mockFetch({ json: { balance: 10.42544375 } });
    const saldo = await createClient().users.balance();
    expect(calls[0].url).toBe("https://api.test/v1/users/me/balance");
    // Los 8 decimales del backend deben llegar íntegros: nada de redondeos.
    expect(saldo.balance).toBe(10.42544375);
  });

  it("createApiKey hace POST y deleteApiKey hace DELETE al mismo path", async () => {
    const { calls } = mockFetch({ json: { apiKey: "vca_nueva" } });
    const users = createClient().users;
    await users.createApiKey();
    await users.deleteApiKey();
    expect(calls[0].method).toBe("POST");
    expect(calls[0].url).toBe("https://api.test/v1/users/me/api-key");
    expect(calls[1].method).toBe("DELETE");
    expect(calls[1].url).toBe("https://api.test/v1/users/me/api-key");
  });

  it("apiKeyStatus lee el endpoint de estado", async () => {
    const { calls } = mockFetch({ json: { hasApiKey: true } });
    await createClient().users.apiKeyStatus();
    expect(calls[0].url).toBe("https://api.test/v1/users/me/api-key/status");
  });

  it("deleteAccount hace DELETE a /users/me", async () => {
    const { calls } = mockFetch({ status: 204 });
    await createClient().users.deleteAccount();
    expect(calls[0].method).toBe("DELETE");
    expect(calls[0].url).toBe("https://api.test/v1/users/me");
  });
});
