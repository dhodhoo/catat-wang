"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ReminderSettingsFormProps {
  initialSettings: {
    reminder_enabled: boolean;
    reminder_frequency: "daily" | "weekly" | null;
    reminder_time: string | null;
    reminder_weekday: number | null;
  };
}

const weekdayOptions = [
  { value: 0, label: "Minggu" },
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" }
];

export function ReminderSettingsForm({ initialSettings }: ReminderSettingsFormProps) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialSettings.reminder_enabled);
  const [frequency, setFrequency] = useState<"daily" | "weekly">(initialSettings.reminder_frequency ?? "daily");
  const [time, setTime] = useState(initialSettings.reminder_time?.slice(0, 5) ?? "19:00");
  const [weekday, setWeekday] = useState<number>(initialSettings.reminder_weekday ?? 1);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    try {
      setIsSaving(true);
      setMessage(null);
      const response = await fetch("/api/reminders/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          enabled,
          frequency: enabled ? frequency : null,
          time: enabled ? time : null,
          weekday: enabled && frequency === "weekly" ? weekday : null
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Gagal menyimpan reminder.");
      }

      setMessage("Setting reminder berhasil disimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan reminder.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-[1.75rem] bg-white p-6 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Status reminder</p>
          <h2 className="mt-2 text-2xl font-semibold">{enabled ? "Aktif" : "Nonaktif"}</h2>
        </div>
        <button
          aria-pressed={enabled}
          className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${enabled ? "bg-moss" : "bg-slate-400"}`}
          onClick={() => setEnabled((current) => !current)}
          type="button"
        >
          {enabled ? "Matikan" : "Aktifkan"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="reminder-frequency">
            Frekuensi
          </label>
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400 disabled:bg-slate-50"
            disabled={!enabled}
            id="reminder-frequency"
            onChange={(event) => setFrequency(event.target.value as "daily" | "weekly")}
            value={frequency}
          >
            <option value="daily">Harian</option>
            <option value="weekly">Mingguan</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="reminder-time">
            Jam reminder
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400 disabled:bg-slate-50"
            disabled={!enabled}
            id="reminder-time"
            onChange={(event) => setTime(event.target.value)}
            type="time"
            value={time}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="reminder-weekday">
            Hari mingguan
          </label>
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400 disabled:bg-slate-50"
            disabled={!enabled || frequency !== "weekly"}
            id="reminder-weekday"
            onChange={(event) => setWeekday(Number(event.target.value))}
            value={weekday}
          >
            {weekdayOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-6 rounded-2xl bg-sand p-4 text-sm text-slate-700">
        Scheduler global InsForge sudah aktif. Halaman ini mengubah preferensi reminder di profile Anda.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <button
          className="rounded-full bg-moss px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving}
          onClick={handleSave}
          type="button"
        >
          {isSaving ? "Menyimpan..." : "Simpan reminder"}
        </button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </div>
    </div>
  );
}
