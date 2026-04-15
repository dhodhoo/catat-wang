import crypto from "node:crypto";
import { requireCurrentUserApi } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { createInsforgeServerClient } from "@/lib/insforge/server";
import { fail, ok } from "@/lib/utils/http";
import { normalizePhone } from "@/lib/whatsapp/client";

function generateLinkCode() {
  return `LINK-${crypto.randomInt(100000, 999999)}`;
}

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUserApi();
    const accessToken = (await getAccessTokenFromCookies()) ?? "";
    const client = createInsforgeServerClient(accessToken);
    const body = (await request.json()) as { phone?: string };

    if (!body.phone) {
      return fail("Nomor WhatsApp wajib diisi.");
    }

    const normalizedPhone = normalizePhone(body.phone);
    if (!normalizedPhone) {
      return fail("Nomor WhatsApp tidak valid.");
    }

    const linkCode = generateLinkCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { data, error } = await client.database
      .from("whatsapp_link_requests")
      .insert([
        {
          user_id: user.id,
          phone_e164: normalizedPhone,
          link_code: linkCode,
          status: "pending",
          expires_at: expiresAt
        }
      ])
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Gagal membuat link code WhatsApp.");
    }

    return ok({
      linkCode,
      expiresAt,
      instructions: `Kirim "${linkCode}" ke nomor bot WhatsApp untuk menyelesaikan koneksi.`
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Gagal memulai koneksi WhatsApp.");
  }
}
