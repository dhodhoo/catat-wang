import { extractAmountFromText } from "@/lib/parser/amount";
import { inferCategoryName, inferTransactionType } from "@/lib/parser/category";
import { resolveTransactionDate } from "@/lib/parser/date";
import { parseCommand } from "@/lib/parser/parse-command";
import { parseWithAi } from "@/lib/parser/ai-parser";
import type { ParsedIncomingText, ReviewReason } from "@/types/domain";

export async function parseIncomingText(
  rawText: string,
  receivedAt: Date,
  timezone: string
): Promise<ParsedIncomingText> {
  // Try AI first
  const aiResult = await parseWithAi(rawText, receivedAt, timezone);
  if (aiResult && aiResult.intent !== "unknown") {
    return aiResult;
  }

  // Fallback to regex
  const command = parseCommand(rawText, receivedAt, timezone);
  if (command) {
    return command;
  }

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
