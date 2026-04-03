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
  const displayUserPhone = latestLink?.phone_e164 ?? data?.whatsapp_phone_e164 ?? "Belum Terhubung";

  return (
    <DashboardShell title="Koneksi WhatsApp" subtitle="Kelola sinkronisasi bot WhatsApp untuk pencatatan otomatis.">
      <div className="space-y-12">
        <WahaSessionCard />
        <WhatsAppLinkCard defaultPhone={data?.whatsapp_phone_e164 ?? ""} botNumber={botNumber} />
        
        <div className="rounded-3xl border border-slate-800 bg-slate-900/20 p-8 backdrop-blur-sm relative overflow-hidden">
          <div className="mb-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-500">Akun Terhubung</p>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-1">{displayUserPhone}</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase text-slate-500">STATUS VERIFIKASI</p>
              <p className={`font-bold ${data?.whatsapp_phone_verified_at ? 'text-emerald-500' : 'text-rose-500'}`}>
                {data?.whatsapp_phone_verified_at ? "TERVERIFIKASI" : "BUTUH VERIFIKASI"}
              </p>
            </div>
            {latestLink?.phone_e164 && latestLink.phone_e164 !== data?.whatsapp_phone_e164 && (
              <div className="space-y-1">
                <p className="font-mono text-[10px] uppercase text-slate-500">CATATAN SISTEM</p>
                <p className="text-[11px] text-slate-400 italic">Terdeteksi perbedaan ID pengirim internal WAHA.</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800">
            <p className="font-mono text-[10px] text-slate-500 leading-relaxed uppercase tracking-tight">
              Catatan: Setelah koneksi WhatsApp berhasil, minta kode verifikasi untuk menghubungkan nomor Anda dengan sistem.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
