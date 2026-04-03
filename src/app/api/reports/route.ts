import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { createInsforgeServerClient } from "@/lib/insforge/server";

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

    const client = createInsforgeServerClient(accessToken);
    const { data, error } = await client.functions.invoke("generate-monthly-report", {
      body: { month, year }
    });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
