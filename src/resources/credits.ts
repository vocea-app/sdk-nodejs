import type { HttpClient } from "../http.js";
import type { CheckoutResponse, CreditPackage, PaginatedResponse, PaginationParams } from "../types.js";

export interface Transaction {
  id: string;
  type: "purchase" | "consumption" | "adjustment";
  amount: number;
  description: string;
  createdAt: string;
}

export class CreditsResource {
  constructor(private http: HttpClient) {}

  listPackages(): Promise<CreditPackage[]> {
    return this.http.request("GET", "/credits/packages");
  }

  checkout(package_id: string, success_url?: string): Promise<CheckoutResponse> {
    const query = success_url ? { success_url } : undefined;
    return this.http.request("POST", "/credits/checkout", { json: { package_id }, query });
  }

  listTransactions(params?: PaginationParams & { type?: Transaction["type"] }): Promise<PaginatedResponse<Transaction>> {
    return this.http.request("GET", "/credits/transactions", { query: params });
  }
}
