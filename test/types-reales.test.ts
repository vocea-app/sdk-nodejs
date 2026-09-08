import { describe, expect, it } from "vitest";
import type { PaginatedResponse, TtsModel, Voice } from "../src/types.js";

// Respuesta real de GET /voices, capturada el 2026-09-05. No la "limpies":
// su valor está justamente en ser lo que la API devuelve de verdad.
const vozReal: Voice = {
  id: "9d8d8154-1393-44ce-9668-bc920bdc8de5",
  name: "personal02092026",
  status: "active",
  failureReason: null,
  cloneAudioDuration: 22.1535,
  languageCode: "es",
  countryId: null,
  country: null,
  regionId: null,
  region: null,
  ageRange: null,
  gender: null,
  isPublicRequest: false,
  isPublic: false,
  publicRejectReason: null,
  timesUsed: 0,
  balanceEarnedTotal: 0,
  lastUsedAt: null,
  createdAt: "2026-09-03T04:38:34.952Z",
  updatedAt: "2026-09-03T04:38:48.000Z",
  deletedAt: null,
  providers: [
    {
      provider_id: "84c9abe2-7322-11f1-ba31-e690074a8215",
      name: "inworld",
      is_enabled: true,
      is_cloned: true,
      last_used_at: "2026-09-04T16:29:53.100Z",
      has_sample_preview: true,
    },
  ],
  hasSamplePreview: true,
  isFavorited: false,
  favoritesCount: 0,
};

// Respuesta real de GET /tts-models.
const modeloReal: TtsModel = {
  id: "850ef31c-7322-11f1-ba31-e690074a8215",
  name: "Realtime TTS 1.5 Mini",
  description: null,
  providerId: "84c9abe2-7322-11f1-ba31-e690074a8215",
  maxCharacters: 2000,
  isActive: true,
  sortOrder: 0,
  createdAt: "2026-06-28T18:52:32.362Z",
};

const paginaReal: PaginatedResponse<Voice> = {
  items: [vozReal],
  total: 3,
  page: 1,
  limit: 20,
  totalPages: 1,
};

describe("los tipos admiten la forma real de la API", () => {
  it("balanceEarnedTotal llega como número, no como string", () => {
    expect(typeof vozReal.balanceEarnedTotal).toBe("number");
  });

  it("providers describe el estado por proveedor", () => {
    expect(vozReal.providers[0].name).toBe("inworld");
    expect(vozReal.providers[0].is_cloned).toBe(true);
  });

  it("el modelo expone maxCharacters, que limita el texto de generate", () => {
    expect(modeloReal.maxCharacters).toBe(2000);
  });

  it("el paginado incluye totalPages", () => {
    expect(paginaReal.totalPages).toBe(1);
  });
});
