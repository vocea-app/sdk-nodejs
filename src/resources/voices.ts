import type { HttpClient } from "../http.js";
import type {
  CloneVoiceRequest,
  PaginatedResponse,
  PaginationParams,
  UpdateVoiceMetadataRequest,
  Voice,
} from "../types.js";

export interface ListPublicVoicesParams extends PaginationParams {
  countryId?: string;
  regionId?: string;
  ageRange?: "young" | "adult" | "senior";
}

export interface VoiceEarnings {
  earnings: { month: string; creditsEarned: number }[];
  creditsEarnedTotal: number;
  timesUsed: number;
}

export class VoicesResource {
  constructor(private http: HttpClient) {}

  list(params?: PaginationParams): Promise<PaginatedResponse<Voice>> {
    return this.http.request("GET", "/voices", { query: params });
  }

  listPublic(params?: ListPublicVoicesParams): Promise<PaginatedResponse<Voice>> {
    return this.http.request("GET", "/voices/public", { query: params });
  }

  get(id: string): Promise<Voice> {
    return this.http.request("GET", `/voices/${id}`);
  }

  async clone(req: CloneVoiceRequest): Promise<Voice> {
    const form = new FormData();
    form.append("name", req.name);
    const samples = Array.isArray(req.audio_sample) ? req.audio_sample : [req.audio_sample];
    for (const s of samples) form.append("audio_sample", s as Blob);
    if (req.sample_text) form.append("sample_text", req.sample_text);
    if (req.language_code) form.append("language_code", req.language_code);
    return this.http.request("POST", "/voices/clone", { form });
  }

  update(id: string, name: string): Promise<Voice> {
    return this.http.request("PATCH", `/voices/${id}`, { json: { name } });
  }

  updateMetadata(id: string, body: UpdateVoiceMetadataRequest): Promise<Voice> {
    return this.http.request("PATCH", `/voices/${id}/metadata`, { json: body });
  }

  delete(id: string): Promise<void> {
    return this.http.request("DELETE", `/voices/${id}`);
  }

  favorite(id: string): Promise<{ isFavorited: boolean }> {
    return this.http.request("POST", `/voices/${id}/favorite`);
  }

  requestPublic(id: string): Promise<void> {
    return this.http.request("POST", `/voices/${id}/request-public`);
  }

  earnings(id: string): Promise<VoiceEarnings> {
    return this.http.request("GET", `/voices/${id}/earnings`);
  }

  sample(id: string): Promise<Response> {
    return this.http.stream("GET", `/voices/${id}/sample`);
  }
}
