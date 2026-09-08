import { describe, expect, it } from "vitest";
import type { TransactionType } from "../../src/index.js";
import { createClient, mockFetch } from "../helpers.js";

// Los cinco valores de `TransactionType` en el backend
// (backend/src/database/entities/balance-transaction.entity.ts). El SDK
// declaraba solo tres, así que un `switch` se creía exhaustivo sin serlo.
const TIPOS = [
  "purchase",
  "consumption",
  "adjustment",
  "earned_public_voice",
  "welcome_bonus",
] as const;

type Mismo<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

// Centinela de `tsc --noEmit`: deja de compilar si el union del SDK se queda
// corto o se pasa respecto a esta lista.
export const unionCompleta: Mismo<TransactionType, (typeof TIPOS)[number]> = true;

describe("BalanceResource", () => {
  it("listPackages hace GET a /balance/packages", async () => {
    const { calls } = mockFetch({ json: [] });
    await createClient().balance.listPackages();
    expect(calls[0].url).toBe("https://api.test/v1/balance/packages");
  });

  it("checkout manda package_id en el cuerpo y success_url en la query", async () => {
    const { calls } = mockFetch({ json: { checkoutUrl: "https://pago" } });
    await createClient().balance.checkout("pkg_1", "https://vuelta");
    expect(calls[0].url).toBe(
      "https://api.test/v1/balance/checkout?success_url=https%3A%2F%2Fvuelta",
    );
    expect(JSON.parse(calls[0].body as string)).toEqual({ package_id: "pkg_1" });
  });

  it("checkout sin success_url no añade query", async () => {
    const { calls } = mockFetch({ json: { checkoutUrl: "https://pago" } });
    await createClient().balance.checkout("pkg_1");
    expect(calls[0].url).toBe("https://api.test/v1/balance/checkout");
  });

  it.each(TIPOS)("listTransactions acepta el tipo %s", async (tipo) => {
    const { calls } = mockFetch({ json: { items: [], total: 0, page: 1, limit: 20 } });
    await createClient().balance.listTransactions({ type: tipo });
    expect(calls[0].url).toBe(`https://api.test/v1/balance/transactions?type=${tipo}`);
  });

  it("listTransactions pasa paginación y tipo como query", async () => {
    const { calls } = mockFetch({ json: { items: [], total: 0, page: 1, limit: 20 } });
    await createClient().balance.listTransactions({ page: 2, limit: 50, type: "purchase" });
    expect(calls[0].url).toBe(
      "https://api.test/v1/balance/transactions?page=2&limit=50&type=purchase",
    );
  });
});
