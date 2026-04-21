"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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

  const scheduleText = useMemo(() => {
    if (!enabled) return "Pengingat sedang dimatikan.";
    if (frequency === "daily") return `Pengingat akan dikirim setiap hari pukul ${time}.`;
    return `Pengingat akan dikirim setiap ${weekdayOptions.find((item) => item.value === weekday)?.label} pukul ${time}.`;
  }, [enabled, frequency, time, weekday]);

  async function handleSave() {
    try {
      setIsSaving(true);
      setMessage(null);
      const response = await fetch("/api/reminders/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          frequency: enabled ? frequency : null,
          time: enabled ? time : null,
          weekday: enabled && frequency === "weekly" ? weekday : null
        })
      });
      if (!response.ok) throw new Error("Gagal menyimpan setting.");
      setMessage("Setting berhasil disimpan.");
      router.refresh();
    } catch {
      setMessage("Gagal menyimpan setting.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="surface-panel p-6 sm:p-7">
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Reminder otomatis</p>
              <h2 className="panel-title">{enabled ? "Reminder menyala" : "Reminder dimatikan"}</h2>
              <p className="panel-copy max-w-2xl">{scheduleText}</p>
            </div>
            <button
              className={enabled ? "button-primary" : "button-secondary"}
              onClick={() => setEnabled(!enabled)}
              type="button"
            >
              {enabled ? "Matikan" : "Nyalakan"}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2">
              <span className="field-label">Frekuensi</span>
              <select
                className="field-select disabled:opacity-50"
                disabled={!enabled}
                onChange={(event) => setFrequency(event.target.value as "daily" | "weekly")}
                value={frequency}
              >
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="field-label">Waktu pengingat</span>
              <input
                className="field-input disabled:opacity-50"
                disabled={!enabled}
                onChange={(event) => setTime(event.target.value)}
                step={300}
                type="time"
                value={time}
              />
            </label>

            <label className="space-y-2">
              <span className="field-label">Hari</span>
              <select
                className="field-select disabled:opacity-40"
                disabled={!enabled || frequency !== "weekly"}
                onChange={(event) => setWeekday(Number(event.target.value))}
                value={weekday}
              >
                {weekdayOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button className="button-primary mt-1 w-full justify-center sm:w-auto" disabled={isSaving} onClick={handleSave}>
            {isSaving ? "Menyimpan..." : "Simpan pengaturan"}
          </button>

          {message && (
            <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
