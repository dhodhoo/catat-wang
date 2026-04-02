import { createInsforgeServerClient } from "@/lib/insforge/server";
import { syncReminderSchedule } from "@/lib/reminders/schedule";

export async function getReminderSettings(accessToken: string, userId: string) {
  const client = createInsforgeServerClient(accessToken);
  const { data, error } = await client.database
    .from("profiles")
    .select("reminder_enabled, reminder_frequency, reminder_time, reminder_weekday")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    throw new Error(error?.message ?? "Setting reminder tidak ditemukan.");
  }

  return data;
}

export async function updateReminderSettings(
  accessToken: string,
  userId: string,
  payload: {
    enabled: boolean;
    frequency: "daily" | "weekly" | null;
    time: string | null;
    weekday: number | null;
  }
) {
  const client = createInsforgeServerClient(accessToken);
  const { data, error } = await client.database
    .from("profiles")
    .update({
      reminder_enabled: payload.enabled,
      reminder_frequency: payload.frequency,
      reminder_time: payload.time,
      reminder_weekday: payload.weekday
    })
    .eq("id", userId)
    .select("reminder_enabled, reminder_frequency, reminder_time, reminder_weekday")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Gagal menyimpan setting reminder.");
  }

  const scheduleSync = await syncReminderSchedule();
  return { settings: data, scheduleSync };
}
