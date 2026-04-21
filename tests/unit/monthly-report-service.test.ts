import { describe, expect, it } from "vitest";
import { buildMonthlyReportSummary, getMonthDateRange } from "@/lib/reports/service";

describe("getMonthDateRange", () => {
  it("returns correct month boundaries", () => {
    expect(getMonthDateRange(2026, 2)).toEqual({
      startDate: "2026-02-01",
      endDate: "2026-02-28"
    });
  });
});

describe("buildMonthlyReportSummary", () => {
  it("calculates totals, net cashflow, and top categories", () => {
    const summary = buildMonthlyReportSummary([
      { amount: 2_000_000, type: "income", categories: { name: "Gaji", type: "income" } },
      { amount: 100_000, type: "expense", categories: { name: "Makan & Minum", type: "expense" } },
      { amount: 250_000, type: "expense", categories: { name: "Belanja", type: "expense" } },
      { amount: 50_000, type: "expense", categories: { name: "Makan & Minum", type: "expense" } }
    ]);

    expect(summary.totalIncome).toBe(2_000_000);
    expect(summary.totalExpense).toBe(400_000);
    expect(summary.netCashflow).toBe(1_600_000);
    expect(summary.transactionCount).toBe(4);
    expect(summary.topCategories[0]?.name).toBe("Belanja");
    expect(summary.topCategories[0]?.amount).toBe(250_000);
    expect(summary.topCategories[1]?.name).toBe("Makan & Minum");
    expect(summary.topCategories[1]?.amount).toBe(150_000);
  });

  it("keeps percentages safe when expense is zero", () => {
    const summary = buildMonthlyReportSummary([
      { amount: 2_500_000, type: "income", categories: { name: "Gaji", type: "income" } }
    ]);

    expect(summary.totalExpense).toBe(0);
    expect(summary.topCategories).toEqual([]);
  });
});
