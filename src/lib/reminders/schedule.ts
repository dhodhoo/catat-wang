export interface ReminderScheduleSyncResult {
  status: "global_scheduler_active";
  message: string;
}

export async function syncReminderSchedule(): Promise<ReminderScheduleSyncResult> {
  return {
    status: "global_scheduler_active",
    message: "Scheduler reminder membutuhkan trigger eksternal ke /api/cron/send-reminders."
  };
}
