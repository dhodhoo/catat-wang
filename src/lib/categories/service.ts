import { createInsforgeAdminClient, createInsforgeServerClient } from "@/lib/insforge/server";

export async function listCategories(accessToken: string, userId: string, type?: "income" | "expense") {
  const client = accessToken ? createInsforgeServerClient(accessToken) : createInsforgeAdminClient();
  let query = client.database
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getCategoryIdByName(
  accessToken: string,
  userId: string,
  type: "income" | "expense",
  name: string
) {
  const client = accessToken ? createInsforgeServerClient(accessToken) : createInsforgeAdminClient();
  const normalized = name.trim();
  const { data, error } = await client.database
    .from("categories")
    .select("id, name")
    .eq("user_id", userId)
    .eq("type", type)
    .ilike("name", normalized)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data?.id) {
    return data.id as string;
  }

  const fallback = await client.database
    .from("categories")
    .select("id")
    .eq("user_id", userId)
    .eq("type", type)
    .ilike("name", "Lainnya")
    .maybeSingle();

  if (fallback.error || !fallback.data?.id) {
    throw new Error("Kategori fallback tidak ditemukan.");
  }

  return fallback.data.id as string;
}
