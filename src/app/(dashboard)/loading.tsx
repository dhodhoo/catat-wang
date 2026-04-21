import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function Loading() {
  return (
    <DashboardShell title="Memuat...">
      <div className="space-y-10 animate-pulse">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-3xl border border-[#e7e5e4] bg-[#f5f5f4]" />
          ))}
        </div>

        <div className="h-80 rounded-3xl border border-[#e7e5e4] bg-[#f5f5f4]" />

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-2xl border border-[#e7e5e4] bg-[#f5f5f4]" />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
