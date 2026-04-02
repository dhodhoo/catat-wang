import { requireCurrentUserApi } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { getReminderSettings, updateReminderSettings } from "@/lib/reminders/service";
import { fail, ok } from "@/lib/utils/http";

export async function GET() {
  try {
    const user = await requireCurrentUserApi();
    const accessToken = (await getAccessTokenFromCookies()) ?? "";
    const settings = await getReminderSettings(accessToken, user.id);
    return ok({
      enabled: settings.reminder_enabled,
      frequency: settings.reminder_frequency,
      time: settings.reminder_time,
      weekday: settings.reminder_weekday
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Gagal mengambil reminder settings.");
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireCurrentUserApi();
    const accessToken = (await getAccessTokenFromCookies()) ?? "";
    const body = (await request.json()) as {
      enabled?: boolean;
      frequency?: "daily" | "weekly" | null;
      time?: string | null;
      weekday?: number | null;
    };

    const result = await updateReminderSettings(accessToken, user.id, {
      enabled: Boolean(body.enabled),
      frequency: body.frequency ?? null,
      time: body.time ?? null,
      weekday: body.weekday ?? null
    });

    return ok({ status: "ok", ...result });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Gagal menyimpan reminder settings.");
  }
}
