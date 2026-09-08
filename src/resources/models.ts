import type { HttpClient } from "../http.js";
import type { TtsConfig, TtsLanguage, TtsModel, TtsModelListItem } from "../types.js";

export class ModelsResource {
  constructor(private http: HttpClient) {}

  /**
   * Lista todos los modelos TTS activos. Cada ítem trae `providerId` y
   * `maxCharacters`, que el detalle (`get`) no emite.
   */
  list(): Promise<TtsModelListItem[]> {
    return this.http.request("GET", "/tts-models");
  }

  /**
   * Obtiene un modelo TTS por ID.
   *
   * El backend sirve este endpoint con un `select` reducido: la respuesta NO
   * incluye `providerId` ni `maxCharacters`. Si necesitas esos campos, léelos
   * del ítem correspondiente de `list()`.
   */
  get(id: string): Promise<TtsModel> {
    return this.http.request("GET", `/tts-models/${id}`);
  }

  /** Lista todos los idiomas disponibles (conjunto completo: Minimax + ElevenLabs). */
  languages(): Promise<TtsLanguage[]> {
    return this.http.request("GET", "/tts-models/languages");
  }

  /** Lista idiomas del conjunto reducido (Inworld / standard tier). */
  liteLanguages(): Promise<TtsLanguage[]> {
    return this.http.request("GET", "/tts-models/languages/lite");
  }

  /** Indica qué conjuntos de idiomas están habilitados en esta instancia. */
  config(): Promise<TtsConfig> {
    return this.http.request("GET", "/tts-models/config");
  }
}
