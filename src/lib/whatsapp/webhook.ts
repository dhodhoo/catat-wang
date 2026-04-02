import crypto from "node:crypto";
import type { MessageIntent } from "@/types/domain";
import { fromWahaChatId } from "@/lib/whatsapp/client";

interface NormalizedWhatsappMessage {
  messageId: string;
  from: string;
  replyToChatId: string;
  type: "text" | "image" | "command" | "unknown";
  text: string | null;
  image: {
    id: string;
    mimeType: string | null;
    sha256: string | null;
    url: string | null;
  } | null;
  providerPayload: unknown;
  receivedAt: Date;
}

export function computeDedupeHash(payload: { from: string; text?: string | null; mediaId?: string | null }) {
  return crypto
    .createHash("sha256")
    .update(`${payload.from}:${payload.text ?? ""}:${payload.mediaId ?? ""}`)
    .digest("hex");
}

function getDateFromTimestamp(timestamp: unknown) {
  if (typeof timestamp === "number") {
    return new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000);
  }

  if (typeof timestamp === "string" && /^\d+$/.test(timestamp)) {
    const numeric = Number(timestamp);
    return new Date(numeric > 9999999999 ? numeric : numeric * 1000);
  }

  return new Date();
}

export function normalizeWhatsappPayload(payload: any): NormalizedWhatsappMessage[] {
  if (!payload?.event || !payload?.payload) {
    return [];
  }

  if (!["message", "message.any"].includes(payload.event)) {
    return [];
  }

  if (payload.payload?.fromMe) {
    return [];
  }

  const textBody = payload.payload?.body ?? payload.payload?.text ?? null;
  const hasImage =
    Boolean(payload.payload?.media?.url) &&
    String(payload.payload?.media?.mimetype ?? "").toLowerCase().startsWith("image/");

  const type =
    hasImage
      ? "image"
      : textBody
        ? /^(ubah|hapus|kategori|tanggal|link-)/i.test(textBody)
          ? "command"
          : "text"
        : "unknown";

  return [
    {
      messageId: String(payload.payload?.id ?? crypto.randomUUID()),
      from: fromWahaChatId(String(payload.payload?.from ?? payload.payload?.chatId ?? "")),
      replyToChatId: String(payload.payload?.from ?? payload.payload?.chatId ?? ""),
      type,
      text: textBody,
      image: hasImage
        ? {
            id: String(payload.payload?.id ?? crypto.randomUUID()),
            mimeType: payload.payload?.media?.mimetype ?? null,
            sha256: payload.payload?.media?.sha256 ?? null,
            url: payload.payload?.media?.url ?? null
          }
        : null,
      providerPayload: payload,
      receivedAt: getDateFromTimestamp(payload.payload?.timestamp)
    }
  ];
}

export function detectIntentFromType(type: NormalizedWhatsappMessage["type"]): MessageIntent {
  if (type === "command") {
    return "update_last";
  }
  if (type === "image" || type === "text") {
    return "create";
  }
  return "unknown";
}

export type { NormalizedWhatsappMessage };
