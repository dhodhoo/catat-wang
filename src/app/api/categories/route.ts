import { listCategories } from "@/lib/categories/service";
import { requireCurrentUserApi } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { createInsforgeServerClient } from "@/lib/insforge/server";
import { fail, ok } from "@/lib/utils/http";

export async function GET(request: Request) {
  try {
    const user = await requireCurrentUserApi();
    const accessToken = (await getAccessTokenFromCookies()) ?? "";
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "income" | "expense" | null;
    const categories = await listCategories(accessToken, user.id, type ?? undefined);
    return ok({ data: categories });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Gagal mengambil kategori.");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUserApi();
    const accessToken = (await getAccessTokenFromCookies()) ?? "";
    const body = (await request.json()) as { name?: string; type?: "income" | "expense" };
    if (!body.name || !body.type) {
      return fail("Nama kategori dan type wajib diisi.");
    }

    const client = createInsforgeServerClient(accessToken);
    const { data, error } = await client.database
      .from("categories")
      .insert([
        {
          user_id: user.id,
          name: body.name,
          type: body.type
        }
      ])
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Gagal membuat kategori.");
    }

    return ok({ status: "ok", data });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Gagal membuat kategori.");
  }
}
