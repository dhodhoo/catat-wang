import { requireCurrentUserApi } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { createInsforgeServerClient } from "@/lib/insforge/server";
import { fail, ok } from "@/lib/utils/http";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await requireCurrentUserApi();
    const accessToken = (await getAccessTokenFromCookies()) ?? "";
    const body = (await request.json()) as { name?: string; isArchived?: boolean };
    const client = createInsforgeServerClient(accessToken);

    const { data, error } = await client.database
      .from("categories")
      .update({
        name: body.name,
        is_archived: body.isArchived
      })
      .eq("user_id", user.id)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Gagal mengubah kategori.");
    }

    return ok({ status: "ok", data });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Gagal mengubah kategori.");
  }
}
