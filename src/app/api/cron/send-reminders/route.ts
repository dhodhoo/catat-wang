import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { env } from "@/lib/utils/env";

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
    const functionUrl = `${env.NEXT_PUBLIC_INSFORGE_URL}/functions/send-reminders`;
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.INSFORGE_SERVICE_KEY}`,
        ...(env.REMINDER_WEBHOOK_SECRET
          ? {
              "X-Reminder-Webhook-Secret": env.REMINDER_WEBHOOK_SECRET
            }
          : {})
      }
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: payload?.error || payload?.message || `HTTP ${response.status}`
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      result: payload
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal menjalankan cron reminder." },
      { status: 500 }
    );
  }
}
