import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ReportsView } from "@/components/reports/reports-view";
import { requireCurrentUser } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { createInsforgeServerClient } from "@/lib/insforge/server";
import type { MonthlyReport } from "@/types/domain";

export default async function ReportsPage() {
  const user = await requireCurrentUser();
  const accessToken = (await getAccessTokenFromCookies()) ?? "";
  const client = createInsforgeServerClient(accessToken);
  
  const { data: reports, error } = await client.database
    .from("monthly_reports")
    .select("*")
    .eq("user_id", user.id)
    .order("month_year", { ascending: false });

  if (error) {
    console.error("Error fetching reports:", error);
  }

  const initialReports = (reports ?? []) as MonthlyReport[];

  return (
    <DashboardShell 
      title="Laporan Finansial" 
      subtitle="Analisis performa keuangan bulanan Anda berdasarkan data historis."
    >
      <ReportsView initialReports={initialReports} />
    </DashboardShell>
  );
}
