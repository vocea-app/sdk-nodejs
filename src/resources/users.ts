import type { HttpClient } from "../http.js";
import type { ApiKeyCreated, ApiKeyStatus, UsdBalance, User } from "../types.js";

export class UsersResource {
  constructor(private http: HttpClient) {}

  me(): Promise<User> {
    return this.http.request("GET", "/users/me");
  }

  update(body: { full_name?: string; preferred_language?: string }): Promise<User> {
    return this.http.request("PATCH", "/users/me", { json: body });
  }

  /** Devuelve el saldo actual en USD. El campo `creditsBalance` contiene el valor decimal en dólares. */
  balance(): Promise<UsdBalance> {
    return this.http.request("GET", "/users/me/credits");
  }

  /** @deprecated Usa `balance()`. Se mantiene para no romper integraciones del 0.1.x. */
  credits(): Promise<UsdBalance> {
    return this.balance();
  }

  apiKeyStatus(): Promise<ApiKeyStatus> {
    return this.http.request("GET", "/users/me/api-key/status");
  }

  createApiKey(): Promise<ApiKeyCreated> {
    return this.http.request("POST", "/users/me/api-key");
  }

  deleteApiKey(): Promise<{ message: string }> {
    return this.http.request("DELETE", "/users/me/api-key");
  }

  deleteAccount(): Promise<void> {
    return this.http.request("DELETE", "/users/me");
  }
}
