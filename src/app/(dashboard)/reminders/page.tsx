import { ReminderSettingsForm } from "@/components/reminders/reminder-settings-form";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireCurrentUser } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { getReminderSettings } from "@/lib/reminders/service";

export default async function RemindersPage() {
  const user = await requireCurrentUser();
  const accessToken = (await getAccessTokenFromCookies()) ?? "";
  const settings = await getReminderSettings(accessToken, user.id).catch(() => ({
    reminder_enabled: false,
    reminder_frequency: null,
    reminder_time: null,
    reminder_weekday: null
  }));

  return (
    <DashboardShell title="Reminder WhatsApp" subtitle="Atur reminder harian atau mingguan agar pencatatan tetap konsisten.">
      <ReminderSettingsForm initialSettings={settings} />
    </DashboardShell>
  );
}
