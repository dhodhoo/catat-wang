import { extractAmountFromText } from "@/lib/parser/amount";
import { resolveTransactionDate } from "@/lib/parser/date";
import type { ParsedIncomingText } from "@/types/domain";

export function parseCommand(rawText: string, receivedAt: Date, timezone: string): ParsedIncomingText | null {
  const lower = rawText.trim().toLowerCase();

  if (/^link-\d{6,}$/i.test(lower)) {
    return {
      intent: "link_account",
      code: rawText.trim().toUpperCase()
    };
  }

  if (/^hapus(?:\b|$)/i.test(lower)) {
    return { intent: "delete_last" };
  }

  if (/^(ubah|ganti)(?:\b|$)/i.test(lower)) {
    const amount = extractAmountFromText(lower);
    return {
      intent: "update_last",
      patch: {
        ...(amount ? { amount } : {}),
        ...(lower.includes("kemarin")
          ? { transactionDate: resolveTransactionDate(lower, receivedAt, timezone) }
          : {})
      }
    };
  }

  const categoryMatch = lower.match(/kategori terakhir (jadi )?(.+)/i);
  if (categoryMatch?.[2]) {
    return {
      intent: "update_last",
      patch: {
        categoryName: categoryMatch[2].trim()
      }
    };
  }

  const dateMatch = lower.match(/tanggal terakhir (jadi )?(.+)/i);
  if (dateMatch?.[2]) {
    return {
      intent: "update_last",
      patch: {
        transactionDate: resolveTransactionDate(dateMatch[2], receivedAt, timezone)
      }
    };
  }

  return null;
}
