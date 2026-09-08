// ─── Auth ──────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  /** El mismo perfil saneado que devuelve `GET /users/me`, no solo id y email. */
  user: User;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  birth_year: number;
  referral_code?: string;
}

// ─── Users ─────────────────────────────────────────────────────────────────

/**
 * Perfil que devuelven `GET /users/me`, `PATCH /users/me` y el campo `user` de
 * `POST /auth/login`: la entidad del backend sin sus campos sensibles.
 *
 * Sus claves viajan en **camelCase** (`fullName`, `preferredLanguage`). El
 * cuerpo que se ENVÍA para actualizar el perfil o para registrarse va en
 * snake_case (ver `UpdateUserRequest` y `RegisterRequest`): son dos formas
 * distintas y las dos son correctas.
 */
export interface User {
  id: string;
  email: string;
  fullName: string;
  /** Código BCP-47. Siempre presente: la columna tiene valor por defecto. */
  preferredLanguage: string;
  role: "user" | "admin";
  isVerified: boolean;
  /** Saldo en USD (decimal, hasta 8 posiciones). */
  balance: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cuerpo de `PATCH /users/me`, en snake_case: es lo que valida el backend
 * (`UpdateUserDto`). La respuesta, en cambio, es un `User` en camelCase.
 */
export interface UpdateUserRequest {
  full_name?: string;
  preferred_language?: string;
}

/** Saldo en USD (decimal, hasta 8 posiciones). */
export interface UsdBalance {
  balance: number;
}

export interface ApiKeyStatus {
  hasApiKey: boolean;
}

export interface ApiKeyCreated {
  apiKey: string;
}

// ─── TTS Models ────────────────────────────────────────────────────────────

/**
 * Modelo TTS tal y como lo devuelve `GET /tts-models/:id`.
 *
 * El detalle se sirve con un `select` reducido (`PUBLIC_SELECT` en
 * `tts-models.service.ts`), así que **no** incluye `providerId` ni
 * `maxCharacters`. El listado sí los emite: ver `TtsModelListItem`.
 */
export interface TtsModel {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

/**
 * Modelo TTS tal y como lo devuelve `GET /tts-models` (el listado), que añade
 * dos campos que el detalle no trae.
 */
export interface TtsModelListItem extends TtsModel {
  /**
   * Proveedor que sirve este modelo (Inworld, Minimax, ElevenLabs).
   *
   * La columna admite NULL, pero el listado descarta los modelos sin proveedor
   * activo con cuenta, así que en esta respuesta nunca llega nulo.
   */
  providerId: string;
  /** Límite de caracteres por generación para este modelo. */
  maxCharacters: number;
}

export interface TtsLanguage {
  code: string;
  name: string;
}

export interface TtsConfig {
  /** Indica si el conjunto completo de idiomas está disponible */
  full: boolean;
  /** Indica si el conjunto reducido (Inworld) está disponible */
  lite: boolean;
}

// ─── Voices ────────────────────────────────────────────────────────────────

export type VoiceStatus = "pending" | "active" | "failed";
export type VoiceAgeRange = "young" | "adult" | "senior";
export type VoiceGender = "male" | "female" | "neutral";

/**
 * Estado de la voz en cada proveedor TTS. La API devuelve estas claves en
 * snake_case, a diferencia del resto de la respuesta: se respeta tal cual para
 * no mentir sobre el JSON que llega.
 */
export interface VoiceProvider {
  provider_id: string;
  /** `inworld` (Standard), `minimax` (Premium), `elevenlabs` (Studio). */
  name: string;
  is_enabled: boolean;
  /** La voz está físicamente clonada en este proveedor y se puede usar. */
  is_cloned: boolean;
  last_used_at: string | null;
  has_sample_preview: boolean;
}

export interface Voice {
  id: string;
  name: string;
  status: VoiceStatus;
  failureReason: string | null;
  /** Duración en segundos del audio usado para clonar. */
  cloneAudioDuration: number;
  languageCode: string;
  countryId: string | null;
  regionId: string | null;
  ageRange: VoiceAgeRange | null;
  gender: VoiceGender | null;
  country: { id: string; name: string; code: string } | null;
  region: { id: string; name: string } | null;
  isPublicRequest: boolean;
  isPublic: boolean;
  timesUsed: number;
  /** Saldo total en USD generado por esta voz cuando otros la usan. */
  balanceEarnedTotal: number;
  publicRejectReason: string | null;
  hasSamplePreview: boolean;
  isFavorited: boolean;
  favoritesCount: number;
  /** Estado de la voz en cada proveedor TTS. */
  providers: VoiceProvider[];
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  /**
   * @deprecated La API dejó de enviarlo. Se mantiene opcional por si algún
   * endpoint no auditado todavía lo incluye.
   */
  langSet?: "full" | "lite" | null;
}

export interface CloneVoiceRequest {
  name: string;
  audio_sample: Blob | Buffer | File | Array<Blob | Buffer | File>;
  sample_text?: string;
  language_code?: string;
}

export interface UpdateVoiceMetadataRequest {
  countryId?: string;
  regionId?: string;
  ageRange?: VoiceAgeRange;
  newCountryName?: string;
  newRegionName?: string;
}

// ─── Audios ────────────────────────────────────────────────────────────────

export type Emotion =
  | "neutral"
  | "happy"
  | "sad"
  | "angry"
  | "fearful"
  | "surprised"
  | "disgusted"
  | "whisper";

/**
 * Parámetros de voz básicos (retrocompatibilidad).
 * Para control avanzado usa `advanced_params` en `GenerateAudioRequest`.
 */
export interface VoiceSettings {
  speakingRate?: number;
  temperature?: number;
  emotion?: Emotion;
}

/**
 * Parámetros avanzados por proveedor.
 *
 * - Inworld (standard): `expressiveness` (0-100)
 * - Minimax (premium): `pitch` (-100 a 100, en semitonos), `volume` (0-100), `emotion`
 * - ElevenLabs (studio): `stability` (0-100), `clarity` (0-100), `style` (0-100)
 */
export interface AdvancedParams {
  expressiveness?: number;
  pitch?: number;
  volume?: number;
  emotion?: Emotion;
  stability?: number;
  clarity?: number;
  style?: number;
  [key: string]: unknown;
}

export interface GenerateAudioRequest {
  /** Voz clonada del usuario. Mutuamente exclusivo con `provider_voice_id`. */
  voice_id?: string;
  /**
   * Voz del catálogo de proveedores. Mutuamente exclusivo con `voice_id`.
   *
   * El SDK todavía no expone el catálogo: los ids se obtienen llamando a mano
   * a `GET /voices/explore` y tomando el campo `id` de los ítems con
   * `source: "provider"`.
   */
  provider_voice_id?: string;
  text: string;
  language_code: string;
  /** ID del modelo TTS. Obtén la lista con `client.models.list()`. */
  tts_model_id?: string;
  /** Velocidad del habla (0.5–1.5). Por defecto: 1.0 */
  speed?: number;
  /** Parámetros avanzados específicos por proveedor. */
  advanced_params?: AdvancedParams;
  /** @deprecated Usa `advanced_params` y `speed`. Mantenido por retrocompatibilidad. */
  voice_setting?: VoiceSettings;
}

export interface Audio {
  id: string;
  /** null cuando el audio se generó con una voz del catálogo de proveedores. */
  voiceId: string | null;
  /** null cuando el audio se generó con una voz clonada del usuario. */
  providerVoiceId: string | null;
  ttsModelId: string;
  textContent: string;
  characterCount: number;
  languageCode: string;
  durationSeconds: number;
  speakingRate: number;
  temperature: number;
  emotion: Emotion;
  audioUrl: string;
  createdAt: string;
}

// ─── STT ───────────────────────────────────────────────────────────────────

export interface TranscribeResponse {
  transcript: string;
  characterCount: number;
  /** Saldo en USD descontado por esta transcripción. */
  balanceConsumed: number;
  durationMs: number;
}

// ─── Balance ───────────────────────────────────────────────────────────────

export interface BalancePackage {
  id: string;
  name: string;
  /** Precio en USD, que es también el saldo que suma la compra. */
  priceUsd: number;
  isActive: boolean;
  lemonsqueezyVariantId?: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
}

// ─── Pagination ────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  /** Número total de páginas para `limit`. */
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  [key: string]: string | number | undefined;
}

// ─── Error ─────────────────────────────────────────────────────────────────

export interface VoceaErrorBody {
  statusCode: number;
  /** La API sanitiza sus errores, así que normalmente no viene. */
  message?: string | string[];
  /** Código estable de error: INSUFFICIENT_BALANCE, VOICE_NOT_FOUND, … */
  errorCode?: string;
  error?: string;
}
