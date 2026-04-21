import { ReminderSettingsForm } from "@/components/reminders/reminder-settings-form";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireCurrentUser } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { getReminderSettings } from "@/lib/reminders/service";

export default async function SettingsRemindersPage() {
  const user = await requireCurrentUser();
  const accessToken = (await getAccessTokenFromCookies()) ?? "";
  const settings = await getReminderSettings(accessToken, user.id).catch(() => ({
    reminder_enabled: false,
    reminder_frequency: null,
    reminder_time: null,
    reminder_weekday: null
  }));

  return (
    <DashboardShell title="Reminder WhatsApp">
      <ReminderSettingsForm initialSettings={settings} />
    </DashboardShell>
  );
}
