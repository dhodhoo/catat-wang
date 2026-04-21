import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createInsforgeAdminClient } from "@/lib/insforge/server";
import { env } from "@/lib/utils/env";
import { sendWhatsAppTextMessage } from "@/lib/whatsapp/client";

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6
};

function getLocalReminderContext(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  const weekdayLabel = parts.find((part) => part.type === "weekday")?.value ?? "Sun";

  return {
    totalMinutes: hour * 60 + minute,
    weekday: WEEKDAY_MAP[weekdayLabel] ?? 0
  };
}

function toTotalMinutes(timeValue?: string | null) {
  if (!timeValue) return null;
  const hhmm = timeValue.slice(0, 5);
  const [h, m] = hhmm.split(":");
  const hour = Number(h);
  const minute = Number(m);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }
  return hour * 60 + minute;
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const tokenQuery = request.nextUrl.searchParams.get("token");

  const authorizedByHeader = Boolean(cronSecret && authHeader === `Bearer ${cronSecret}`);
  const authorizedByQuery = Boolean(cronSecret && tokenQuery === cronSecret);

  if (!authorizedByHeader && !authorizedByQuery) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!env.INSFORGE_SERVICE_KEY) {
    return NextResponse.json(
      { success: false, message: "INSFORGE_SERVICE_KEY belum dikonfigurasi." },
      { status: 500 }
    );
  }

  if (!env.WAHA_BASE_URL || !env.WAHA_API_KEY) {
    return NextResponse.json(
      { success: false, message: "WAHA belum dikonfigurasi untuk pengiriman reminder." },
      { status: 500 }
    );
  }

  try {
    const admin = createInsforgeAdminClient();
    const windowMinutes = 5;
    const dedupeMinutes = 10;

    const profilesResult = await admin.database
      .from("profiles")
      .select("id, whatsapp_phone_e164, reminder_frequency, reminder_time, reminder_weekday, timezone")
      .eq("reminder_enabled", true)
      .not("whatsapp_phone_e164", "is", null);

    if (profilesResult.error) {
      throw new Error(profilesResult.error.message);
    }

    let dueCount = 0;
    let sentCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (const profile of profilesResult.data ?? []) {
      const timezone = profile.timezone || "Asia/Jakarta";
      const scheduledMinutes = toTotalMinutes(profile.reminder_time);
      if (scheduledMinutes === null) {
        skippedCount += 1;
        continue;
      }

      const local = getLocalReminderContext(timezone);
      const deltaMinutes = local.totalMinutes - scheduledMinutes;
      const inWindow = deltaMinutes >= 0 && deltaMinutes < windowMinutes;

      const isDaily = profile.reminder_frequency === "daily" && inWindow;
      const isWeekly =
        profile.reminder_frequency === "weekly" &&
        inWindow &&
        profile.reminder_weekday === local.weekday;

      if (!isDaily && !isWeekly) {
        continue;
      }

      dueCount += 1;

      const dedupeSince = new Date(Date.now() - dedupeMinutes * 60 * 1000).toISOString();
      const recentLog = await admin.database
        .from("reminder_dispatch_logs")
        .select("id")
        .eq("user_id", profile.id)
        .eq("schedule_type", profile.reminder_frequency)
        .eq("status", "sent")
        .gte("created_at", dedupeSince)
        .limit(1)
        .maybeSingle();

      if (recentLog.data?.id) {
        skippedCount += 1;
        continue;
      }

      const messageText =
        profile.reminder_frequency === "weekly"
          ? "Jangan lupa catat transaksi minggu ini. Balas langsung di sini untuk mencatat."
          : "Sudah ada pengeluaran hari ini? Balas langsung di sini untuk mencatat.";

      try {
        const sendResult = await sendWhatsAppTextMessage(profile.whatsapp_phone_e164!, messageText);
        const sentLogResult = await admin.database.from("reminder_dispatch_logs").insert([
          {
            user_id: profile.id,
            schedule_type: profile.reminder_frequency,
            scheduled_for: new Date().toISOString(),
            sent_at: new Date().toISOString(),
            message_text: messageText,
            whatsapp_message_id: sendResult?.messages?.[0]?.id ?? null,
            status: "sent"
          }
        ]);
        if (sentLogResult.error) {
          throw new Error(sentLogResult.error.message);
        }
        sentCount += 1;
      } catch (error: any) {
        const failedLogResult = await admin.database.from("reminder_dispatch_logs").insert([
          {
            user_id: profile.id,
            schedule_type: profile.reminder_frequency,
            scheduled_for: new Date().toISOString(),
            message_text: messageText,
            status: "failed",
            error_message: error?.message ?? "failed"
          }
        ]);
        if (failedLogResult.error) {
          throw new Error(failedLogResult.error.message);
        }
        failedCount += 1;
      }
    }

    return NextResponse.json({
      success: true,
      result: {
        status: "ok",
        due: dueCount,
        sent: sentCount,
        failed: failedCount,
        skipped: skippedCount
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Gagal menjalankan cron reminder." },
      { status: 500 }
    );
  }
}
