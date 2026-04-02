import { getCategoryIdByName } from "@/lib/categories/service";
import { createInsforgeAdminClient } from "@/lib/insforge/server";
import { parseIncomingText } from "@/lib/parser/parse-text-transaction";
import { invokeReceiptOcr } from "@/lib/receipts/ocr";
import { uploadReceiptBlob } from "@/lib/receipts/upload";
import { createTransaction, deleteLastTransaction, updateLastTransaction } from "@/lib/transactions/service";
import { fail, ok } from "@/lib/utils/http";
import {
  downloadWhatsAppMedia,
  getWhatsAppMediaDownloadUrl,
  normalizePhone,
  sendWhatsAppTextMessage,
  verifyWhatsAppSignature
} from "@/lib/whatsapp/client";
import {
  buildLinkInstructionMessage,
  buildLinkSuccessMessage,
  buildNeedManualAmountMessage,
  buildTransactionSavedMessage
} from "@/lib/whatsapp/templates";
import { computeDedupeHash, normalizeWhatsappPayload } from "@/lib/whatsapp/webhook";

async function blobToDataUrl(blob: Blob) {
  const buffer = Buffer.from(await blob.arrayBuffer());
  const mimeType = blob.type || "image/jpeg";
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

async function findUserByPhone(phone: string) {
  const admin = createInsforgeAdminClient();
  const { data, error } = await admin.database
    .from("profiles")
    .select("*")
    .eq("whatsapp_phone_e164", normalizePhone(phone))
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function persistMessageLog(payload: Record<string, unknown>) {
  const admin = createInsforgeAdminClient();
  const { data, error } = await admin.database.from("message_logs").insert([payload]).select().single();

  if (error || !data) {
    throw new Error(error?.message ?? "Gagal menyimpan message log.");
  }

  return data;
}

async function handleLinkCode(messageText: string, waFrom: string, replyToChatId: string) {
  const admin = createInsforgeAdminClient();
  const { data, error } = await admin.database
    .from("whatsapp_link_requests")
    .select("*")
    .eq("link_code", messageText.trim().toUpperCase())
    .eq("status", "pending")
    .gte("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return false;
  }

  await admin.database
    .from("profiles")
    .update({
      whatsapp_phone_e164: normalizePhone(waFrom),
      whatsapp_phone_verified_at: new Date().toISOString()
    })
    .eq("id", data.user_id);

  await admin.database
    .from("whatsapp_link_requests")
    .update({
      status: "verified",
      verified_at: new Date().toISOString()
    })
    .eq("id", data.id);

  await sendWhatsAppTextMessage(replyToChatId, buildLinkSuccessMessage());
  return true;
}

export async function GET() {
  return ok({
    status: "ok",
    provider: "waha"
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!rawBody.trim()) {
    return ok({ received: false, ignored: true });
  }

  const signature =
    request.headers.get("x-webhook-hmac") ??
    request.headers.get("x-hmac-signature") ??
    request.headers.get("x-waha-hmac");

  if (!verifyWhatsAppSignature(rawBody, signature)) {
    return fail("Invalid WAHA webhook signature.", 401, "unauthorized");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return ok({ received: false, ignored: true });
  }

  const messages = normalizeWhatsappPayload(payload);
  if (messages.length === 0) {
    return ok({ received: true, ignored: true });
  }

  const admin = createInsforgeAdminClient();

  for (const message of messages) {
    const existing = await admin.database
      .from("message_logs")
      .select("id")
      .eq("whatsapp_message_id", message.messageId)
      .maybeSingle();

    if (existing.data?.id) {
      continue;
    }

    const isLinked = message.text ? await handleLinkCode(message.text, message.from, message.replyToChatId) : false;
    if (isLinked) {
      await persistMessageLog({
        whatsapp_message_id: message.messageId,
        user_id: null,
        wa_from: normalizePhone(message.from),
        wa_type: "command",
        raw_text: message.text,
        media_id: null,
        media_mime_type: null,
        media_sha256: null,
        intent: "link_account",
        parsed_payload: { code: message.text },
        dedupe_hash: computeDedupeHash({ from: message.from, text: message.text }),
        processing_status: "processed",
        transaction_id: null,
        provider_payload: message.providerPayload,
        received_at: message.receivedAt.toISOString()
      });
      continue;
    }

    const profile = await findUserByPhone(message.from);
    if (!profile) {
      await sendWhatsAppTextMessage(message.replyToChatId, buildLinkInstructionMessage()).catch(() => null);
      await persistMessageLog({
        whatsapp_message_id: message.messageId,
        user_id: null,
        wa_from: normalizePhone(message.from),
        wa_type: message.type,
        raw_text: message.text,
        media_id: message.image?.id ?? null,
        media_mime_type: message.image?.mimeType ?? null,
        media_sha256: message.image?.sha256 ?? null,
        intent: "unknown",
        parsed_payload: null,
        dedupe_hash: computeDedupeHash({ from: message.from, text: message.text, mediaId: message.image?.id }),
        processing_status: "failed",
        transaction_id: null,
        provider_payload: message.providerPayload,
        received_at: message.receivedAt.toISOString()
      });
      continue;
    }

    if (message.type === "text" || message.type === "command") {
      const parsed = parseIncomingText(message.text ?? "", message.receivedAt, profile.timezone ?? "Asia/Jakarta");
      const messageLog = await persistMessageLog({
        whatsapp_message_id: message.messageId,
        user_id: profile.id,
        wa_from: normalizePhone(message.from),
        wa_type: message.type,
        raw_text: message.text,
        media_id: null,
        media_mime_type: null,
        media_sha256: null,
        intent: parsed.intent,
        parsed_payload: parsed,
        dedupe_hash: computeDedupeHash({ from: message.from, text: message.text }),
        processing_status: parsed.intent === "unknown" ? "needs_input" : "received",
        transaction_id: null,
        provider_payload: message.providerPayload,
        received_at: message.receivedAt.toISOString()
      });

      if (parsed.intent === "create") {
        const categoryId = await getCategoryIdByName("", profile.id, parsed.transaction.type, parsed.transaction.categoryName);
        const transaction = await createTransaction("", {
          userId: profile.id,
          categoryId,
          sourceChannel: "whatsapp_text",
          transaction: parsed.transaction,
          sourceMessageLogId: messageLog.id,
          rawInputReference: message.text
        });

        await admin.database
          .from("message_logs")
          .update({
            processing_status: "processed",
            transaction_id: transaction.id
          })
          .eq("id", messageLog.id);

        await sendWhatsAppTextMessage(
          message.replyToChatId,
          buildTransactionSavedMessage({
            amount: transaction.amount,
            categoryName: parsed.transaction.categoryName,
            type: parsed.transaction.type
          })
        );
      } else if (parsed.intent === "update_last") {
        const patch: Record<string, unknown> = {};
        if (parsed.patch.amount) patch.amount = parsed.patch.amount;
        if (parsed.patch.transactionDate) patch.transaction_date = parsed.patch.transactionDate;
        if (parsed.patch.categoryName) {
          patch.category_id = await getCategoryIdByName("", profile.id, "expense", parsed.patch.categoryName);
        }
        const transaction = await updateLastTransaction("", profile.id, patch);
        await admin.database
          .from("message_logs")
          .update({ processing_status: "processed", transaction_id: transaction.id })
          .eq("id", messageLog.id);
        await sendWhatsAppTextMessage(message.replyToChatId, "Transaksi terakhir berhasil diperbarui.");
      } else if (parsed.intent === "delete_last") {
        const transaction = await deleteLastTransaction("", profile.id);
        await admin.database
          .from("message_logs")
          .update({ processing_status: "processed", transaction_id: transaction.id })
          .eq("id", messageLog.id);
        await sendWhatsAppTextMessage(message.replyToChatId, "Transaksi terakhir berhasil dihapus.");
      } else {
        await sendWhatsAppTextMessage(
          message.replyToChatId,
          "Pesan belum terbaca sebagai transaksi. Contoh: jajan 25rb atau gaji masuk 5jt."
        );
      }

      continue;
    }

    if (message.type === "image" && message.image?.url) {
      const messageLog = await persistMessageLog({
        whatsapp_message_id: message.messageId,
        user_id: profile.id,
        wa_from: normalizePhone(message.from),
        wa_type: "image",
        raw_text: null,
        media_id: message.image.id,
        media_mime_type: message.image.mimeType,
        media_sha256: message.image.sha256,
        intent: "create",
        parsed_payload: null,
        dedupe_hash: computeDedupeHash({ from: message.from, mediaId: message.image.id }),
        processing_status: "received",
        transaction_id: null,
        provider_payload: message.providerPayload,
        received_at: message.receivedAt.toISOString()
      });

      try {
        const mediaUrl = await getWhatsAppMediaDownloadUrl(message.image.url);
        const blob = await downloadWhatsAppMedia(mediaUrl);
        const imageDataUrl = await blobToDataUrl(blob);
        const uploaded = await uploadReceiptBlob("", profile.id, `${message.image.id}.jpg`, blob);
        const ocr = await invokeReceiptOcr("", {
          userId: profile.id,
          messageLogId: messageLog.id,
          mediaUrl,
          storageKey: uploaded.key,
          imageDataUrl
        });

        if (!ocr.totalAmount) {
          await admin.database
            .from("message_logs")
            .update({ processing_status: "needs_input" })
            .eq("id", messageLog.id);
          await sendWhatsAppTextMessage(message.replyToChatId, buildNeedManualAmountMessage());
          continue;
        }

        const categoryId = await getCategoryIdByName("", profile.id, "expense", "Belanja");
        const transaction = await createTransaction("", {
          userId: profile.id,
          categoryId,
          sourceChannel: "whatsapp_receipt",
          transaction: {
            type: "expense",
            amount: ocr.totalAmount,
            transactionDate: ocr.transactionDate ?? message.receivedAt.toISOString().slice(0, 10),
            categoryName: "Belanja",
            note: ocr.merchantName ?? "Receipt WhatsApp",
            reviewStatus: ocr.confidence >= 0.8 ? "clear" : "need_review",
            reviewReasons: ocr.reviewReasons
          },
          sourceMessageLogId: messageLog.id,
          rawInputReference: uploaded.url
        });

        await admin.database.from("receipt_attachments").insert([
          {
            user_id: profile.id,
            transaction_id: transaction.id,
            storage_bucket: uploaded.bucket,
            storage_key: uploaded.key,
            image_url: uploaded.url,
            ocr_text: ocr.ocrText,
            merchant_name: ocr.merchantName,
            detected_total: ocr.totalAmount,
            detected_date: ocr.transactionDate,
            ocr_confidence: ocr.confidence,
            raw_ocr_payload: ocr.rawPayload
          }
        ]);

        await admin.database
          .from("message_logs")
          .update({ processing_status: "processed", transaction_id: transaction.id, parsed_payload: ocr })
          .eq("id", messageLog.id);

        await sendWhatsAppTextMessage(
          message.replyToChatId,
          buildTransactionSavedMessage({
            amount: ocr.totalAmount,
            categoryName: "Belanja",
            type: "expense",
            source: "receipt",
            merchantName: ocr.merchantName
          })
        );
      } catch (error) {
        await admin.database
          .from("message_logs")
          .update({
            processing_status: "failed",
            parsed_payload: { error: error instanceof Error ? error.message : "OCR failed" }
          })
          .eq("id", messageLog.id);
        await sendWhatsAppTextMessage(message.replyToChatId, buildNeedManualAmountMessage()).catch(() => null);
      }
    }
  }

  return ok({ received: true });
}
