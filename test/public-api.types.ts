// No es un test de Vitest: es un centinela para `tsc --noEmit`. Si un tipo
// exportado desaparece o se renombra, este fichero deja de compilar.
import type {
  AdvancedParams, ApiKeyCreated, ApiKeyStatus, Audio, CheckoutResponse,
  CloneVoiceRequest, CreditPackage, CreditsBalance, Emotion,
  GenerateAudioRequest, ListPublicVoicesParams, LoginRequest, LoginResponse,
  PaginatedResponse, PaginationParams, RegisterRequest, Transaction,
  Transcription, TranscribeResponse, TtsConfig, TtsLanguage, TtsModel,
  UpdateVoiceMetadataRequest, UsdBalance, User, Voice, VoiceAgeRange,
  VoiceEarnings, VoiceGender, VoiceProvider, VoiceSettings, VoiceStatus,
  VoceaClientOptions, VoceaErrorBody,
} from "../src/index.js";

export type SuperficieDeTipos = {
  advancedParams: AdvancedParams;
  apiKeyCreated: ApiKeyCreated;
  apiKeyStatus: ApiKeyStatus;
  audio: Audio;
  checkoutResponse: CheckoutResponse;
  cloneVoiceRequest: CloneVoiceRequest;
  creditPackage: CreditPackage;
  creditsBalance: CreditsBalance;
  emotion: Emotion;
  generateAudioRequest: GenerateAudioRequest;
  listPublicVoicesParams: ListPublicVoicesParams;
  loginRequest: LoginRequest;
  loginResponse: LoginResponse;
  paginatedResponse: PaginatedResponse<Voice>;
  paginationParams: PaginationParams;
  registerRequest: RegisterRequest;
  transaction: Transaction;
  transcription: Transcription;
  transcribeResponse: TranscribeResponse;
  ttsConfig: TtsConfig;
  ttsLanguage: TtsLanguage;
  ttsModel: TtsModel;
  updateVoiceMetadataRequest: UpdateVoiceMetadataRequest;
  usdBalance: UsdBalance;
  user: User;
  voice: Voice;
  voiceAgeRange: VoiceAgeRange;
  voiceEarnings: VoiceEarnings;
  voiceGender: VoiceGender;
  voiceProvider: VoiceProvider;
  voiceSettings: VoiceSettings;
  voiceStatus: VoiceStatus;
  voceaClientOptions: VoceaClientOptions;
  voceaErrorBody: VoceaErrorBody;
};
