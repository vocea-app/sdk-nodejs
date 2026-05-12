import type { HttpClient } from "../http.js";
import type { LoginRequest, LoginResponse, RegisterRequest } from "../types.js";

export class AuthResource {
  constructor(private http: HttpClient) {}

  register(body: RegisterRequest): Promise<{ message: string }> {
    return this.http.request("POST", "/auth/register", { json: body });
  }

  login(body: LoginRequest): Promise<LoginResponse> {
    return this.http.request("POST", "/auth/login", { json: body });
  }

  verifyEmail(token: string): Promise<void> {
    return this.http.request("POST", "/auth/verify-email", { json: { token } });
  }

  resendVerification(email: string): Promise<void> {
    return this.http.request("POST", "/auth/resend-verification", { json: { email } });
  }

  forgotPassword(email: string): Promise<void> {
    return this.http.request("POST", "/auth/forgot-password", { json: { email } });
  }

  resetPassword(token: string, new_password: string): Promise<void> {
    return this.http.request("POST", "/auth/reset-password", { json: { token, new_password } });
  }

  logout(): Promise<void> {
    return this.http.request("POST", "/auth/logout");
  }
}
