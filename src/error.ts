import type { VoceaErrorBody } from "./types.js";

export class VoceaError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly body: VoceaErrorBody,
  ) {
    const msg = Array.isArray(body.message)
      ? body.message.join(", ")
      : body.message;
    super(`Vocea API error ${statusCode}: ${msg}`);
    this.name = "VoceaError";
  }
}
