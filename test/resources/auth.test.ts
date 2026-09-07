import { describe, expect, it } from "vitest";
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
    expect(calls[1].url).toBe("https://api.test/v1/auth/resend-verification");
    expect(JSON.parse(calls[1].body as string)).toEqual({ email: "m@test.com" });
  });
});
