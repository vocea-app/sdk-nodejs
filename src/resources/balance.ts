import type { HttpClient } from "../http.js";
import type { BalancePackage, CheckoutResponse, PaginatedResponse, PaginationParams } from "../types.js";

export interface Transaction {
  id: string;
  type: "purchase" | "consumption" | "adjustment";
  /** Importe en USD. Positivo cuando suma saldo, negativo cuando lo descuenta. */
  amount: number;
  description: string;
  createdAt: string;
}

export class BalanceResource {
  constructor(private http: HttpClient) {}

  /** Lista los paquetes de recarga disponibles. */
  listPackages(): Promise<BalancePackage[]> {
    return this.http.request("GET", "/balance/packages");
  }

  /** Inicia el checkout de un paquete. Devuelve la URL de pago. */
  checkout(package_id: string, success_url?: string): Promise<CheckoutResponse> {
    const query = success_url ? { success_url } : undefined;
    return this.http.request("POST", "/balance/checkout", { json: { package_id }, query });
  }

  /** Lista el historial de transacciones del usuario autenticado. */
  listTransactions(params?: PaginationParams & { type?: Transaction["type"] }): Promise<PaginatedResponse<Transaction>> {
    return this.http.request("GET", "/balance/transactions", { query: params });
  }
}
