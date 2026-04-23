import { getCategoryIdByName } from "@/lib/categories/service";
import { createInsforgeAdminClient } from "@/lib/insforge/server";
import { parseIncomingTextBatch } from "@/lib/parser/parse-text-transaction";

import { createTransaction, deleteLastTransaction, updateLastTransaction } from "@/lib/transactions/service";
import { fail, ok } from "@/lib/utils/http";

import {
  getWhatsAppProvider,
  getPhoneLookupVariants,
  normalizePhone,
  resolveWahaPhone,
  sendWhatsAppTextMessage,
  verifyWhatsAppSignature
} from "@/lib/whatsapp/client";
import {
  buildBatchTransactionSummaryMessage,
  buildLinkInstructionMessage,
  buildMixedBatchInstructionMessage,
  buildLinkSuccessMessage,
} from "@/lib/whatsapp/templates";
import { computeDedupeHash, normalizeWhatsappPayload } from "@/lib/whatsapp/webhook";




async function findUserByPhone(phone: string) {
  const admin = createInsforgeAdminClient();
  const variants = getPhoneLookupVariants(phone);
  const { data, error } = await admin.database
    .from("profiles")
    .select("*")
    .in("whatsapp_phone_e164", variants)
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
      whatsapp_phone_e164: normalizePhone(data.phone_e164),
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
    provider: getWhatsAppProvider()
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
    return fail("Invalid WhatsApp webhook signature.", 401, "unauthorized");
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
    const senderPhone = await resolveWahaPhone(message.replyToChatId || message.from);

    const existing = await admin.database
      .from("message_logs")
      .select("id")
      .eq("whatsapp_message_id", message.messageId)
      .maybeSingle();

    if (existing.data?.id) {
      continue;
    }

    const isLinked = message.text ? await handleLinkCode(message.text, senderPhone, message.replyToChatId) : false;
    if (isLinked) {
      await persistMessageLog({
        whatsapp_message_id: message.messageId,
        user_id: null,
        wa_from: senderPhone,
        wa_type: "command",
        raw_text: message.text,
        media_id: null,
        media_mime_type: null,
        media_sha256: null,
        intent: "link_account",
        parsed_payload: { code: message.text },
        dedupe_hash: computeDedupeHash({ from: senderPhone, text: message.text }),
        processing_status: "processed",
        transaction_id: null,
        provider_payload: message.providerPayload,
        received_at: message.receivedAt.toISOString()
      });
      continue;
    }

    const profile = await findUserByPhone(senderPhone);
    if (!profile) {
      await sendWhatsAppTextMessage(message.replyToChatId, buildLinkInstructionMessage()).catch(() => null);
      await persistMessageLog({
        whatsapp_message_id: message.messageId,
        user_id: null,
        wa_from: senderPhone,
        wa_type: message.type,
        raw_text: message.text,
        media_id: message.image?.id ?? null,
        media_mime_type: message.image?.mimeType ?? null,
        media_sha256: message.image?.sha256 ?? null,
        intent: "unknown",
        parsed_payload: null,
        dedupe_hash: computeDedupeHash({ from: senderPhone, text: message.text, mediaId: message.image?.id }),
        processing_status: "failed",
        transaction_id: null,
        provider_payload: message.providerPayload,
        received_at: message.receivedAt.toISOString()
      });
      continue;
    }

    if (message.type === "text" || message.type === "command") {
      const batchResult = await parseIncomingTextBatch(
        message.text ?? "",
        message.receivedAt,
        profile.timezone ?? "Asia/Jakarta"
      );
      const firstParsed = batchResult.items[0]?.parsed;
      const hasCreateItem = batchResult.items.some((item) => item.parsed.intent === "create");
      const initialIntent =
        batchResult.status === "mixed_not_allowed"
          ? "unknown"
          : batchResult.items.length === 1 && firstParsed
            ? firstParsed.intent
            : hasCreateItem
              ? "create"
              : "unknown";

      const messageLog = await persistMessageLog({
        whatsapp_message_id: message.messageId,
        user_id: profile.id,
        wa_from: senderPhone,
        wa_type: message.type,
        raw_text: message.text,
        media_id: null,
        media_mime_type: null,
        media_sha256: null,
        intent: initialIntent,
        parsed_payload: batchResult,
        dedupe_hash: computeDedupeHash({ from: senderPhone, text: message.text }),
        processing_status: initialIntent === "unknown" ? "needs_input" : "received",
        transaction_id: null,
        provider_payload: message.providerPayload,
        received_at: message.receivedAt.toISOString()
      });

      if (batchResult.status === "mixed_not_allowed") {
        await sendWhatsAppTextMessage(
          message.replyToChatId,
          buildMixedBatchInstructionMessage(batchResult.message)
        );
        continue;
      }

      const parsedItems = batchResult.items;
      const singleCommandParsed = parsedItems.length === 1 ? parsedItems[0]?.parsed : null;

      if (singleCommandParsed?.intent === "update_last") {
        const patch: Record<string, unknown> = {};
        if (singleCommandParsed.patch.amount) patch.amount = singleCommandParsed.patch.amount;
        if (singleCommandParsed.patch.transactionDate) patch.transaction_date = singleCommandParsed.patch.transactionDate;
        if (singleCommandParsed.patch.categoryName) {
          patch.category_id = await getCategoryIdByName("", profile.id, "expense", singleCommandParsed.patch.categoryName);
        }
        const transaction = await updateLastTransaction("", profile.id, patch);
        await admin.database
          .from("message_logs")
          .update({ processing_status: "processed", transaction_id: transaction.id })
          .eq("id", messageLog.id);
        await sendWhatsAppTextMessage(message.replyToChatId, "Transaksi terakhir berhasil diperbarui.");
        continue;
      }

      if (singleCommandParsed?.intent === "delete_last") {
        const transaction = await deleteLastTransaction("", profile.id);
        await admin.database
          .from("message_logs")
          .update({ processing_status: "processed", transaction_id: transaction.id })
          .eq("id", messageLog.id);
        await sendWhatsAppTextMessage(message.replyToChatId, "Transaksi terakhir berhasil dihapus.");
        continue;
      }

      if (singleCommandParsed?.intent === "link_account") {
        await sendWhatsAppTextMessage(message.replyToChatId, buildLinkInstructionMessage());
        continue;
      }

      const successes: Array<{
        id: string;
        raw: string;
        amount: number;
        categoryName: string;
        type: "income" | "expense";
      }> = [];
      const failures: Array<{ raw: string; reason: string }> = [];

      for (const item of parsedItems) {
        if (item.parsed.intent !== "create") {
          failures.push({
            raw: item.raw,
            reason:
              item.parsed.intent === "unknown"
                ? "Format transaksi belum terbaca."
                : "Hanya data transaksi yang didukung untuk batch."
          });
          continue;
        }

        try {
          const categoryId = await getCategoryIdByName(
            "",
            profile.id,
            item.parsed.transaction.type,
            item.parsed.transaction.categoryName
          );
          const transaction = await createTransaction("", {
            userId: profile.id,
            categoryId,
            sourceChannel: "whatsapp_text",
            transaction: item.parsed.transaction,
            sourceMessageLogId: messageLog.id,
            rawInputReference: item.raw
          });

          successes.push({
            id: transaction.id,
            raw: item.raw,
            amount: transaction.amount,
            categoryName: item.parsed.transaction.categoryName,
            type: item.parsed.transaction.type
          });
        } catch (error: any) {
          failures.push({
            raw: item.raw,
            reason: error?.message ?? "Gagal menyimpan transaksi."
          });
        }
      }

      const firstTransactionId = successes[0]?.id ?? null;
      await admin.database
        .from("message_logs")
        .update({
          processing_status: successes.length > 0 ? "processed" : "needs_input",
          parsed_payload: {
            ...batchResult,
            summary: {
              successCount: successes.length,
              failureCount: failures.length,
              successes: successes.map((item) => ({
                id: item.id,
                raw: item.raw,
                amount: item.amount,
                categoryName: item.categoryName,
                type: item.type
              })),
              failures
            }
          },
          transaction_id: firstTransactionId
        })
        .eq("id", messageLog.id);

      await sendWhatsAppTextMessage(
        message.replyToChatId,
        buildBatchTransactionSummaryMessage({
          successes: successes.map((item) => ({
            raw: item.raw,
            amount: item.amount,
            categoryName: item.categoryName,
            type: item.type
          })),
          failures
        })
      );

      continue;
    }


    if (message.type === "image") {
      await sendWhatsAppTextMessage(
        message.replyToChatId,
        "Gambar tidak diproses oleh sistem. Silakan kirim teks transaksi langsung, contoh:\n\n• *jajan 25rb*\n• *gaji masuk 5jt*\n• *belanja 150000*"
      );
    }
  }

  return ok({ received: true });
}
