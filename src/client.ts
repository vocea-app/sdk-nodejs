import { HttpClient } from "./http.js";
import { AuthResource } from "./resources/auth.js";
import { AudiosResource } from "./resources/audios.js";
import { CreditsResource } from "./resources/credits.js";
import { SttResource } from "./resources/stt.js";
import { UsersResource } from "./resources/users.js";
import { VoicesResource } from "./resources/voices.js";

export interface VoceaClientOptions {
  apiKey: string;
  baseUrl?: string;
}

export class VoceaClient {
  readonly auth: AuthResource;
  readonly users: UsersResource;
  readonly voices: VoicesResource;
  readonly audios: AudiosResource;
  readonly stt: SttResource;
  readonly credits: CreditsResource;

  constructor(options: VoceaClientOptions) {
    const http = new HttpClient({
      apiKey: options.apiKey,
      baseUrl: `${options.baseUrl ?? "https://vocea.app/api/v1"}`,
    });

    this.auth = new AuthResource(http);
    this.users = new UsersResource(http);
    this.voices = new VoicesResource(http);
    this.audios = new AudiosResource(http);
    this.stt = new SttResource(http);
    this.credits = new CreditsResource(http);
  }
}
