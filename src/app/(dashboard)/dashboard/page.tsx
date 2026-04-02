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
      title="Dashboard cashflow"
      subtitle="Lihat pemasukan, pengeluaran, dan ritme keuangan Anda dalam satu layar."
    >
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.75rem] bg-white p-6 shadow-card">
          <p className="text-sm text-slate-500">Pemasukan bulan ini</p>
          <h2 className="mt-3 text-3xl font-semibold text-moss">{formatCurrency(summary.incomeTotal)}</h2>
        </article>
        <article className="rounded-[1.75rem] bg-white p-6 shadow-card">
          <p className="text-sm text-slate-500">Pengeluaran bulan ini</p>
          <h2 className="mt-3 text-3xl font-semibold text-coral">{formatCurrency(summary.expenseTotal)}</h2>
        </article>
        <article className="rounded-[1.75rem] bg-white p-6 shadow-card">
          <p className="text-sm text-slate-500">Net cashflow</p>
          <h2 className="mt-3 text-3xl font-semibold">{formatCurrency(summary.netCashflow)}</h2>
        </article>
      </section>
      <section className="mt-8">
        <CashflowChart data={series} />
      </section>
    </DashboardShell>
  );
}
