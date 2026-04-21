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

  const session = await getWahaSession().catch(() => null);
  const botNumber = session?.me?.id ? fromWahaChatId(session.me.id) : null;

  return (
    <DashboardShell title="WhatsApp">
      <div className="space-y-6">
        {canManageWaha ? <WahaSessionCard /> : null}
        <WhatsAppLinkCard defaultPhone={data?.whatsapp_phone_e164 ?? ""} botNumber={botNumber} canManageWaha={canManageWaha} />
      </div>
    </DashboardShell>
  );
}
