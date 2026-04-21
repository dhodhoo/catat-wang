import { extractAmountFromText } from "@/lib/parser/amount";
import { inferCategoryName, inferTransactionType } from "@/lib/parser/category";
import { resolveTransactionDate } from "@/lib/parser/date";
import { parseCommand } from "@/lib/parser/parse-command";
import { parseWithAi } from "@/lib/parser/ai-parser";
import type { BatchParseResult, BatchParsedItem, ParsedIncomingText, ReviewReason } from "@/types/domain";

function parseTransactionManual(rawText: string, receivedAt: Date, timezone: string): ParsedIncomingText {
  const amount = extractAmountFromText(rawText);
  if (!amount) {
    return { intent: "unknown" };
  }

  const type = inferTransactionType(rawText);
  const date = resolveTransactionDate(rawText, receivedAt, timezone);
  const category = inferCategoryName(rawText, type);
  const reviewReasons: ReviewReason[] = [];

  if (!category.isConfident) {
    reviewReasons.push({
      code: "uncertain_category",
      message: "Kategori tidak yakin, default ke Lainnya."
    });
  }

  return {
    intent: "create",
    transaction: {
      type,
      amount,
      transactionDate: date,
      categoryName: category.categoryName,
      note: rawText.trim(),
      reviewStatus: reviewReasons.length > 0 ? "need_review" : "clear",
      reviewReasons
    }
  };
}

export async function parseIncomingText(
  rawText: string,
  receivedAt: Date,
  timezone: string
): Promise<ParsedIncomingText> {
  // Manual parser always handles command intents first.
  const commandResult = parseCommand(rawText, receivedAt, timezone);
  if (commandResult) {
    return commandResult;
  }

  // Then try manual transaction parsing.
  const manualResult = parseTransactionManual(rawText, receivedAt, timezone);
  if (manualResult.intent !== "unknown") {
    return manualResult;
  }

  // AI fallback runs only when manual parser cannot parse anything.
  const aiResult = await parseWithAi(rawText, receivedAt, timezone);
  if (aiResult && aiResult.intent !== "unknown") {
    return aiResult;
  }

  return { intent: "unknown" };
}

function splitBatchSegments(rawText: string) {
  return rawText
    .split(/[\n,]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function isCommandLikeSegment(segment: string, receivedAt: Date, timezone: string) {
  if (parseCommand(segment, receivedAt, timezone)) {
    return true;
  }
  return /^(link-\d{6,}|hapus\b|batal\b|ubah\b|ganti\b|kategori terakhir\b|tanggal terakhir\b)/i.test(segment.trim());
}

export async function parseIncomingTextBatch(
  rawText: string,
  receivedAt: Date,
  timezone: string
): Promise<BatchParseResult> {
  const segments = splitBatchSegments(rawText);

  if (segments.length === 0) {
    return { status: "ok", items: [] };
  }

  if (segments.length > 1) {
    const commandFlags = segments.map((segment) => isCommandLikeSegment(segment, receivedAt, timezone));
    const hasCommand = commandFlags.some(Boolean);
    const hasNonCommand = commandFlags.some((flag) => !flag);

    if (hasCommand && hasNonCommand) {
      const items: BatchParsedItem[] = segments.map((raw) => ({
        raw,
        parsed: { intent: "unknown" },
        status: "rejected",
        reason: "Pesan campuran command dan transaksi."
      }));
      return {
        status: "mixed_not_allowed",
        items,
        message: "Pisahkan command dan transaksi ke pesan terpisah."
      };
    }

    if (hasCommand && !hasNonCommand) {
      const items: BatchParsedItem[] = segments.map((raw) => ({
        raw,
        parsed: { intent: "unknown" },
        status: "rejected",
        reason: "Command multi-item tidak didukung."
      }));
      return {
        status: "mixed_not_allowed",
        items,
        message: "Kirim satu command saja per pesan."
      };
    }
  }

  const items: BatchParsedItem[] = [];
  for (const raw of segments) {
    const parsed = await parseIncomingText(raw, receivedAt, timezone);
    items.push({
      raw,
      parsed,
      status: parsed.intent === "unknown" ? "unknown" : "parsed"
    });
  }

  return { status: "ok", items };
}
