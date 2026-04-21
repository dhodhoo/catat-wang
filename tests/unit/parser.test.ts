import { beforeEach, describe, expect, it, vi } from "vitest";
import { extractAmountFromText } from "@/lib/parser/amount";
import { parseWithAi } from "@/lib/parser/ai-parser";
import { parseIncomingText } from "@/lib/parser/parse-text-transaction";

vi.mock("@/lib/parser/ai-parser", () => ({
  parseWithAi: vi.fn()
}));

const parseWithAiMock = vi.mocked(parseWithAi);

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
  beforeEach(() => {
    parseWithAiMock.mockReset();
  });

  it("parses expense transaction with manual parser and does not call AI", async () => {
    const parsed = await parseIncomingText(
      "kemarin parkir 10rb",
      new Date("2026-04-02T10:00:00Z"),
      "Asia/Jakarta"
    );

    expect(parsed.intent).toBe("create");
    if (parsed.intent === "create") {
      expect(parsed.transaction.type).toBe("expense");
      expect(parsed.transaction.amount).toBe(10000);
      expect(parsed.transaction.categoryName).toBe("Transportasi");
    }
    expect(parseWithAiMock).not.toHaveBeenCalled();
  });

  it("parses income transaction with manual parser and does not call AI", async () => {
    const parsed = await parseIncomingText("gaji masuk 5jt", new Date("2026-04-02T10:00:00Z"), "Asia/Jakarta");

    expect(parsed.intent).toBe("create");
    if (parsed.intent === "create") {
      expect(parsed.transaction.type).toBe("income");
      expect(parsed.transaction.amount).toBe(5000000);
      expect(parsed.transaction.categoryName).toBe("Gaji");
    }
    expect(parseWithAiMock).not.toHaveBeenCalled();
  });

  it("parses delete command with manual parser and does not call AI", async () => {
    const parsed = await parseIncomingText("hapus transaksi terakhir", new Date("2026-04-02T10:00:00Z"), "Asia/Jakarta");

    expect(parsed.intent).toBe("delete_last");
    expect(parseWithAiMock).not.toHaveBeenCalled();
  });

  it("calls AI once when manual parser returns unknown and uses AI result", async () => {
    parseWithAiMock.mockResolvedValueOnce({
      intent: "create",
      transaction: {
        type: "expense",
        amount: 42000,
        transactionDate: "2026-04-02",
        categoryName: "Belanja",
        note: "transaksi dari ai",
        reviewStatus: "clear",
        reviewReasons: []
      }
    });

    const parsed = await parseIncomingText("tolong catetin pengeluaran tadi", new Date("2026-04-02T10:00:00Z"), "Asia/Jakarta");

    expect(parseWithAiMock).toHaveBeenCalledTimes(1);
    expect(parsed.intent).toBe("create");
    if (parsed.intent === "create") {
      expect(parsed.transaction.amount).toBe(42000);
      expect(parsed.transaction.categoryName).toBe("Belanja");
    }
  });

  it("returns unknown when manual parser fails and AI returns unknown", async () => {
    parseWithAiMock.mockResolvedValueOnce({ intent: "unknown" });

    const parsed = await parseIncomingText("tolong dibantu catat ya", new Date("2026-04-02T10:00:00Z"), "Asia/Jakarta");

    expect(parseWithAiMock).toHaveBeenCalledTimes(1);
    expect(parsed.intent).toBe("unknown");
  });

  it("returns unknown when manual parser fails and AI returns null", async () => {
    parseWithAiMock.mockResolvedValueOnce(null);

    const parsed = await parseIncomingText("masih bingung input apa", new Date("2026-04-02T10:00:00Z"), "Asia/Jakarta");

    expect(parseWithAiMock).toHaveBeenCalledTimes(1);
    expect(parsed.intent).toBe("unknown");
  });
});
