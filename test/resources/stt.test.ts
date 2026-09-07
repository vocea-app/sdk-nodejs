import { describe, expect, it } from "vitest";
import { createClient, mockFetch } from "../helpers.js";

describe("SttResource", () => {
  it("transcribe manda el audio en FormData y el idioma en la query", async () => {
    const { calls } = mockFetch({
      json: { transcript: "hola", characterCount: 4, creditsConsumed: 0.01, durationMs: 500 },
    });
    const audio = new Blob([new Uint8Array([1, 2])], { type: "audio/mpeg" });
    await createClient().stt.transcribe(audio, "en-US");

    expect(calls[0].method).toBe("POST");
    expect(calls[0].url).toBe("https://api.test/v1/stt/transcribe?language=en-US");
    const form = calls[0].body as FormData;
    expect(form).toBeInstanceOf(FormData);
    expect(form.get("audio")).toBeInstanceOf(Blob);
  });

  it("transcribe usa es-ES cuando no se pasa idioma", async () => {
    const { calls } = mockFetch({ json: { transcript: "" } });
    await createClient().stt.transcribe(new Blob([new Uint8Array([1])]));
    expect(calls[0].url).toBe("https://api.test/v1/stt/transcribe?language=es-ES");
  });

  it("listTranscriptions pasa la paginación", async () => {
    const { calls } = mockFetch({ json: { items: [], total: 0, page: 1, limit: 20 } });
    await createClient().stt.listTranscriptions({ page: 2, limit: 5 });
    expect(calls[0].url).toBe("https://api.test/v1/stt/transcriptions?page=2&limit=5");
  });

  it("deleteTranscription hace DELETE", async () => {
    const { calls } = mockFetch({ status: 204 });
    await createClient().stt.deleteTranscription("t1");
    expect(calls[0].method).toBe("DELETE");
    expect(calls[0].url).toBe("https://api.test/v1/stt/transcriptions/t1");
  });
});
