import { describe, expect, it } from "vitest";
import { VoceaError } from "../../src/index.js";
import { createClient, mockFetch } from "../helpers.js";

describe("AuthResource", () => {
  it("register hace POST a /auth/register con el cuerpo entero", async () => {
    const { calls } = mockFetch({ json: { message: "ok" } });
    const body = {
      full_name: "María García",
      email: "m@test.com",
      password: "secreto",
      birth_year: 1990,
    };
    await createClient().auth.register(body);
    expect(calls[0].method).toBe("POST");
    expect(calls[0].url).toBe("https://api.test/v1/auth/register");
    expect(JSON.parse(calls[0].body as string)).toEqual(body);
  });

  it("register sin accept_terms envía el cuerpo de siempre, sin accept_terms", async () => {
    const { calls } = mockFetch({ json: { message: "ok" } });
    await createClient().auth.register({
      full_name: "María García",
      email: "m@test.com",
      password: "secreto",
      birth_year: 1990,
      referral_code: "AMIGO",
    });
    const enviado = JSON.parse(calls[0].body as string);
    expect(enviado).toEqual({
      full_name: "María García",
      email: "m@test.com",
      password: "secreto",
      birth_year: 1990,
      referral_code: "AMIGO",
    });
    expect("accept_terms" in enviado).toBe(false);
  });

  it("register con accept_terms: true envía accept_terms: true", async () => {
    const { calls } = mockFetch({ json: { message: "ok" } });
    await createClient().auth.register({
      full_name: "María García",
      email: "m@test.com",
      password: "secreto",
      birth_year: 1990,
      accept_terms: true,
    });
    const enviado = JSON.parse(calls[0].body as string);
    expect(enviado).toEqual({
      full_name: "María García",
      email: "m@test.com",
      password: "secreto",
      birth_year: 1990,
      accept_terms: true,
    });
  });

  it("register con accept_terms: false no envía el campo: nunca se acepta por omisión", async () => {
    const { calls } = mockFetch({ json: { message: "ok" } });
    await createClient().auth.register({
      full_name: "María García",
      email: "m@test.com",
      password: "secreto",
      birth_year: 1990,
      accept_terms: false,
    });
    const enviado = JSON.parse(calls[0].body as string);
    expect("accept_terms" in enviado).toBe(false);
  });

  it.each([400, 422])(
    "register sin aceptar los términos: el %i del servidor llega como VoceaError con su mensaje",
    async (status) => {
      const mensaje = "Debes aceptar los Términos de Servicio y la Política de Privacidad";
      mockFetch({
        status,
        json: { statusCode: status, message: [mensaje], error: "Bad Request" },
      });
      const err = await createClient()
        .auth.register({
          full_name: "María García",
          email: "m@test.com",
          password: "secreto",
          birth_year: 1990,
        })
        .catch((e: unknown) => e);
      expect(err).toBeInstanceOf(VoceaError);
      expect((err as VoceaError).statusCode).toBe(status);
      expect((err as VoceaError).message).toContain(mensaje);
    },
  );

  it("login devuelve el token de acceso", async () => {
    mockFetch({ json: { access_token: "jwt", user: { id: "1", email: "m@test.com" } } });
    const res = await createClient().auth.login({ email: "m@test.com", password: "x" });
    expect(res.access_token).toBe("jwt");
  });

  it("verifyEmail envuelve el token en un objeto", async () => {
    const { calls } = mockFetch({ status: 204 });
    await createClient().auth.verifyEmail("tok");
    expect(calls[0].url).toBe("https://api.test/v1/auth/verify-email");
    expect(JSON.parse(calls[0].body as string)).toEqual({ token: "tok" });
  });

  it("resetPassword manda token y new_password", async () => {
    const { calls } = mockFetch({ status: 204 });
    await createClient().auth.resetPassword("tok", "nueva");
    expect(JSON.parse(calls[0].body as string)).toEqual({
      token: "tok",
      new_password: "nueva",
    });
  });

  it("logout hace POST sin cuerpo", async () => {
    const { calls } = mockFetch({ status: 204 });
    await createClient().auth.logout();
    expect(calls[0].method).toBe("POST");
    expect(calls[0].body).toBeUndefined();
  });

  it("forgotPassword y resendVerification mandan solo el email", async () => {
    const { calls } = mockFetch({ status: 204 });
    const auth = createClient().auth;
    await auth.forgotPassword("m@test.com");
    await auth.resendVerification("m@test.com");
    expect(calls[0].url).toBe("https://api.test/v1/auth/forgot-password");
    expect(JSON.parse(calls[0].body as string)).toEqual({ email: "m@test.com" });
    expect(calls[1].url).toBe("https://api.test/v1/auth/resend-verification");
    expect(JSON.parse(calls[1].body as string)).toEqual({ email: "m@test.com" });
  });
});
