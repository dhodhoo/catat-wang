import { createInsforgeServerClient } from "@/lib/insforge/server";

function deriveName(user: { name?: string | null; email?: string | null }) {
  if (user.name?.trim()) {
    return user.name.trim();
  }

  if (user.email) {
    return user.email.split("@")[0] ?? "Pengguna";
  }

  return "Pengguna";
}

export async function ensureUserBootstrap(accessToken: string, user: { id: string; name?: string | null; email?: string | null }) {
  const client = createInsforgeServerClient(accessToken);
  const existing = await client.database.from("profiles").select("id").eq("id", user.id).maybeSingle();

  if (existing.error) {
    throw new Error(existing.error.message);
  }

  if (!existing.data) {
    const inserted = await client.database.from("profiles").insert([
      {
        id: user.id,
        full_name: deriveName(user)
      }
    ]);

    if (inserted.error) {
      throw new Error(inserted.error.message);
    }
  }

  const seeded = await client.database.rpc("seed_default_categories_for_user", {
    target_user_id: user.id
  });

  if (seeded.error) {
    throw new Error(seeded.error.message);
  }
}
