import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Landmark, Plus } from "lucide-react";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireCurrentUser } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import {
  getCashflowSeries,
  getDashboardRecentTransactions,
  getDashboardSummary
} from "@/lib/transactions/queries";
import { formatCurrency, formatDateLabel } from "@/lib/utils/format";

export default async function DashboardPage() {
  const user = await requireCurrentUser();
  const accessToken = (await getAccessTokenFromCookies()) ?? "";
  const summary = await getDashboardSummary(accessToken, user.id);
  const series = await getCashflowSeries(accessToken, user.id);
  const recentTransactions = await getDashboardRecentTransactions(accessToken, user.id, 5);

  return (
    <DashboardShell title="Dashboard">
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
          <CashflowChart data={series} />
        </section>

        <section>
          <article className="surface-card p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="eyebrow">Transaksi terbaru</p>
                <h2 className="mt-2 text-2xl text-ink">Aktivitas yang baru masuk</h2>
              </div>
              <Link className="button-ghost gap-1 px-0 text-moss hover:bg-transparent" href="/transactions">
                Lihat semua
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentTransactions.length === 0 ? (
                <p className="surface-muted p-4 text-sm text-slate-500">Belum ada transaksi terbaru.</p>
              ) : (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="surface-muted p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-500">{formatDateLabel(transaction.transactionDate)}</p>
                        <h3 className="mt-1 text-lg text-ink">{transaction.categoryName}</h3>
                        <p className="mt-1 text-sm text-slate-500">{transaction.note || "Tanpa catatan"}</p>
                      </div>
                      <p className={`text-sm font-semibold ${transaction.type === "income" ? "text-moss" : "text-coral"}`}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>
      </div>

      <Link
        className="fixed bottom-20 right-4 z-20 inline-flex items-center gap-2 rounded-full bg-moss px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(53,89,74,0.25)] transition hover:bg-ink md:bottom-8"
        href="/transactions?create=1"
      >
        <Plus className="h-4 w-4" />
        Tambah
      </Link>
    </DashboardShell>
  );
}
