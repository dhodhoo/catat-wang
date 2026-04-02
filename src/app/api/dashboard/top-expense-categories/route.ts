import { requireCurrentUserApi } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { createInsforgeServerClient } from "@/lib/insforge/server";
import { extractRelationName } from "@/lib/utils/db";
import { fail, ok } from "@/lib/utils/http";

export async function GET() {
  try {
    const user = await requireCurrentUserApi();
    const accessToken = (await getAccessTokenFromCookies()) ?? "";
    const client = createInsforgeServerClient(accessToken);
    const { data, error } = await client.database
      .from("transactions")
      .select("amount, categories(name)")
      .eq("user_id", user.id)
      .eq("type", "expense");

    if (error) {
      throw new Error(error.message);
    }

    const aggregate = new Map<string, number>();
    for (const row of data ?? []) {
      const name = extractRelationName(row.categories) ?? "Lainnya";
      aggregate.set(name, (aggregate.get(name) ?? 0) + row.amount);
    }

    const top = Array.from(aggregate.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return ok({ data: top });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Gagal mengambil kategori pengeluaran terbesar.");
  }
}
