import { describe, expect, it } from "vitest";
import { createClient, mockFetch } from "../helpers.js";

describe("UsersResource", () => {
  it("me hace GET a /users/me", async () => {
    const { calls } = mockFetch({ json: { id: "1", email: "m@test.com", full_name: "M" } });
    await createClient().users.me();
    expect(calls[0].method).toBe("GET");
    expect(calls[0].url).toBe("https://api.test/v1/users/me");
  });

  it("update hace PATCH con los campos enviados", async () => {
    const { calls } = mockFetch({ json: {} });
    await createClient().users.update({ full_name: "Nuevo" });
    expect(calls[0].method).toBe("PATCH");
    expect(JSON.parse(calls[0].body as string)).toEqual({ full_name: "Nuevo" });
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
