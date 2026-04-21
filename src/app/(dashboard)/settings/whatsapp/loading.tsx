import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function SettingsWhatsAppLoading() {
  return (
    <DashboardShell title="WhatsApp">
      <div className="animate-pulse space-y-6">
        <section className="surface-panel space-y-5 p-6 sm:p-7">
          <div className="flex flex-wrap gap-3">
            <div className="h-9 w-28 rounded-full bg-[#f5f5f4]" />
            <div className="h-9 w-36 rounded-full bg-[#f5f5f4]" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-28 rounded-lg bg-[#f5f5f4]" />
            <div className="h-7 w-full max-w-xl rounded-lg bg-[#f5f5f4]" />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="h-11 w-52 rounded-xl bg-[#f5f5f4]" />
            <div className="h-11 w-44 rounded-xl bg-[#f5f5f4]" />
          </div>
          <div className="h-60 rounded-xl border border-[#e7e5e4] bg-[#f5f5f4]" />
        </section>

        <section className="surface-card space-y-5 p-6 sm:p-7">
          <div className="space-y-3">
            <div className="h-4 w-32 rounded-lg bg-[#f5f5f4]" />
            <div className="h-7 w-full max-w-xl rounded-lg bg-[#f5f5f4]" />
            <div className="h-5 w-full max-w-2xl rounded-lg bg-[#f5f5f4]" />
          </div>
          <div className="surface-muted space-y-4 p-5">
            <div className="h-4 w-40 rounded-lg bg-[#f5f5f4]" />
            <div className="h-12 rounded-xl bg-[#f5f5f4]" />
            <div className="h-11 rounded-xl bg-[#f5f5f4]" />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
