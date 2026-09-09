# @vocea.app/sdk

Official Vocea SDK for Node.js and TypeScript. Provides text-to-speech generation, voice cloning, speech-to-text transcription, and account management through the Vocea API.

## Requirements

- Node.js 18 or higher

The published package only relies on `fetch`, `FormData` and `Blob`, all present
since Node 18, so `engines.node` in `package.json` stays at `>=18`. Developing
the SDK itself is stricter: the test suite (Vitest 5) requires Node 22.12+ —
ESLint 10 alone would tolerate 20.19+, but Vitest is the binding constraint.
`.nvmrc` pins the exact version (22) used to develop and test this
repository — run `nvm use` before `pnpm install` if you're contributing.

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
- [Balance](#balance-voceabalance)
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

Manage the authenticated user's profile, balance, and API keys.

### Get your profile

```typescript
const user = await vocea.users.me();

console.log(user.id);
console.log(user.email);
console.log(user.fullName);
console.log(user.preferredLanguage); // e.g. "es"
console.log(user.balance); // USD, same value as vocea.users.balance()
```

The profile comes back in **camelCase** (`fullName`, `preferredLanguage`). The
request bodies you send — `auth.register()` and `users.update()` — stay in
snake_case, because that is what the API validates. Both shapes are correct;
they are simply not the same shape.

### Update your profile

```typescript
const updated = await vocea.users.update({
  full_name: "María García López", // request body: snake_case
  preferred_language: "en",
});

console.log(updated.fullName); // response: camelCase
```

### Check your balance

The balance is a USD amount with up to 8 decimal places, not a whole number of
tokens: a single short generation can cost fractions of a cent.

```typescript
const { balance } = await vocea.users.balance();
console.log(balance); // e.g. 10.42544375
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
console.log(voice.balanceEarnedTotal);
```

### Clone a voice

Upload one or more audio samples to create a new cloned voice. The voice starts with `status: "pending"` while it is being processed and transitions to `"active"` when ready.

`providerIds` is required: pick at least one provider to clone into. Each one
gives you the voice at that quality tier, and you can pass several to have the
same voice available in more than one. Get the ids from `vocea.providers.list()`.

```typescript
import { readFileSync } from "fs";

// Single sample, single provider
const voice = await vocea.voices.clone({
  name: "My Voice",
  audio_sample: new Blob([readFileSync("sample.mp3")], { type: "audio/mpeg" }),
  providerIds: ["provider-uuid"],                  // required, at least one
  language_code: "es",                             // optional, helps the model
  sample_text: "Hola, esta es una frase de muestra.", // optional
});

console.log(voice.id);
console.log(voice.status); // "pending" — poll until it becomes "active"
```

```typescript
// Multiple samples produce better quality; multiple providers give you the
// same voice in several tiers.
const voice = await vocea.voices.clone({
  name: "My Voice HD",
  audio_sample: [
    new Blob([readFileSync("sample1.mp3")], { type: "audio/mpeg" }),
    new Blob([readFileSync("sample2.mp3")], { type: "audio/mpeg" }),
    new Blob([readFileSync("sample3.mp3")], { type: "audio/mpeg" }),
  ],
  providerIds: ["provider-a", "provider-b"],
});
```

Omitting `providerIds` returns `400 PROVIDERS_REQUIRED`, and an unknown or
inactive id returns `400 PROVIDER_NOT_AVAILABLE`.

### Advanced generation parameters

Each quality tier accepts its own parameters. Sending one that does not belong
to the tier returns `400 INVALID_ADVANCED_PARAMS` naming the offending key —
previously unknown keys were dropped silently and the audio came back with
default settings.

| Tier                  | Parameter        | Range                    | Default |
|-----------------------|------------------|--------------------------|---------|
| `standard` (Inworld)  | `expressiveness` | 0–100                    | 50      |
| `premium` (Minimax)   | `pitch`          | −12 to 12, **integer**   | 0       |
|                       | `volume`         | 0–100                    | 50      |
|                       | `emotion`        | see the emotion table    | neutral |
| `studio` (ElevenLabs) | `stability`      | 0–100                    | 50      |
|                       | `clarity`        | 0–100                    | 75      |
|                       | `style`          | 0–100                    | 0       |

Everything is on a 0–100 scale and the API converts it to each provider's native
range. `pitch` is the one exception: it is a real semitone count, not a
percentage, so it runs from −12 to 12 and must be a whole number.

```typescript
const audio = await vocea.audios.generate({
  voice_id: "voice-uuid",
  tts_model_id: "model-uuid",
  text: "Hola, ¿cómo estás?",
  speed: 1.0,                                   // 0.5–1.5, every tier
  advanced_params: { stability: 40, clarity: 80 }, // studio voice
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

Submit your voice for review. Once approved, it will appear in the public voice library and you earn balance every time another user generates audio with it.

```typescript
await vocea.voices.requestPublic("voice-uuid");
```

### Get voice earnings

```typescript
const data = await vocea.voices.earnings("voice-uuid");

console.log(data.balanceEarnedTotal); // e.g. 1.205
console.log(data.timesUsed);

for (const entry of data.earnings) {
  console.log(entry.month, entry.balanceEarned); // e.g. "2024-03", 0.42
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
console.log(result.balanceConsumed);  // USD deducted from your balance
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

## Balance (`vocea.balance`)

Top up your USD balance and track its movements.

### List available packages

A package adds exactly its `priceUsd` to your balance — there is no separate
conversion rate.

```typescript
const packages = await vocea.balance.listPackages();

for (const pkg of packages) {
  if (pkg.isActive) {
    console.log(`${pkg.name}: adds $${pkg.priceUsd} to your balance`);
  }
}
```

### Create a checkout session

Initiates a payment flow and returns a URL to redirect the user to.

```typescript
const { checkoutUrl } = await vocea.balance.checkout(
  "package-uuid",
  "https://yourapp.com/balance/success", // optional redirect after payment
);

// Redirect the user
window.location.href = checkoutUrl;
```

### List transaction history

```typescript
// All transactions, newest first
const all = await vocea.balance.listTransactions({ page: 1, limit: 20 });

// Filter by type
const purchases    = await vocea.balance.listTransactions({ type: "purchase" });
const consumption  = await vocea.balance.listTransactions({ type: "consumption" });
const adjustments  = await vocea.balance.listTransactions({ type: "adjustment" });
const earned       = await vocea.balance.listTransactions({ type: "earned_public_voice" });
const welcome      = await vocea.balance.listTransactions({ type: "welcome_bonus" });

for (const tx of all.items) {
  console.log(`[${tx.type}] ${tx.amount > 0 ? "+" : ""}${tx.amount} USD — ${tx.description}`);
}
```

**Transaction types:**

All five values are exported as the `TransactionType` union, so a `switch` over
`tx.type` is exhaustive.

| Type                  | Description                                             |
| --------------------- | ------------------------------------------------------- |
| `purchase`            | Balance added via a successful payment                  |
| `consumption`         | Balance deducted by TTS or STT API usage                |
| `adjustment`          | Manual adjustment by the Vocea team                     |
| `earned_public_voice` | Balance earned when someone else uses your public voice |
| `welcome_bonus`       | Balance granted on sign-up                              |

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
        // Insufficient balance — prompt the user to top up
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

> **Breaking in 0.4.0:** `voices.clone()` now requires `providerIds`, with at
> least one provider. Omitting it used to make the API clone into *every*
> active provider, taking pool slots nobody asked for; it now returns
> `400 PROVIDERS_REQUIRED`, and an unknown or inactive id returns
> `400 PROVIDER_NOT_AVAILABLE`.
>
> `advanced_params` is validated too. Unknown keys and out-of-range values used
> to be dropped in silence — the audio came back with default settings while
> you were billed for it — and now return `400 INVALID_ADVANCED_PARAMS`. If you
> were sending a key that never did anything, this is where you find out.
>
> The documented range for `pitch` was wrong: it is −12 to 12 **integer**
> semitones, not −100 to 100. That value reaches the provider unscaled, so
> anything outside that range was already being rejected upstream.

> **Breaking in 0.3.0:** the "credits" concept is gone — the platform only
> tracks a USD balance. `vocea.credits` is now `vocea.balance`, routes moved
> from `/credits/*` to `/balance/*`, and the fields `creditsBalance`,
> `creditsEarned`, `creditsEarnedTotal` and `creditsConsumed` are now
> `balance`, `balanceEarned`, `balanceEarnedTotal` and `balanceConsumed`.
> All decimal fields are returned as numbers.
>
> The deprecated `vocea.users.credits()` alias and the `CreditsBalance` type
> alias were removed; use `vocea.users.balance()` and `UsdBalance`.
> The API's stable error code `INSUFFICIENT_CREDITS` is now
> `INSUFFICIENT_BALANCE`, with no alias: any code comparing
> `err.errorCode` against the old string stops matching.
> `Voice.langSet` stays deprecated: the API no longer sends it.
>
> Two long-standing type mismatches are also fixed in 0.3.0, and both are
> breaking for code that relied on the old (wrong) declarations:
>
> - `User` now describes what `/users/me` really returns: `fullName` and
>   `preferredLanguage` in camelCase, not `full_name` / `preferred_language`.
>   It also gained `role`, `isVerified`, `balance`, `createdAt` and
>   `updatedAt`, which the endpoint has always sent. The **request** body of
>   `users.update()` keeps its snake_case keys — it is a different shape, typed
>   as `UpdateUserRequest`. `LoginResponse.user` is now a full `User`, since
>   login returns the same sanitized profile.
> - `TtsModel` no longer promises `providerId` and `maxCharacters`: only
>   `GET /tts-models` sends them, `GET /tts-models/:id` does not. The listing
>   type is `TtsModelListItem`, returned by `models.list()`; `models.get()`
>   returns the narrower `TtsModel`.

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
  UpdateUserRequest,
  UsdBalance,
  ApiKeyStatus,
  ApiKeyCreated,

  // TTS models
  TtsModel,                 // GET /tts-models/:id
  TtsModelListItem,         // GET /tts-models — adds providerId + maxCharacters
  TtsLanguage,
  TtsConfig,

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

  // Balance
  BalancePackage,
  CheckoutResponse,
  Transaction,

  // Shared
  PaginatedResponse,
  PaginationParams,
  VoceaErrorBody,
} from "@vocea.app/sdk";
```

---

## Publishing (maintainers)

The npm token lives in `.env` (git-ignored), not in the repo's `.npmrc`:
pnpm deliberately ignores registry credentials that expand environment
variables from a project `.npmrc`, because that file is committed.
`scripts/publish.sh` injects it into a temporary `.npmrc` outside the repo.

```bash
cp .env.example .env   # then fill in NPM_AUTH_TOKEN
pnpm run release:dry   # packs without publishing
pnpm run release       # publishes
```

---

## License

MIT — [vocea.app](https://vocea.app)
