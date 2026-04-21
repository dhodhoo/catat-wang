import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function SettingsCategoriesLoading() {
  return (
    <DashboardShell title="Kategori">
      <div className="animate-pulse space-y-6">
        <section className="surface-panel p-6 sm:p-7">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-3">
              <div className="h-4 w-28 rounded-lg bg-[#f5f5f4]" />
              <div className="h-7 w-full max-w-xl rounded-lg bg-[#f5f5f4]" />
              <div className="h-5 w-full max-w-2xl rounded-lg bg-[#f5f5f4]" />
              <div className="h-5 w-40 rounded-lg bg-[#f5f5f4]" />
            </div>
            <div className="surface-muted space-y-4 p-5">
              <div className="h-4 w-36 rounded-lg bg-[#f5f5f4]" />
              <div className="h-12 rounded-xl bg-[#f5f5f4]" />
              <div className="h-12 rounded-xl bg-[#f5f5f4]" />
              <div className="h-11 rounded-xl bg-[#f5f5f4]" />
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          {[1, 2].map((group) => (
            <section key={group} className="surface-card space-y-4 p-5 sm:p-6">
              <div className="h-4 w-40 rounded-lg bg-[#f5f5f4]" />
              <div className="h-7 w-44 rounded-lg bg-[#f5f5f4]" />
              <div className="h-5 w-full rounded-lg bg-[#f5f5f4]" />
              {[1, 2, 3].map((item) => (
                <div key={item} className="surface-muted space-y-3 p-4">
                  <div className="h-6 w-44 rounded-lg bg-[#f5f5f4]" />
                  <div className="h-4 w-28 rounded-lg bg-[#f5f5f4]" />
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
