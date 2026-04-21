import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createInsforgeAdminClient } from "@/lib/insforge/server";
import { generateMonthlyReportForUser, getMonthDateRange } from "@/lib/reports/service";
import { env } from "@/lib/utils/env";

function getPreviousMonthInJakarta() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit"
  }).formatToParts(new Date());

  const currentYear = Number(parts.find((part) => part.type === "year")?.value ?? "0");
  const currentMonth = Number(parts.find((part) => part.type === "month")?.value ?? "0");

  if (currentMonth === 1) {
    return { month: 12, year: currentYear - 1 };
  }

  return { month: currentMonth - 1, year: currentYear };
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!env.INSFORGE_SERVICE_KEY) {
    return NextResponse.json(
      { success: false, message: "INSFORGE_SERVICE_KEY belum dikonfigurasi." },
      { status: 500 }
    );
  }

  try {
    const { month, year } = getPreviousMonthInJakarta();
    const { startDate, endDate } = getMonthDateRange(year, month);

    const client = createInsforgeAdminClient();
    const { data: transactionRows, error: transactionError } = await client.database
      .from("transactions")
      .select("user_id")
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate);

    if (transactionError) {
      throw transactionError;
    }

    const userIds = Array.from(new Set((transactionRows ?? []).map((row: any) => row.user_id).filter(Boolean)));

    if (userIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Tidak ada transaksi pada bulan target, tidak ada laporan yang digenerate.",
        period: { month, year },
        processedUsers: 0
      });
    }

    const settled = await Promise.allSettled(
      userIds.map(async (userId) => {
        await generateMonthlyReportForUser({
          userId,
          month,
          year
        });

        return { userId };
      })
    );

    const succeeded = settled
      .filter((item): item is PromiseFulfilledResult<{ userId: string }> => item.status === "fulfilled")
      .map((item) => item.value.userId);

    const failed = settled
      .filter((item): item is PromiseRejectedResult => item.status === "rejected")
      .map((item) => item.reason instanceof Error ? item.reason.message : String(item.reason));

    return NextResponse.json({
      success: failed.length === 0,
      period: { month, year },
      processedUsers: userIds.length,
      succeeded: succeeded.length,
      failed: failed.length,
      errors: failed
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal menjalankan cron laporan bulanan." },
      { status: 500 }
    );
  }
}
