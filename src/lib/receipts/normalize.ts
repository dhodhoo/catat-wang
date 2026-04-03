import type { ReviewReason } from "@/types/domain";

export interface OcrResult {
  totalAmount?: number;
  merchantName?: string | null;
  transactionDate?: string | null;
  ocrText: string;
  confidence: number;
  reviewReasons: ReviewReason[];
  rawPayload?: unknown;
}

function parsePositiveNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }

  if (typeof value === "string") {
    const digits = value.replace(/[^\d]/g, "");
    if (!digits) {
      return undefined;
    }

    const parsed = Number(digits);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
}

function extractAmountFromOcrText(text: string) {
  const normalized = text.replace(/\u00a0/g, " ");
  const patterns = [
    /(?:grand\s*total|total\s*bayar|jumlah\s*bayar|total)\s*[:\-]?\s*(?:rp\.?\s*)?([\d\.,]+)/i,
    /rp\s*([\d\.,]{3,})/i
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (!match?.[1]) {
      continue;
    }

    const amount = parsePositiveNumber(match[1]);
    if (amount) {
      return amount;
    }
  }

  return undefined;
}

function extractDateFromOcrText(text: string) {
  const normalized = text.replace(/\u00a0/g, " ");
  const match = normalized.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (!match) {
    return null;
  }

  const day = match[1].padStart(2, "0");
  const month = match[2].padStart(2, "0");
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  return `${year}-${month}-${day}`;
}

export function normalizeOcrResult(raw: any): OcrResult {
  const ocrText = raw?.ocrText ?? "";
  const totalAmount = parsePositiveNumber(raw?.totalAmount) ?? extractAmountFromOcrText(ocrText);
  const confidence = typeof raw?.confidence === "number" ? raw.confidence : 0;
  const reviewReasons = Array.isArray(raw?.reviewReasons) ? raw.reviewReasons : [];

  return {
    totalAmount,
    merchantName: raw?.merchantName ?? null,
    transactionDate: raw?.transactionDate ?? extractDateFromOcrText(ocrText),
    ocrText,
    confidence,
    reviewReasons,
    rawPayload: raw
  };
}
