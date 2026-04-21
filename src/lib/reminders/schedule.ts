export interface ReminderScheduleSyncResult {
  status: "global_scheduler_active";
  message: string;
}

export async function syncReminderSchedule(): Promise<ReminderScheduleSyncResult> {
  return {
    status: "global_scheduler_active",
    message: "Scheduler reminder aktif via trigger eksternal 5-menitan ke /api/cron/send-reminders."
  };
}
