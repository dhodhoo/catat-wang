import { createInsforgeAdminClient, createInsforgeServerClient } from "@/lib/insforge/server";
import { normalizeOcrResult } from "@/lib/receipts/normalize";

export async function invokeReceiptOcr(
  accessToken: string,
  payload: {
    userId: string;
    messageLogId: string;
    mediaUrl: string;
    storageKey: string;
    imageDataUrl?: string;
  }
) {
  const client = accessToken ? createInsforgeServerClient(accessToken) : createInsforgeAdminClient();
  const { data, error } = await client.functions.invoke("receipt-ocr", {
    body: payload
  });

  if (error) {
    throw new Error(error.message);
  }

  return normalizeOcrResult(data);
}
