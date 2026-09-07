# @vocea.app/sdk

Official Vocea SDK for Node.js and TypeScript. Provides text-to-speech generation, voice cloning, speech-to-text transcription, and account management through the Vocea API.

## Requirements

- Node.js 18 or higher

## Installation

```bash
npm install @vocea.app/sdk
# or
bun add @vocea.app/sdk
```

## Table of Contents

- [Setup](#setup)
- [Authentication](#authentication-voceaauth)
- [Users](#users-voceausers)
- [Voices](#voices-voceavoices)
- [Text-to-Speech](#text-to-speech-voceaaudios)
- [Speech-to-Text](#speech-to-text-voceastt)
- [Credits](#credits-voceacredits)
- [Error Handling](#error-handling)
- [TypeScript Types](#typescript-types)

---

## Setup

Create a client instance with your API key. You can generate one from your Vocea dashboard or programmatically via `vocea.users.createApiKey()`.

```typescript
import { VoceaClient } from "@vocea.app/sdk";

const vocea = new VoceaClient({
  apiKey: "vca_your_api_key_here",
});
```

**Options:**

| Option    | Type     | Required | Description                                                     |
| --------- | -------- | -------- | --------------------------------------------------------------- |
| `apiKey`  | `string` | Yes      | Your API key (starts with `vca_`)                               |
| `baseUrl` | `string` | No       | Override the API base URL (default: `https://vocea.app/api/v1`) |

---

## Authentication (`vocea.auth`)

These methods handle account creation and session management.

### Register a new account

```typescript
await vocea.auth.register({
  full_name: "María García",
  email: "maria@example.com",
  password: "securePassword123",
  birth_year: 1990,
  referral_code: "FRIEND2024", // optional
});
// Returns: { message: "Registration successful" }
```

### Log in

```typescript
const session = await vocea.auth.login({
  email: "maria@example.com",
  password: "securePassword123",
});

console.log(session.access_token); // bearer token for API requests
console.log(session.user.id);
console.log(session.user.email);
```

### Verify email address

After registration, the user receives a verification email containing a token.

```typescript
await vocea.auth.verifyEmail("token-from-email");
```

### Resend verification email

```typescript
await vocea.auth.resendVerification("maria@example.com");
```

### Request a password reset

```typescript
await vocea.auth.forgotPassword("maria@example.com");
// Sends a reset email with a one-time token
```

### Reset password

```typescript
await vocea.auth.resetPassword("token-from-email", "newSecurePassword456");
```

### Log out

```typescript
await vocea.auth.logout();
```

---

## Users (`vocea.users`)

Manage the authenticated user's profile, credits, and API keys.

### Get your profile

```typescript
const user = await vocea.users.me();

console.log(user.id);
console.log(user.email);
console.log(user.full_name);
console.log(user.preferred_language); // e.g. "es"
```

### Update your profile

```typescript
const updated = await vocea.users.update({
  full_name: "María García López",
  preferred_language: "en",
});
```

### Check your credit balance

```typescript
const balance = await vocea.users.credits();
console.log(balance.creditsBalance); // e.g. 5000
```

### Manage your API key

```typescript
// Check whether you already have an API key
const status = await vocea.users.apiKeyStatus();
console.log(status.hasApiKey); // true or false

// Generate a new API key (replaces any existing key)
const { apiKey } = await vocea.users.createApiKey();
console.log(apiKey); // "vca_..."  — save this, it will not be shown again

// Delete your API key
await vocea.users.deleteApiKey();
```

### Delete your account

```typescript
await vocea.users.deleteAccount();
```

---

## Voices (`vocea.voices`)

Clone voices from audio samples and manage your voice library.

### List your voices

```typescript
const result = await vocea.voices.list({ page: 1, limit: 20 });

console.log(result.total); // total number of voices
console.log(result.page);
console.log(result.limit);

for (const voice of result.items) {
  console.log(voice.id, voice.name, voice.status);
}
```

### List public voices

Browse voices shared by the community. Filter by country, region, or age range.

```typescript
// All public voices
const all = await vocea.voices.listPublic();

// Filtered
const filtered = await vocea.voices.listPublic({
  countryId: "uuid-of-country",
  regionId: "uuid-of-region",
  ageRange: "adult", // "young" | "adult" | "senior"
  page: 1,
  limit: 10,
});
```

### Get a single voice

```typescript
const voice = await vocea.voices.get("voice-uuid");

console.log(voice.id);
console.log(voice.name);
console.log(voice.status);          // "pending" | "active" | "failed"
console.log(voice.failureReason);   // set if status is "failed"
console.log(voice.isPublic);
console.log(voice.isFavorited);
console.log(voice.favoritesCount);
console.log(voice.timesUsed);
console.log(voice.creditsEarnedTotal);
```

### Clone a voice

Upload one or more audio samples to create a new cloned voice. The voice starts with `status: "pending"` while it is being processed and transitions to `"active"` when ready.

```typescript
import { readFileSync } from "fs";

// Single sample
const voice = await vocea.voices.clone({
  name: "My Voice",
  audio_sample: new Blob([readFileSync("sample.mp3")], { type: "audio/mpeg" }),
  language_code: "es",                             // optional, helps the model
  sample_text: "Hola, esta es una frase de muestra.", // optional
});

console.log(voice.id);
console.log(voice.status); // "pending" — poll until it becomes "active"
```

```typescript
// Multiple samples — produces better voice quality
const voice = await vocea.voices.clone({
  name: "My Voice HD",
  audio_sample: [
    new Blob([readFileSync("sample1.mp3")], { type: "audio/mpeg" }),
    new Blob([readFileSync("sample2.mp3")], { type: "audio/mpeg" }),
    new Blob([readFileSync("sample3.mp3")], { type: "audio/mpeg" }),
  ],
});
```

### Rename a voice

```typescript
const updated = await vocea.voices.update("voice-uuid", "New Name");
```

### Update voice metadata

Attach country, region, and age range to a voice. This information is displayed in the public voice library.

```typescript
const updated = await vocea.voices.updateMetadata("voice-uuid", {
  countryId: "uuid-of-existing-country", // use existing country...
  regionId: "uuid-of-existing-region",   // ...and region
  ageRange: "adult",                     // "young" | "adult" | "senior"
});

// Or create new country/region entries on the fly
const updated2 = await vocea.voices.updateMetadata("voice-uuid", {
  newCountryName: "Colombia",
  newRegionName: "Bogotá",
  ageRange: "young",
});
```

### Delete a voice

```typescript
await vocea.voices.delete("voice-uuid");
```

### Favorite / unfavorite a voice

The call toggles the current state and returns the new value.

```typescript
const result = await vocea.voices.favorite("voice-uuid");
console.log(result.isFavorited); // true if now favorited, false if removed
```

### Request to make a voice public

Submit your voice for review. Once approved, it will appear in the public voice library and you earn credits every time another user generates audio with it.

```typescript
await vocea.voices.requestPublic("voice-uuid");
```

### Get voice earnings

```typescript
const data = await vocea.voices.earnings("voice-uuid");

console.log(data.creditsEarnedTotal);
console.log(data.timesUsed);

for (const entry of data.earnings) {
  console.log(entry.month, entry.creditsEarned); // e.g. "2024-03", 120
}
```

### Stream a voice sample preview

```typescript
const response = await vocea.voices.sample("voice-uuid");
const buffer = Buffer.from(await response.arrayBuffer());
// pipe to an audio player, write to disk, etc.
```

---

## Text-to-Speech (`vocea.audios`)

Generate speech from text using any active voice in your library or the public library.

### Generate audio

```typescript
const audio = await vocea.audios.generate({
  voice_id: "voice-uuid",
  text: "Hello, this is a test of the Vocea text-to-speech API.",
  language_code: "en",
});

console.log(audio.id);
console.log(audio.audioUrl);        // direct URL to the generated audio file
console.log(audio.durationSeconds);
console.log(audio.characterCount);
console.log(audio.emotion);
console.log(audio.speakingRate);
```

### Generate audio with voice settings

Fine-tune the delivery with optional parameters.

```typescript
const audio = await vocea.audios.generate({
  voice_id: "voice-uuid",
  text: "This message is delivered in a calm, slow whisper.",
  language_code: "en",
  voice_setting: {
    speakingRate: 0.85,   // 0.5 = slow · 1.0 = normal · 2.0 = fast
    temperature: 0.7,     // 0.0 = consistent · 1.0 = expressive/varied
    emotion: "whisper",
  },
});
```

**Available emotions:**

| Value       | Description                        |
| ----------- | ---------------------------------- |
| `neutral`   | Default, no added emotional tone   |
| `happy`     | Upbeat and cheerful                |
| `sad`       | Soft and downcast                  |
| `angry`     | Firm and forceful                  |
| `fearful`   | Tense and hesitant                 |
| `surprised` | Elevated pitch, expressive         |
| `disgusted` | Low and repulsed tone              |
| `whisper`   | Very quiet, breathy delivery       |

### List your generated audios

```typescript
const result = await vocea.audios.list({ page: 1, limit: 20 });

console.log(result.total);

for (const audio of result.items) {
  console.log(audio.id, audio.textContent, audio.durationSeconds);
}
```

### Get a single audio

```typescript
const audio = await vocea.audios.get("audio-uuid");
console.log(audio.audioUrl);
console.log(audio.languageCode);
console.log(audio.createdAt);
```

### Get a public playback URL

Returns a URL that does not require authentication — useful for embedding in a web player or sharing.

```typescript
const url = vocea.audios.playUrl("audio-uuid");
// "https://vocea.app/api/v1/audios/audio-uuid/play.mp3"
```

### Download audio as a binary stream

```typescript
import { writeFileSync } from "fs";

const response = await vocea.audios.download("audio-uuid");
const buffer = Buffer.from(await response.arrayBuffer());
writeFileSync("output.mp3", buffer);
```

### Delete an audio

```typescript
await vocea.audios.delete("audio-uuid");
```

---

## Speech-to-Text (`vocea.stt`)

Transcribe audio files to text.

### Transcribe audio

```typescript
import { readFileSync } from "fs";

const result = await vocea.stt.transcribe(
  new Blob([readFileSync("recording.mp3")], { type: "audio/mpeg" }),
  "es-ES", // BCP-47 language code — defaults to "es-ES"
);

console.log(result.transcript);       // the transcribed text
console.log(result.characterCount);   // number of characters in the transcript
console.log(result.creditsConsumed);  // credits deducted for this request
console.log(result.durationMs);       // audio duration in milliseconds
```

### List your past transcriptions

```typescript
const result = await vocea.stt.listTranscriptions({ page: 1, limit: 10 });

for (const t of result.items) {
  console.log(t.id);
  console.log(t.transcript);
  console.log(t.characterCount);
  console.log(t.durationMs);
  console.log(t.createdAt);
}
```

### Delete a transcription

```typescript
await vocea.stt.deleteTranscription("transcription-uuid");
```

---

## Credits (`vocea.credits`)

Purchase credit packages and track usage history.

### List available packages

```typescript
const packages = await vocea.credits.listPackages();

for (const pkg of packages) {
  if (pkg.isActive) {
    console.log(`${pkg.name}: ${pkg.credits} credits — $${pkg.priceUsd} USD`);
  }
}
```

### Create a checkout session

Initiates a payment flow and returns a URL to redirect the user to.

```typescript
const { checkoutUrl } = await vocea.credits.checkout(
  "package-uuid",
  "https://yourapp.com/credits/success", // optional redirect after payment
);

// Redirect the user
window.location.href = checkoutUrl;
```

### List transaction history

```typescript
// All transactions, newest first
const all = await vocea.credits.listTransactions({ page: 1, limit: 20 });

// Filter by type
const purchases    = await vocea.credits.listTransactions({ type: "purchase" });
const consumption  = await vocea.credits.listTransactions({ type: "consumption" });
const adjustments  = await vocea.credits.listTransactions({ type: "adjustment" });

for (const tx of all.items) {
  console.log(`[${tx.type}] ${tx.amount > 0 ? "+" : ""}${tx.amount} credits — ${tx.description}`);
}
```

**Transaction types:**

| Type          | Description                                        |
| ------------- | -------------------------------------------------- |
| `purchase`    | Credits added via a successful payment             |
| `consumption` | Credits deducted by TTS or STT API usage           |
| `adjustment`  | Manual credit adjustment by the Vocea team         |

---

## Error Handling

All failed API requests throw a `VoceaError` instance. It exposes the HTTP status code and the full error body returned by the server.

```typescript
import { VoceaClient, VoceaError } from "@vocea.app/sdk";

const vocea = new VoceaClient({ apiKey: "vca_..." });

try {
  await vocea.audios.generate({
    voice_id: "voice-uuid",
    text: "Hello!",
    language_code: "en",
  });
} catch (err) {
  if (err instanceof VoceaError) {
    console.error(`HTTP ${err.statusCode}`);
    console.error(err.message);  // human-readable summary
    console.error(err.body);     // full response body { statusCode, message, error? }

    switch (err.statusCode) {
      case 401:
        // Invalid or missing API key
        break;
      case 402:
        // Insufficient credits — prompt the user to purchase more
        break;
      case 404:
        // Resource not found (voice, audio, etc.)
        break;
      case 422:
        // Voice is still being processed (status: "pending")
        break;
    }
  }
}
```

---

## TypeScript Types

All types are exported from the package root.

> **Cambio en 0.2.0:** `Voice.creditsEarnedTotal` pasa de `number` a `string`.
> La API siempre devolvió un decimal serializado (`"0.00000000"`); el tipo
> anterior era incorrecto. Usa `Number(voice.creditsEarnedTotal)` para operar.
> `Voice.langSet` queda deprecado: la API ya no lo envía.

```typescript
import type {
  // Client
  VoceaClientOptions,

  // Auth
  LoginRequest,
  LoginResponse,
  RegisterRequest,

  // Users
  User,
  CreditsBalance,
  ApiKeyStatus,
  ApiKeyCreated,

  // Voices
  Voice,
  VoiceStatus,              // "pending" | "active" | "failed"
  VoiceAgeRange,            // "young" | "adult" | "senior"
  CloneVoiceRequest,
  UpdateVoiceMetadataRequest,
  ListPublicVoicesParams,

  // Audios
  Audio,
  GenerateAudioRequest,
  VoiceSettings,
  Emotion,

  // STT
  TranscribeResponse,
  Transcription,

  // Credits
  CreditPackage,
  CheckoutResponse,
  Transaction,

  // Shared
  PaginatedResponse,
  PaginationParams,
  VoceaErrorBody,
} from "@vocea.app/sdk";
```

---

## License

MIT — [vocea.app](https://vocea.app)
