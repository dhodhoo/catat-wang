import { createInsforgeAdminClient, createInsforgeServerClient } from "@/lib/insforge/server";
import { writeTransactionAudit } from "@/lib/transactions/audit";
import type { ParsedTransactionCandidate } from "@/types/domain";

interface CreateTransactionInput {
  userId: string;
  categoryId: string;
  sourceChannel: "whatsapp_text" | "whatsapp_receipt" | "web_manual";
  transaction: ParsedTransactionCandidate;
  sourceMessageLogId?: string | null;
  rawInputReference?: string | null;
}

export async function createTransaction(accessToken: string, input: CreateTransactionInput) {
  const client = accessToken ? createInsforgeServerClient(accessToken) : createInsforgeAdminClient();
  const { data, error } = await client.database
    .from("transactions")
    .insert([
      {
        user_id: input.userId,
        type: input.transaction.type,
        amount: input.transaction.amount,
        transaction_date: input.transaction.transactionDate,
        category_id: input.categoryId,
        note: input.transaction.note,
        source_channel: input.sourceChannel,
        review_status: input.transaction.reviewStatus,
        review_reasons: input.transaction.reviewReasons,
        source_message_log_id: input.sourceMessageLogId ?? null,
        raw_input_reference: input.rawInputReference ?? null
      }
    ])
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Gagal membuat transaksi.");
  }

  await writeTransactionAudit(accessToken, {
    user_id: input.userId,
    transaction_id: data.id,
    actor_type: input.sourceChannel === "web_manual" ? "user" : "whatsapp",
    action: "created",
    before_data: null,
    after_data: data,
    source: input.sourceChannel
  });

  return data;
}

export async function updateLastTransaction(
  accessToken: string,
  userId: string,
  patch: Record<string, unknown>
) {
  const client = accessToken ? createInsforgeServerClient(accessToken) : createInsforgeAdminClient();
  const latest = await client.database
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latest.error || !latest.data) {
    throw new Error(latest.error?.message ?? "Tidak ada transaksi terakhir.");
  }

  const { data, error } = await client.database
    .from("transactions")
    .update(patch)
    .eq("id", latest.data.id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Gagal mengubah transaksi terakhir.");
  }

  await writeTransactionAudit(accessToken, {
    user_id: userId,
    transaction_id: data.id,
    actor_type: "whatsapp",
    action: "updated",
    before_data: latest.data,
    after_data: data,
    source: "whatsapp_text"
  });

  return data;
}

export async function deleteLastTransaction(accessToken: string, userId: string) {
  const client = accessToken ? createInsforgeServerClient(accessToken) : createInsforgeAdminClient();
  const latest = await client.database
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latest.error || !latest.data) {
    throw new Error(latest.error?.message ?? "Tidak ada transaksi terakhir.");
  }

  await writeTransactionAudit(accessToken, {
    user_id: userId,
    transaction_id: latest.data.id,
    actor_type: "whatsapp",
    action: "deleted",
    before_data: latest.data,
    after_data: null,
    source: "whatsapp_text"
  });

  const { error } = await client.database.from("transactions").delete().eq("id", latest.data.id);
  if (error) {
    throw new Error(error.message);
  }

  return latest.data;
}
