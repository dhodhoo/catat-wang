import { createClient } from "npm:@insforge/sdk";

interface ReceiptOcrPayload {
  userId: string;
  messageLogId: string;
  mediaUrl: string;
  storageKey: string;
  imageDataUrl?: string;
}

const client = createClient({
  baseUrl: Deno.env.get("INSFORGE_BASE_URL"),
  anonKey: Deno.env.get("API_KEY") ?? Deno.env.get("ANON_KEY"),
  isServerMode: true
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function looksLikeReceiptPayload(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && ["totalAmount", "merchantName", "transactionDate", "ocrText", "confidence"].some((key) => key in value);
}

function collectTextParts(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectTextParts(item));
  }

  if (!isRecord(value)) {
    return [];
  }

  const priorityKeys = ["text", "value", "output_text", "content", "arguments", "json"];
  const parts: string[] = [];

  for (const key of priorityKeys) {
    if (key in value) {
      parts.push(...collectTextParts(value[key]));
    }
  }

  for (const [key, nested] of Object.entries(value)) {
    if (!priorityKeys.includes(key)) {
      parts.push(...collectTextParts(nested));
    }
  }

  return parts;
}

function parseJsonCandidate(text: string) {
  const normalized = text.trim();
  if (!normalized) {
    return null;
  }

  const fencedMatch = normalized.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const directCandidate = fencedMatch?.[1]?.trim() ?? normalized;

  try {
    return JSON.parse(directCandidate);
  } catch {
    // Ignore and continue with looser extraction below.
  }

  const objectMatch = directCandidate.match(/\{[\s\S]*\}/);
  if (!objectMatch) {
    return null;
  }

  try {
    return JSON.parse(objectMatch[0]);
  } catch {
    return null;
  }
}

function extractJson(content: unknown) {
  if (looksLikeReceiptPayload(content)) {
    return content;
  }

  if (isRecord(content) && looksLikeReceiptPayload(content.json)) {
    return content.json;
  }

  const textParts = collectTextParts(content);
  for (const part of textParts) {
    const parsed = parseJsonCandidate(part);
    if (looksLikeReceiptPayload(parsed)) {
      return parsed;
    }
  }

  const rawPreview =
    typeof content === "string"
      ? content.slice(0, 800)
      : JSON.stringify(content, null, 2).slice(0, 800);

  console.error("receipt-ocr-unparseable-content", rawPreview);
  throw new Error("Model OCR tidak mengembalikan JSON yang bisa diparse.");
}

export default async function handler(request: Request) {
  const payload = (await request.json()) as ReceiptOcrPayload;

  const prompt = [
    "Anda adalah parser OCR struk Indonesia.",
    "Kembalikan tepat satu object JSON valid tanpa markdown dan tanpa penjelasan tambahan.",
    "Gunakan field:",
    "{ totalAmount?: number, merchantName?: string | null, transactionDate?: string | null, ocrText: string, confidence: number, reviewReasons: Array<{ code: string, message: string }> }",
    "Jika total tidak jelas, kosongkan totalAmount.",
    "Tanggal gunakan format YYYY-MM-DD jika yakin.",
    "Confidence 0 sampai 1."
  ].join("\n");

  const completion = await client.ai.chat.completions.create({
    model: Deno.env.get("RECEIPT_AI_MODEL") ?? "openai/gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: prompt
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analisis struk untuk user ${payload.userId}, message ${payload.messageLogId}, file ${payload.storageKey}.`
          },
          {
            type: "image_url",
            image_url: {
              url: payload.imageDataUrl ?? payload.mediaUrl
            }
          }
        ]
      }
    ]
  });

  const content = completion?.choices?.[0]?.message?.content ?? "";
  const json = extractJson(content);

  return new Response(JSON.stringify(json), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
