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

export function normalizeOcrResult(raw: any): OcrResult {
  const totalAmount =
    typeof raw?.totalAmount === "number" && raw.totalAmount > 0 ? raw.totalAmount : undefined;
  const confidence = typeof raw?.confidence === "number" ? raw.confidence : 0;
  const reviewReasons = Array.isArray(raw?.reviewReasons) ? raw.reviewReasons : [];

  return {
    totalAmount,
    merchantName: raw?.merchantName ?? null,
    transactionDate: raw?.transactionDate ?? null,
    ocrText: raw?.ocrText ?? "",
    confidence,
    reviewReasons,
    rawPayload: raw
  };
}
