import { describe, expect, it } from "vitest";
import { createClient, mockFetch } from "../helpers.js";

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

  it("listTransactions pasa paginación y tipo como query", async () => {
    const { calls } = mockFetch({ json: { items: [], total: 0, page: 1, limit: 20 } });
    await createClient().balance.listTransactions({ page: 2, limit: 50, type: "purchase" });
    expect(calls[0].url).toBe(
      "https://api.test/v1/balance/transactions?page=2&limit=50&type=purchase",
    );
  });
});
