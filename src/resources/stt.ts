import type { HttpClient } from "../http.js";
import type { PaginatedResponse, PaginationParams, TranscribeResponse } from "../types.js";

export interface Transcription {
  id: string;
  transcript: string;
  characterCount: number;
  durationMs: number;
  createdAt: string;
}

export class SttResource {
  constructor(private http: HttpClient) {}

  async transcribe(audio: Blob | Buffer | File, language = "es-ES"): Promise<TranscribeResponse> {
    const form = new FormData();
    form.append("audio", audio as Blob);
    return this.http.request("POST", "/stt/transcribe", {
      form,
      query: { language },
    });
  }

  listTranscriptions(params?: PaginationParams): Promise<PaginatedResponse<Transcription>> {
    return this.http.request("GET", "/stt/transcriptions", { query: params });
  }

  deleteTranscription(id: string): Promise<void> {
    return this.http.request("DELETE", `/stt/transcriptions/${id}`);
  }
}
