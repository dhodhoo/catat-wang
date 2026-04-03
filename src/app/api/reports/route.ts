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

    // Use Service Key for Trusted Server-to-Server invocation
    const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
    const serviceKey = process.env.INSFORGE_SERVICE_KEY;
    
    if (!serviceKey) {
      console.error("INSFORGE_SERVICE_KEY is missing in environment variables!");
      return NextResponse.json({ message: "Konfigurasi server (Service Key) tidak ditemukan" }, { status: 500 });
    }

    const functionUrl = `${baseUrl}/functions/generate-monthly-report`;
    
    console.log("Securely fetching report function with Service Key for User:", user.id);
    
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}` // Trust established via Service Key
      },
      body: JSON.stringify({ 
        userId: user.id, // Trusted ID passed from secure server
        month, 
        year 
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Function fetch error:", response.status, errorText);
      return NextResponse.json({ 
        message: `Gagal memicu fungsi (${response.status}): ${errorText.substring(0, 100)}`,
        status: response.status 
      }, { status: 500 });
    }

    const data = await response.json();
    console.log("Function response data:", data);

    if (data?.error) {
       console.error("Function business logic error:", data.error);
       return NextResponse.json({ message: "Gagal generate: " + data.error, details: data }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("API Route error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
