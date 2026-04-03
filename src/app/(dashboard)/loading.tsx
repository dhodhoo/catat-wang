import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function Loading() {
  return (
    <DashboardShell title="Memuat..." subtitle="Menyiapkan data finansial Anda.">
      <div className="space-y-10 animate-pulse">
        {/* Skeleton for Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-slate-900/40 border border-slate-800" />
          ))}
        </div>
        
        {/* Skeleton for Chart/Table */}
        <div className="h-80 rounded-3xl bg-slate-900/40 border border-slate-800" />
        
        {/* Skeleton for Rows */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-slate-900/20 border border-slate-800/50" />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
