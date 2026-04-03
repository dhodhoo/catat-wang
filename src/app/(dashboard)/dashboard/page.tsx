import { ArrowDownRight, ArrowUpRight, Landmark } from "lucide-react";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireCurrentUser } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { getCashflowSeries, getDashboardSummary } from "@/lib/transactions/queries";
import { formatCurrency } from "@/lib/utils/format";

export default async function DashboardPage() {
  const user = await requireCurrentUser();
  const accessToken = (await getAccessTokenFromCookies()) ?? "";
  const summary = await getDashboardSummary(accessToken, user.id);
  const series = await getCashflowSeries(accessToken, user.id);

  return (
    <DashboardShell title="Dashboard" subtitle="Pantau kondisi keuangan terbaru lewat ringkasan yang cepat dipahami.">
      <div className="space-y-8">
        <section className="grid gap-4 md:grid-cols-3">
            {[
              {
                label: "Pemasukan",
                value: summary.incomeTotal,
                icon: ArrowUpRight,
                accent: "text-moss",
                tint: "bg-emerald-50"
              },
              {
                label: "Pengeluaran",
                value: summary.expenseTotal,
                icon: ArrowDownRight,
                accent: "text-coral",
                tint: "bg-rose-50"
              },
              {
                label: "Selisih",
                value: summary.netCashflow,
                icon: Landmark,
                accent: summary.netCashflow >= 0 ? "text-ink" : "text-coral",
                tint: summary.netCashflow >= 0 ? "bg-[#f8f3ea]" : "bg-rose-50"
              }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.label} className="surface-card glow-card overflow-hidden p-7">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <p className="eyebrow">{item.label}</p>
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${item.tint} ${item.accent}`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <p className={`metric-value min-w-0 ${item.accent}`}>{formatCurrency(item.value)}</p>
                  </div>
                </article>
              );
            })}
        </section>

        <section className="surface-panel overflow-hidden p-6 sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
            <CashflowChart data={series} />

            <div className="surface-muted p-5 sm:p-6">
              <p className="eyebrow">Cara membaca grafik</p>
              <h2 className="mt-3 text-2xl text-ink">Pantau arah uang masuk dan keluar dalam satu pandangan.</h2>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                <li>Garis hijau membantu Anda melihat ritme pemasukan dalam 7 hari terakhir.</li>
                <li>Garis coral menyorot hari-hari dengan pengeluaran tertinggi.</li>
                <li>Kalau pola mulai turun, buka histori transaksi untuk audit cepat dan koreksi kategori.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
