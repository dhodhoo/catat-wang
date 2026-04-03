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
    <DashboardShell
      title="Dashboard"
      subtitle="Pantau arus kas dan transaksi Anda secara real-time."
    >
      <div className="space-y-10">
        <section className="grid gap-6 md:grid-cols-3">
          {[
            { label: "Pemasukan", value: summary.incomeTotal, trend: "income", color: "text-emerald-400" },
            { label: "Pengeluaran", value: summary.expenseTotal, trend: "expense", color: "text-rose-400" },
            { label: "Selisih", value: summary.netCashflow, trend: "neutral", color: "text-white" },
          ].map((item) => (
            <article key={item.label} className="group relative rounded-3xl bg-slate-900/40 p-1 backdrop-blur-sm transition-all hover:bg-slate-900/60 glow-card border border-slate-800">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{item.label}</p>
                  <div className={`h-1.5 w-1.5 rounded-full ${item.trend === 'income' ? 'bg-emerald-500' : item.trend === 'expense' ? 'bg-rose-500' : 'bg-slate-500'}`} />
                </div>
                <h2 className={`text-4xl font-mono tabular-nums tracking-tight ${item.color}`}>
                  {formatCurrency(item.value)}
                </h2>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-md glow-card relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <span className="font-mono text-8xl">DATA</span>
          </div>
          <CashflowChart data={series} />
        </section>
      </div>
    </DashboardShell>
  );
}
