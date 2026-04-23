import { getCategoryIdByName } from "@/lib/categories/service";
import { requireCurrentUserApi } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { createInsforgeServerClient } from "@/lib/insforge/server";
import { createTransaction } from "@/lib/transactions/service";
import { extractRelationName } from "@/lib/utils/db";
import { fail, ok } from "@/lib/utils/http";
import { createTransactionSchema } from "@/lib/validations/transactions";

export async function GET(request: Request) {
  try {
    const user = await requireCurrentUserApi();
    const accessToken = (await getAccessTokenFromCookies()) ?? "";
    const client = createInsforgeServerClient(accessToken);
    const { searchParams } = new URL(request.url);

    let query = client.database
      .from("transactions")
      .select("id, type, amount, currency, transaction_date, category_id, note, source_channel, review_status, created_at, categories(name)", {
        count: "exact"
      })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const search = searchParams.get("search");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const categoryId = searchParams.get("categoryId");
    const type = searchParams.get("type");
    const reviewStatus = searchParams.get("reviewStatus");

    if (search) query = query.ilike("note", `%${search}%`);
    if (from) query = query.gte("transaction_date", from);
    if (to) query = query.lte("transaction_date", to);
    if (categoryId) query = query.eq("category_id", categoryId);
    if (type) query = query.eq("type", type);
    if (reviewStatus) query = query.eq("review_status", reviewStatus);

    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "20");
    const fromIndex = (page - 1) * pageSize;
    const toIndex = fromIndex + pageSize - 1;
    query = query.range(fromIndex, toIndex);

    const { data, count, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    return ok({
      data: (data ?? []).map((item: any) => ({
        id: item.id,
        type: item.type,
        amount: item.amount,
        currency: item.currency,
        transactionDate: item.transaction_date,
        categoryId: item.category_id,
        categoryName: extractRelationName(item.categories) ?? "-",
        note: item.note,
        sourceChannel: item.source_channel,
        reviewStatus: item.review_status,
        createdAt: item.created_at
      })),
      count: count ?? 0
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Gagal mengambil transaksi.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUserApi();
    const accessToken = (await getAccessTokenFromCookies()) ?? "";
    const body = createTransactionSchema.parse(await request.json());

    const categoryId =
      body.categoryId ||
      (await getCategoryIdByName(accessToken, user.id, body.type, body.type === "income" ? "Gaji" : "Lainnya"));

    const created = await createTransaction(accessToken, {
      userId: user.id,
      categoryId,
      sourceChannel: "web_manual",
      transaction: {
        type: body.type,
        amount: body.amount,
        transactionDate: body.transactionDate,
        categoryName: "",
        note: body.note ?? null,
        reviewStatus: body.reviewStatus ?? "clear",
        reviewReasons: []
      }
    });

    return ok({ status: "ok", data: created });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Gagal membuat transaksi.");
  }
}
