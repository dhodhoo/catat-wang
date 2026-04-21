import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { createInsforgeServerClient } from "@/lib/insforge/server";
import { generateMonthlyReportForUser } from "@/lib/reports/service";

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const accessToken = await getAccessTokenFromCookies();

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = createInsforgeServerClient(accessToken);
    const { data, error } = await client.database
      .from("monthly_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("month_year", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCurrentUser();
    const accessToken = await getAccessTokenFromCookies();

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { month, year } = await req.json();
    const parsedMonth = Number(month);
    const parsedYear = Number(year);

    if (
      !Number.isInteger(parsedMonth) ||
      !Number.isInteger(parsedYear) ||
      parsedMonth < 1 ||
      parsedMonth > 12 ||
      parsedYear < 2000
    ) {
      return NextResponse.json({ message: "Parameter bulan/tahun tidak valid." }, { status: 400 });
    }

    const data = await generateMonthlyReportForUser({
      userId: user.id,
      month: parsedMonth,
      year: parsedYear
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
