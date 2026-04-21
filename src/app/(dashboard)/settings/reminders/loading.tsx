import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function SettingsRemindersLoading() {
  return (
    <DashboardShell title="Reminder">
      <div className="animate-pulse space-y-6">
        <section className="surface-panel space-y-5 p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="h-4 w-32 rounded-lg bg-[#f5f5f4]" />
              <div className="h-7 w-64 rounded-lg bg-[#f5f5f4]" />
              <div className="h-5 w-full max-w-xl rounded-lg bg-[#f5f5f4]" />
            </div>
            <div className="h-10 w-28 rounded-xl bg-[#f5f5f4]" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="space-y-2">
                <div className="h-4 w-20 rounded-lg bg-[#f5f5f4]" />
                <div className="h-12 rounded-xl bg-[#f5f5f4]" />
              </div>
            ))}
          </div>

          <div className="h-11 w-48 rounded-xl bg-[#f5f5f4]" />
        </section>
      </div>
    </DashboardShell>
  );
}
