import { describe, expect, it } from "vitest";
import { getMonthPeriodFromMonthYear, mapTransactionsToPdfRows } from "@/lib/reports/pdf";

describe("getMonthPeriodFromMonthYear", () => {
  it("builds start/end date and readable period label", () => {
    const result = getMonthPeriodFromMonthYear("2026-04-01");
    expect(result.startDate).toBe("2026-04-01");
    expect(result.endDate).toBe("2026-04-30");
    expect(result.periodLabel.toLowerCase()).toContain("april");
  });
});

describe("mapTransactionsToPdfRows", () => {
  it("maps transaction records into printable PDF rows", () => {
    const rows = mapTransactionsToPdfRows([
      {
        id: "tx-1",
        transaction_date: "2026-04-02",
        type: "expense",
        amount: 125000,
        note: "beli sepatu",
        categories: { name: "Belanja" }
      },
      {
        id: "tx-2",
        transaction_date: "2026-04-03",
        type: "income",
        amount: 2000000,
        note: null,
        categories: { name: "Gaji" }
      }
    ]);

    expect(rows).toHaveLength(2);
    expect(rows[0]?.typeLabel).toBe("Pengeluaran");
    expect(rows[0]?.categoryName).toBe("Belanja");
    expect(rows[0]?.amountLabel).toContain("125.000");
    expect(rows[1]?.typeLabel).toBe("Pemasukan");
    expect(rows[1]?.note).toBe("-");
  });
});
