import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function SettingsLoading() {
  return (
    <DashboardShell title="Settings">
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-48 rounded-xl border border-[#e7e5e4] bg-[#f5f5f4]" />
        <div className="h-40 rounded-3xl border border-[#e7e5e4] bg-[#f5f5f4]" />
      </div>
    </DashboardShell>
  );
}
