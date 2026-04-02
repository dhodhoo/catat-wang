import { requireCurrentUserApi } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { createInsforgeServerClient } from "@/lib/insforge/server";
import { fail, ok } from "@/lib/utils/http";

export async function GET(request: Request) {
  try {
    const user = await requireCurrentUserApi();
    const accessToken = (await getAccessTokenFromCookies()) ?? "";
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") ?? "10");
    const client = createInsforgeServerClient(accessToken);
    const { data, error } = await client.database
      .from("transactions")
      .select("id, amount, type, transaction_date, note, categories(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return ok({ data: data ?? [] });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Gagal mengambil transaksi terbaru.");
  }
}
