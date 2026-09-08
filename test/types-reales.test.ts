import { describe, expect, it } from "vitest";
import type {
  PaginatedResponse,
  TtsModel,
  TtsModelListItem,
  User,
  Voice,
} from "../src/types.js";

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

// Respuesta real de GET /tts-models (el listado): trae providerId y
// maxCharacters porque el servicio solo recorta provider, providerModelId y
// costPerMillionUsd.
const modeloDeListado: TtsModelListItem = {
  id: "850ef31c-7322-11f1-ba31-e690074a8215",
  name: "Realtime TTS 1.5 Mini",
  description: null,
  providerId: "84c9abe2-7322-11f1-ba31-e690074a8215",
  maxCharacters: 2000,
  isActive: true,
  sortOrder: 0,
  createdAt: "2026-06-28T18:52:32.362Z",
};

// Respuesta real de GET /tts-models/:id. El mismo modelo, servido con el
// `select` reducido de `PUBLIC_SELECT`: sin providerId ni maxCharacters.
const modeloDeDetalle: TtsModel = {
  id: "850ef31c-7322-11f1-ba31-e690074a8215",
  name: "Realtime TTS 1.5 Mini",
  description: null,
  isActive: true,
  sortOrder: 0,
  createdAt: "2026-06-28T18:52:32.362Z",
};

// Respuesta real de GET /users/me. La API la construye a partir de la entidad
// del backend, así que llega en camelCase, no en snake_case.
const usuarioReal: User = {
  id: "1f0c9a5e-1e0b-4a2a-9c1d-0b9f8a7d6c5b",
  email: "maria@example.com",
  fullName: "María García",
  preferredLanguage: "es",
  role: "user",
  isVerified: true,
  balance: 10.42544375,
  createdAt: "2026-06-28T18:52:32.362Z",
  updatedAt: "2026-09-05T11:14:02.000Z",
};

/**
 * Afirmaciones que se comprueban en `tsc --noEmit`, no en tiempo de ejecución:
 * `Assert<false>` no compila. Fijan los dos desajustes que este SDK arrastraba
 * para que no vuelvan a colarse.
 */
type Assert<T extends true> = T;

export type ElUsuarioViajaEnCamelCase = Assert<
  "fullName" extends keyof User ? true : false
>;
export type ElUsuarioNoTieneClavesSnakeCase = Assert<
  "full_name" extends keyof User ? false : true
>;
export type ElDetalleDeModeloNoTraeMaxCharacters = Assert<
  "maxCharacters" extends keyof TtsModel ? false : true
>;
export type ElDetalleDeModeloNoTraeProviderId = Assert<
  "providerId" extends keyof TtsModel ? false : true
>;
export type ElListadoDeModelosSiLosTrae = Assert<
  "maxCharacters" extends keyof TtsModelListItem
    ? "providerId" extends keyof TtsModelListItem
      ? true
      : false
    : false
>;

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

  it("el listado de modelos expone maxCharacters, que limita el texto de generate", () => {
    expect(modeloDeListado.maxCharacters).toBe(2000);
    expect(modeloDeListado.providerId).toBe("84c9abe2-7322-11f1-ba31-e690074a8215");
  });

  it("el detalle del mismo modelo no emite providerId ni maxCharacters", () => {
    // El backend sirve /tts-models/:id con un select reducido. Declararlos
    // obligatorios en el detalle era la mentira que corrige este test.
    expect(Object.keys(modeloDeDetalle)).not.toContain("providerId");
    expect(Object.keys(modeloDeDetalle)).not.toContain("maxCharacters");
    expect(modeloDeDetalle.id).toBe(modeloDeListado.id);
  });

  it("el perfil de /users/me llega en camelCase", () => {
    expect(usuarioReal.fullName).toBe("María García");
    expect(usuarioReal.preferredLanguage).toBe("es");
    expect(Object.keys(usuarioReal)).not.toContain("full_name");
    expect(Object.keys(usuarioReal)).not.toContain("preferred_language");
  });

  it("el saldo del perfil llega como número con sus 8 decimales", () => {
    expect(usuarioReal.balance).toBe(10.42544375);
  });

  it("el paginado incluye totalPages", () => {
    expect(paginaReal.totalPages).toBe(1);
  });
});
