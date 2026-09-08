import { describe, expect, it } from "vitest";
import * as sdk from "../src/index.js";
import { VoceaClient } from "../src/client.js";

function metodosDe(objeto: object): string[] {
  return Object.getOwnPropertyNames(Object.getPrototypeOf(objeto))
    .filter((n) => n !== "constructor")
    .sort();
}

describe("superficie pública", () => {
  it("exporta exactamente estos símbolos en runtime", () => {
    expect(Object.keys(sdk).sort()).toEqual(["VoceaClient", "VoceaError"]);
  });

  it("el cliente expone exactamente estos recursos", () => {
    const vocea = new VoceaClient({ apiKey: "vca_test" });
    expect(Object.keys(vocea).sort()).toEqual([
      "audios",
      "auth",
      "balance",
      "models",
      "stt",
      "users",
      "voices",
    ]);
  });

  it("los métodos de cada recurso son los declarados", () => {
    const vocea = new VoceaClient({ apiKey: "vca_test" });
    expect(metodosDe(vocea.auth)).toEqual([
      "forgotPassword", "login", "logout", "register",
      "resendVerification", "resetPassword", "verifyEmail",
    ]);
    expect(metodosDe(vocea.users)).toEqual([
      "apiKeyStatus", "balance", "createApiKey",
      "deleteAccount", "deleteApiKey", "me", "update",
    ]);
    expect(metodosDe(vocea.voices)).toEqual([
      "clone", "delete", "earnings", "favorite", "get", "list",
      "listPublic", "requestPublic", "sample", "update", "updateMetadata",
    ]);
    expect(metodosDe(vocea.audios)).toEqual([
      "delete", "download", "generate", "get", "list", "playUrl",
    ]);
    expect(metodosDe(vocea.stt)).toEqual([
      "deleteTranscription", "listTranscriptions", "transcribe",
    ]);
    expect(metodosDe(vocea.balance)).toEqual([
      "checkout", "listPackages", "listTransactions",
    ]);
    expect(metodosDe(vocea.models)).toEqual([
      "config", "get", "languages", "list", "liteLanguages",
    ]);
  });

  it("usa la URL de producción cuando no se pasa baseUrl", () => {
    const vocea = new VoceaClient({ apiKey: "vca_test" });
    expect(vocea.audios.playUrl("a1")).toBe(
      "https://vocea.app/api/v1/audios/a1/play.mp3",
    );
  });
});
