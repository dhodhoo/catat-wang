"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BellRing, CalendarDays, Clock3 } from "lucide-react";

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
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <p className="eyebrow">Reminder otomatis</p>
            <h2 className="text-3xl text-ink">Bangun kebiasaan mencatat dengan jadwal yang terasa masuk akal.</h2>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Reminder yang terlalu agresif bikin cepat diabaikan. Karena itu, halaman ini dirancang untuk membantu
              Anda memilih jadwal yang realistis dan mudah dipatuhi.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Status", value: enabled ? "Aktif" : "Nonaktif", icon: BellRing },
                { label: "Frekuensi", value: enabled ? (frequency === "daily" ? "Harian" : "Mingguan") : "-", icon: CalendarDays },
                { label: "Waktu", value: enabled ? time : "-", icon: Clock3 }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.label} className="surface-muted p-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-moss shadow-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-5 text-sm text-slate-500">{item.label}</p>
                    <p className="mt-2 text-2xl text-ink">{item.value}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="surface-muted p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Jadwal aktif</p>
                <h3 className="mt-3 text-2xl text-ink">{enabled ? "Reminder menyala" : "Reminder dimatikan"}</h3>
              </div>
              <button
                className={enabled ? "button-primary" : "button-secondary"}
                onClick={() => setEnabled(!enabled)}
                type="button"
              >
                {enabled ? "Matikan" : "Nyalakan"}
              </button>
            </div>

            <p className="mt-4 rounded-[1.25rem] border border-[#ece2d2] bg-white/70 px-4 py-3 text-sm leading-6 text-slate-600">
              {scheduleText}
            </p>

            <div className="mt-5 grid gap-4">
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

              <button className="button-primary mt-2 w-full justify-center" disabled={isSaving} onClick={handleSave}>
                {isSaving ? "Menyimpan..." : "Simpan pengaturan"}
              </button>
            </div>

            {message && (
              <p className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
