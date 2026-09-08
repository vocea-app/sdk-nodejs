import type { HttpClient } from "../http.js";
import type {
  ApiKeyCreated,
  ApiKeyStatus,
  UpdateUserRequest,
  UsdBalance,
  User,
} from "../types.js";

export class UsersResource {
  constructor(private http: HttpClient) {}

  me(): Promise<User> {
    return this.http.request("GET", "/users/me");
  }

  /**
   * Actualiza el perfil. El cuerpo va en snake_case (`full_name`,
   * `preferred_language`) y la respuesta vuelve en camelCase, como `me()`.
   */
  update(body: UpdateUserRequest): Promise<User> {
    return this.http.request("PATCH", "/users/me", { json: body });
  }

  /** Devuelve el saldo actual. El campo `balance` es el valor decimal en dólares. */
  balance(): Promise<UsdBalance> {
    return this.http.request("GET", "/users/me/balance");
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
