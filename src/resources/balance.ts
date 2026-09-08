import type { HttpClient } from "../http.js";
import type { BalancePackage, CheckoutResponse, PaginatedResponse, PaginationParams } from "../types.js";

/**
 * Los cinco movimientos que emite la API (`TransactionType` en
 * `balance-transaction.entity.ts`). Son datos que viajan por el cable y viven
 * en la base de datos: no se renombran.
 *
 * - `purchase`: saldo comprado con un paquete.
 * - `consumption`: saldo gastado generando o transcribiendo audio.
 * - `adjustment`: corrección manual del equipo de Vocea.
 * - `earned_public_voice`: saldo ganado cuando otro usuario usa tu voz pública.
 * - `welcome_bonus`: saldo regalado al registrarse.
 */
export type TransactionType =
  | "purchase"
  | "consumption"
  | "adjustment"
  | "earned_public_voice"
  | "welcome_bonus";

export interface Transaction {
  id: string;
  type: TransactionType;
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
  listTransactions(params?: PaginationParams & { type?: TransactionType }): Promise<PaginatedResponse<Transaction>> {
    return this.http.request("GET", "/balance/transactions", { query: params });
  }
}
