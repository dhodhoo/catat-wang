import crypto from "node:crypto";

export function normalizePhone(raw) {
  const digits = String(raw ?? "").replace(/[^\d]/g, "");

  if (!digits) return "";
  if (digits.startsWith("62")) return `+${digits}`;
  if (digits.startsWith("0")) return `+62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `+62${digits}`;

  return `+${digits}`;
}

export function toWhatsAppJid(raw) {
  const value = String(raw ?? "").trim();

  if (!value) return "";

  if (value.endsWith("@lid")) {
    return value;
  }

  if (value.endsWith("@s.whatsapp.net")) {
    return value;
  }

  if (value.endsWith("@c.us")) {
    return `${value.replace(/@c\.us$/i, "")}@s.whatsapp.net`;
  }

  const normalized = normalizePhone(value);
  if (!normalized) return "";

  return `${normalized.replace(/^\+/, "")}@s.whatsapp.net`;
}

export function toCompatChatId(jid) {
  return String(jid ?? "").replace(/@s\.whatsapp\.net$/i, "@c.us");
}

export function toCompatSenderId(jid) {
  return toCompatChatId(jid);
}

export function createWebhookSignature(rawBody, secret) {
  return crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
}

export function mapBaileysMessageToWahaEvent(message) {
  const remoteJid = message?.key?.remoteJid ?? "";
  const senderJid = (
    message?.key?.senderPn ??
    message?.key?.participantPn ??
    message?.key?.participant ??
    remoteJid
  );
  const messageId = message?.key?.id ?? crypto.randomUUID();
  const timestamp = Number(message?.messageTimestamp ?? Date.now());

  const textBody =
    message?.message?.conversation ??
    message?.message?.extendedTextMessage?.text ??
    message?.message?.imageMessage?.caption ??
    null;

  const imageMessage = message?.message?.imageMessage;
  const hasImage = Boolean(imageMessage?.mimetype);

  return {
    event: "message",
    payload: {
      id: messageId,
      from: toCompatSenderId(senderJid),
      chatId: toCompatChatId(senderJid),
      fromMe: Boolean(message?.key?.fromMe),
      body: textBody,
      text: textBody,
      timestamp,
      ...(hasImage
        ? {
            media: {
              url: `baileys://media/${messageId}`,
              mimetype: imageMessage?.mimetype ?? null,
              sha256: imageMessage?.fileSha256
                ? Buffer.from(imageMessage.fileSha256).toString("base64")
                : null
            }
          }
        : {})
    }
  };
}
