import type { HttpClient } from "../http.js";
import type { Audio, GenerateAudioRequest, PaginatedResponse, PaginationParams } from "../types.js";

export class AudiosResource {
  constructor(private http: HttpClient) {}

  generate(body: GenerateAudioRequest): Promise<Audio> {
    return this.http.request("POST", "/audios/generate", { json: body });
  }

  list(params?: PaginationParams): Promise<PaginatedResponse<Audio>> {
    return this.http.request("GET", "/audios", { query: params });
  }

  get(id: string): Promise<Audio> {
    return this.http.request("GET", `/audios/${id}`);
  }

  download(id: string): Promise<Response> {
    return this.http.stream("GET", `/audios/${id}/download`);
  }

  delete(id: string): Promise<void> {
    return this.http.request("DELETE", `/audios/${id}`);
  }

  /** Returns a public (unauthenticated) URL for playback */
  playUrl(id: string): string {
    return `${this.http.baseUrl}/audios/${id}/play.mp3`;
  }
}
