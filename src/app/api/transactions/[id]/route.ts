import { requireCurrentUserApi } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { createInsforgeServerClient } from "@/lib/insforge/server";
import { writeTransactionAudit } from "@/lib/transactions/audit";
import { fail, ok } from "@/lib/utils/http";
import { updateTransactionSchema } from "@/lib/validations/transactions";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await requireCurrentUserApi();
    const accessToken = (await getAccessTokenFromCookies()) ?? "";
    const client = createInsforgeServerClient(accessToken);
    const { data, error } = await client.database
      .from("transactions")
      .select("*, categories(name)")
      .eq("user_id", user.id)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return ok({ data });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Gagal mengambil detail transaksi.");
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await requireCurrentUserApi();
    const accessToken = (await getAccessTokenFromCookies()) ?? "";
    const client = createInsforgeServerClient(accessToken);
    const patch = updateTransactionSchema.parse(await request.json());

    const before = await client.database.from("transactions").select("*").eq("id", id).maybeSingle();
    const { data, error } = await client.database
      .from("transactions")
      .update({
        amount: patch.amount,
        transaction_date: patch.transactionDate,
        category_id: patch.categoryId,
        note: patch.note,
        review_status: patch.reviewStatus
      })
      .eq("user_id", user.id)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Gagal mengubah transaksi.");
    }

    await writeTransactionAudit(accessToken, {
      user_id: user.id,
      transaction_id: id,
      actor_type: "user",
      action: "updated",
      before_data: before.data,
      after_data: data,
      source: "web_manual"
    });

    return ok({ status: "ok", data });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Gagal mengubah transaksi.");
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await requireCurrentUserApi();
    const accessToken = (await getAccessTokenFromCookies()) ?? "";
    const client = createInsforgeServerClient(accessToken);
    const before = await client.database.from("transactions").select("*").eq("id", id).maybeSingle();

    await writeTransactionAudit(accessToken, {
      user_id: user.id,
      transaction_id: id,
      actor_type: "user",
      action: "deleted",
      before_data: before.data,
      after_data: null,
      source: "web_manual"
    });

    const { error } = await client.database.from("transactions").delete().eq("user_id", user.id).eq("id", id);
    if (error) {
      throw new Error(error.message);
    }

    return ok({ status: "ok" });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Gagal menghapus transaksi.");
  }
}
