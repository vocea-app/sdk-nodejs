import type { VoceaErrorBody } from "./types.js";

/** Mensajes por defecto cuando la API no envía ninguna pista legible. */
const STATUS_TEXT: Record<number, string> = {
  400: "Petición inválida",
  401: "API key ausente, inválida o revocada",
  402: "Saldo insuficiente",
  403: "Sin permisos sobre este recurso",
  404: "Recurso no encontrado",
  409: "Conflicto con el estado actual del recurso",
  413: "Contenido demasiado grande",
  422: "El recurso no está en un estado utilizable",
  429: "Demasiadas peticiones",
  500: "Error interno de la API",
};

/**
 * La API sanitiza sus errores y no devuelve `message`: entrega
 * `{ statusCode, errorCode? }`. Leer solo `message` producía mensajes como
 * "Vocea API error 404: undefined" y descartaba el errorCode, que es
 * justamente la parte accionable.
 */
function describe(statusCode: number, body: VoceaErrorBody): string {
  if (Array.isArray(body?.message) && body.message.length)
    return body.message.join(", ");
  if (typeof body?.message === "string" && body.message) return body.message;
  if (body?.errorCode) return body.errorCode;
  return STATUS_TEXT[statusCode] ?? "Error desconocido";
}

export class VoceaError extends Error {
  /**
   * Código estable de la API (`VOICE_NOT_FOUND`, `VOICE_NOT_ACTIVE`,
   * `UNSUPPORTED_AUDIO_FORMAT`…) cuando lo envía. Preferible a comparar
   * mensajes para tomar decisiones en el código que consume el SDK.
   */
  readonly errorCode?: string;

  constructor(
    public readonly statusCode: number,
    public readonly body: VoceaErrorBody,
  ) {
    super(`Vocea API error ${statusCode}: ${describe(statusCode, body)}`);
    this.name = "VoceaError";
    this.errorCode = body?.errorCode;
  }
}
