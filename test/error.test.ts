import { describe, expect, it } from "vitest";
import { VoceaError } from "../src/error.js";

describe("VoceaError", () => {
  it("une un message de tipo array con comas", () => {
    const err = new VoceaError(400, { statusCode: 400, message: ["a", "b"] });
    expect(err.message).toBe("Vocea API error 400: a, b");
  });

  it("usa el message string cuando la API lo envía", () => {
    const err = new VoceaError(401, { statusCode: 401, message: "texto" });
    expect(err.message).toBe("Vocea API error 401: texto");
  });

  it("cae al errorCode cuando no hay message", () => {
    const err = new VoceaError(400, {
      statusCode: 400,
      errorCode: "UNSUPPORTED_AUDIO_FORMAT",
    });
    expect(err.message).toBe("Vocea API error 400: UNSUPPORTED_AUDIO_FORMAT");
  });

  it("expone errorCode como propiedad para no comparar mensajes", () => {
    const err = new VoceaError(400, {
      statusCode: 400,
      errorCode: "UNSUPPORTED_AUDIO_FORMAT",
    });
    expect(err.errorCode).toBe("UNSUPPORTED_AUDIO_FORMAT");
  });

  it("cae al texto por statusCode cuando el cuerpo viene vacío", () => {
    const err = new VoceaError(404, { statusCode: 404 });
    expect(err.message).toBe("Vocea API error 404: Recurso no encontrado");
  });

  it("cae a 'Error desconocido' con un status que no está en la tabla", () => {
    const err = new VoceaError(418, { statusCode: 418 });
    expect(err.message).toBe("Vocea API error 418: Error desconocido");
  });

  it("ignora un array de messages vacío y sigue bajando la cadena", () => {
    const err = new VoceaError(404, {
      statusCode: 404,
      message: [],
      errorCode: "VOICE_NOT_FOUND",
    });
    expect(err.message).toBe("Vocea API error 404: VOICE_NOT_FOUND");
  });

  it("es instanceof Error y se identifica por name", () => {
    const err = new VoceaError(500, { statusCode: 500 });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("VoceaError");
  });

  it("conserva el cuerpo original para inspección", () => {
    const body = { statusCode: 409, errorCode: "VOICE_ALREADY_PUBLIC" };
    expect(new VoceaError(409, body).body).toEqual(body);
  });
});
