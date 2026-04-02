import { describe, expect, it } from "vitest";
import { extractAmountFromText } from "@/lib/parser/amount";
import { parseIncomingText } from "@/lib/parser/parse-text-transaction";

describe("extractAmountFromText", () => {
  it("parses rb and jt shorthands", () => {
    expect(extractAmountFromText("jajan 25rb")).toBe(25000);
    expect(extractAmountFromText("gaji 5jt")).toBe(5000000);
  });

  it("parses slang amounts", () => {
    expect(extractAmountFromText("parkir ceban")).toBe(10000);
    expect(extractAmountFromText("uang gocap")).toBe(50000);
  });
});

describe("parseIncomingText", () => {
  it("parses expense transaction", () => {
    const parsed = parseIncomingText("kemarin parkir 10rb", new Date("2026-04-02T10:00:00Z"), "Asia/Jakarta");
    expect(parsed.intent).toBe("create");
    if (parsed.intent === "create") {
      expect(parsed.transaction.type).toBe("expense");
      expect(parsed.transaction.amount).toBe(10000);
      expect(parsed.transaction.categoryName).toBe("Transportasi");
    }
  });

  it("parses income transaction", () => {
    const parsed = parseIncomingText("gaji masuk 5jt", new Date("2026-04-02T10:00:00Z"), "Asia/Jakarta");
    expect(parsed.intent).toBe("create");
    if (parsed.intent === "create") {
      expect(parsed.transaction.type).toBe("income");
      expect(parsed.transaction.amount).toBe(5000000);
      expect(parsed.transaction.categoryName).toBe("Gaji");
    }
  });

  it("parses delete command", () => {
    const parsed = parseIncomingText("hapus transaksi terakhir", new Date("2026-04-02T10:00:00Z"), "Asia/Jakarta");
    expect(parsed.intent).toBe("delete_last");
  });
});
