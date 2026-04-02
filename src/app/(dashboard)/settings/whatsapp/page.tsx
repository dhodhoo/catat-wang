import { WahaSessionCard } from "@/components/whatsapp/waha-session-card";
import { WhatsAppLinkCard } from "@/components/whatsapp/whatsapp-link-card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireCurrentUser } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { createInsforgeServerClient } from "@/lib/insforge/server";
import { getWahaSession, fromWahaChatId } from "@/lib/whatsapp/client";

export default async function WhatsAppSettingsPage() {
  const user = await requireCurrentUser();
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
  const session = await getWahaSession().catch(() => null);
  const botNumber = session?.me?.id ? fromWahaChatId(session.me.id) : null;
  const displayUserPhone = latestLink?.phone_e164 ?? data?.whatsapp_phone_e164 ?? "Belum terhubung";

  return (
    <DashboardShell title="Koneksi WhatsApp" subtitle="Hubungkan satu nomor WhatsApp ke akun ini untuk input transaksi otomatis.">
      <div className="space-y-6">
        <WahaSessionCard />
        <WhatsAppLinkCard defaultPhone={data?.whatsapp_phone_e164 ?? ""} botNumber={botNumber} />
        <div className="rounded-[1.75rem] bg-white p-6 shadow-card">
          <p className="text-sm text-slate-500">Nomor user yang terhubung</p>
          <h2 className="mt-2 text-2xl font-semibold">{displayUserPhone}</h2>
          <p className="mt-3 text-sm text-slate-600">
            Status verifikasi: {data?.whatsapp_phone_verified_at ? "Terverifikasi" : "Belum verifikasi"}
          </p>
          {latestLink?.phone_e164 && latestLink.phone_e164 !== data?.whatsapp_phone_e164 ? (
            <p className="mt-3 text-xs text-slate-500">
              App menampilkan nomor yang Anda input saat linking. WAHA saat ini masih mengirim sender ID internal untuk lookup pesan masuk.
            </p>
          ) : null}
          <p className="mt-6 text-sm text-slate-700">
            Setelah QR WAHA tersambung, generate kode LINK lewat endpoint <code>/api/whatsapp/link/initiate</code>,
            lalu kirim kode itu ke nomor bot WAHA untuk menghubungkan akun user ini.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
