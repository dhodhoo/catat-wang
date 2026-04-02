export interface ReminderScheduleSyncResult {
  status: "global_scheduler_active";
  message: string;
}

export async function syncReminderSchedule(): Promise<ReminderScheduleSyncResult> {
  return {
    status: "global_scheduler_active",
    message: "Global scheduler send-reminders aktif. Perubahan reminder cukup disimpan di profile user."
  };
}
