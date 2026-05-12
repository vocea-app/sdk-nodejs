// ─── Auth ──────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: { id: string; email: string };
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  birth_year: number;
  referral_code?: string;
}

// ─── Users ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  preferred_language?: string;
}

export interface CreditsBalance {
  creditsBalance: number;
}

export interface ApiKeyStatus {
  hasApiKey: boolean;
}

export interface ApiKeyCreated {
  apiKey: string;
}

// ─── Voices ────────────────────────────────────────────────────────────────

export type VoiceStatus = "pending" | "active" | "failed";
export type VoiceAgeRange = "young" | "adult" | "senior";

export interface Voice {
  id: string;
  name: string;
  status: VoiceStatus;
  failureReason: string | null;
  langSet: "full" | "lite" | null;
  countryId: string | null;
  regionId: string | null;
  ageRange: VoiceAgeRange | null;
  country: { id: string; name: string; code: string } | null;
  region: { id: string; name: string } | null;
  isPublicRequest: boolean;
  isPublic: boolean;
  timesUsed: number;
  creditsEarnedTotal: number;
  publicRejectReason: string | null;
  hasSamplePreview: boolean;
  isFavorited: boolean;
  favoritesCount: number;
  createdAt: string;
  updatedAt: string;
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

export interface VoiceSettings {
  speakingRate?: number;
  temperature?: number;
  emotion?: Emotion;
}

export interface GenerateAudioRequest {
  voice_id: string;
  text: string;
  language_code: string;
  voice_setting?: VoiceSettings;
}

export interface Audio {
  id: string;
  voiceId: string;
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
  creditsConsumed: number;
  durationMs: number;
}

// ─── Credits ───────────────────────────────────────────────────────────────

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceUsd: number;
  isActive: boolean;
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
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  [key: string]: string | number | undefined;
}

// ─── Error ─────────────────────────────────────────────────────────────────

export interface VoceaErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}
