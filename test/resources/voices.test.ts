import { describe, expect, it } from "vitest";
import { createClient, mockFetch } from "../helpers.js";

const paginado = { items: [], total: 0, page: 1, limit: 20 };

describe("VoicesResource", () => {
  it("list pasa la paginación como query", async () => {
    const { calls } = mockFetch({ json: paginado });
    await createClient().voices.list({ page: 3, limit: 10 });
    expect(calls[0].url).toBe("https://api.test/v1/voices?page=3&limit=10");
  });

  it("listPublic añade los filtros del catálogo público", async () => {
    const { calls } = mockFetch({ json: paginado });
    await createClient().voices.listPublic({ page: 1, ageRange: "adult" });
    expect(calls[0].url).toBe("https://api.test/v1/voices/public?page=1&ageRange=adult");
  });

  it("get interpola el id en la ruta", async () => {
    const { calls } = mockFetch({ json: { id: "v1", name: "Mi voz" } });
    const voz = await createClient().voices.get("v1");
    expect(calls[0].method).toBe("GET");
    expect(calls[0].url).toBe("https://api.test/v1/voices/v1");
    expect(voz.id).toBe("v1");
  });

  it("clone manda name y un audio_sample en FormData", async () => {
    const { calls } = mockFetch({ json: { id: "v1" } });
    const muestra = new Blob([new Uint8Array([1, 2, 3])], { type: "audio/mpeg" });
    await createClient().voices.clone({
      name: "Mi voz",
      audio_sample: muestra,
      providerIds: ["prov-1"],
    });

    const form = calls[0].body as FormData;
    expect(form).toBeInstanceOf(FormData);
    expect(form.get("name")).toBe("Mi voz");
    expect(form.getAll("audio_sample")).toHaveLength(1);
  });

  it("clone acepta varias muestras bajo el mismo campo", async () => {
    const { calls } = mockFetch({ json: { id: "v1" } });
    const a = new Blob([new Uint8Array([1])], { type: "audio/mpeg" });
    const b = new Blob([new Uint8Array([2])], { type: "audio/mpeg" });
    await createClient().voices.clone({
      name: "Mi voz",
      audio_sample: [a, b],
      providerIds: ["prov-1"],
    });

    const form = calls[0].body as FormData;
    expect(form.getAll("audio_sample")).toHaveLength(2);
  });

  it("clone omite los campos opcionales que no se pasan", async () => {
    const { calls } = mockFetch({ json: { id: "v1" } });
    await createClient().voices.clone({
      name: "Mi voz",
      audio_sample: new Blob([new Uint8Array([1])]),
    providerIds: ["prov-1"],
    });

    const form = calls[0].body as FormData;
    expect(form.has("sample_text")).toBe(false);
    expect(form.has("language_code")).toBe(false);
  });

  it("clone incluye sample_text y language_code cuando se pasan", async () => {
    const { calls } = mockFetch({ json: { id: "v1" } });
    await createClient().voices.clone({
      name: "Mi voz",
      audio_sample: new Blob([new Uint8Array([1])]),
      providerIds: ["prov-1"],
      sample_text: "Hola",
      language_code: "es",
    });

    const form = calls[0].body as FormData;
    expect(form.get("sample_text")).toBe("Hola");
    expect(form.get("language_code")).toBe("es");
  });

  it("clone envía un providerIds por cada proveedor indicado", async () => {
    const { calls } = mockFetch({ json: { id: "v1" } });
    await createClient().voices.clone({
      name: "Mi voz",
      audio_sample: new Blob([new Uint8Array([1])]),
      providerIds: ["prov-a", "prov-b"],
    });

    // Viajan como partes repetidas del multipart, que es como la API
    // recibe listas. Una sola parte "prov-a,prov-b" también la acepta el
    // servidor, pero repetirlas es lo que hacen los otros SDK.
    const form = calls[0].body as FormData;
    expect(form.getAll("providerIds")).toEqual(["prov-a", "prov-b"]);
  });

  it("update cambia solo el nombre", async () => {
    const { calls } = mockFetch({ json: { id: "v1" } });
    await createClient().voices.update("v1", "Otro nombre");
    expect(calls[0].method).toBe("PATCH");
    expect(calls[0].url).toBe("https://api.test/v1/voices/v1");
    expect(JSON.parse(calls[0].body as string)).toEqual({ name: "Otro nombre" });
  });

  it("updateMetadata usa su propia subruta", async () => {
    const { calls } = mockFetch({ json: { id: "v1" } });
    await createClient().voices.updateMetadata("v1", { ageRange: "senior" });
    expect(calls[0].url).toBe("https://api.test/v1/voices/v1/metadata");
    expect(JSON.parse(calls[0].body as string)).toEqual({ ageRange: "senior" });
  });

  it("favorite, requestPublic y earnings apuntan a sus subrutas", async () => {
    const { calls } = mockFetch({ json: { isFavorited: true } });
    const voices = createClient().voices;
    await voices.favorite("v1");
    await voices.requestPublic("v1");
    await voices.earnings("v1");
    expect(calls[0].url).toBe("https://api.test/v1/voices/v1/favorite");
    expect(calls[1].url).toBe("https://api.test/v1/voices/v1/request-public");
    expect(calls[2].url).toBe("https://api.test/v1/voices/v1/earnings");
    expect(calls[2].method).toBe("GET");
  });

  it("delete hace DELETE y no devuelve cuerpo", async () => {
    const { calls } = mockFetch({ status: 204 });
    await expect(createClient().voices.delete("v1")).resolves.toBeUndefined();
    expect(calls[0].method).toBe("DELETE");
  });

  it("sample devuelve la Response cruda", async () => {
    mockFetch({ text: "bytes" });
    const res = await createClient().voices.sample("v1");
    expect(res).toBeInstanceOf(Response);
  });
});
