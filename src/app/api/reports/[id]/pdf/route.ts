import { NextResponse } from "next/server";
import { requireCurrentUserApi } from "@/lib/insforge/auth";
import { createInsforgeAdminClient } from "@/lib/insforge/server";
import { getMonthPeriodFromMonthYear, renderMonthlyReportPdf } from "@/lib/reports/pdf";
import { getMonthlyReportTransactions } from "@/lib/reports/service";
import type { MonthlyReport } from "@/types/domain";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCurrentUserApi();
    const { id } = await params;
    const client = createInsforgeAdminClient();

    const { data: report, error } = await client.database
      .from("monthly_reports")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!report) {
      return NextResponse.json({ message: "Laporan tidak ditemukan." }, { status: 404 });
    }

    const monthYear = String((report as MonthlyReport).month_year);
    const period = getMonthPeriodFromMonthYear(monthYear);
    const transactions = await getMonthlyReportTransactions({
      userId: user.id,
      startDate: period.startDate,
      endDate: period.endDate
    });

    const pdfBuffer = await renderMonthlyReportPdf({
      report: report as MonthlyReport,
      userName: user.profile?.name ?? user.email ?? null,
      periodLabel: period.periodLabel,
      transactions
    });

    const fileName = `laporan-${period.startDate}.pdf`;
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error: any) {
    const message = error?.message ?? "Gagal membuat PDF laporan.";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}
