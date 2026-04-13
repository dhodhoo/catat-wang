import { MessageCircleMore, ShieldCheck } from "lucide-react";
import { WahaSessionCard } from "@/components/whatsapp/waha-session-card";
import { WhatsAppLinkCard } from "@/components/whatsapp/whatsapp-link-card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireCurrentUser } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { createInsforgeServerClient } from "@/lib/insforge/server";
import { isWahaInternalAdminEmail } from "@/lib/whatsapp/admin";
import { fromWahaChatId, getWahaSession } from "@/lib/whatsapp/client";

export default async function WhatsAppSettingsPage() {
  const user = await requireCurrentUser();
  const canManageWaha = isWahaInternalAdminEmail(user.email);
  const accessToken = (await getAccessTokenFromCookies()) ?? "";
  const client = createInsforgeServerClient(accessToken);
  const { data } = await client.database
    .from("profiles")
    .select("whatsapp_phone_e164, whatsapp_phone_verified_at")
    .eq("id", user.id)
    .maybeSingle();

  const { data: latestLink } = await client.database
    .from("whatsapp_link_requests")
    .select("phone_e164, status, verified_at")
    .eq("user_id", user.id)
    .eq("status", "verified")
    .order("verified_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const session = canManageWaha ? await getWahaSession().catch(() => null) : null;
  const botNumber = session?.me?.id ? fromWahaChatId(session.me.id) : null;
  const displayUserPhone = latestLink?.phone_e164 ?? data?.whatsapp_phone_e164 ?? "Belum terhubung";

  return (
    <DashboardShell title="Koneksi WhatsApp" subtitle="Kelola alur sambung, scan QR, dan verifikasi nomor Anda dengan lebih jelas.">
      <div className="space-y-6">
        <section className="grid gap-4 xl:grid-cols-2">
          <article className="surface-card p-5">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-moss">
                <MessageCircleMore className="h-5 w-5" />
              </span>
              <div>
                <p className="eyebrow">Nomor terhubung</p>
                <h2 className="mt-3 text-3xl text-ink">{displayUserPhone}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Ini nomor yang paling akhir terhubung atau terverifikasi untuk akun Anda.
                </p>
              </div>
            </div>
          </article>

          <article className="surface-card p-5">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff6ea] text-coral">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="eyebrow">Status verifikasi</p>
                <h2 className="mt-3 text-3xl text-ink">
                  {data?.whatsapp_phone_verified_at ? "Terverifikasi" : "Belum diverifikasi"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {data?.whatsapp_phone_verified_at
                    ? "Nomor Anda sudah siap dipakai untuk pencatatan otomatis."
                    : "Selesaikan langkah sambung dan kode verifikasi agar pesan bisa dihubungkan ke akun ini."}
                </p>
              </div>
            </div>
          </article>
        </section>

        {canManageWaha ? <WahaSessionCard /> : null}
        <WhatsAppLinkCard defaultPhone={data?.whatsapp_phone_e164 ?? ""} botNumber={botNumber} canManageWaha={canManageWaha} />
      </div>
    </DashboardShell>
  );
}
