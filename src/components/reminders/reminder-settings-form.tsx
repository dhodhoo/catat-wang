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
    } catch (error) {
      setMessage("Gagal menyimpan setting.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-md glow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <span className="font-mono text-4xl uppercase">PENGINGAT</span>
        </div>
        
        <div className="flex items-center justify-between gap-6 mb-10 border-b border-slate-800 pb-8">
          <div className="space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-500">Otomatisasi</p>
            <h2 className="text-3xl font-bold tracking-tight">{enabled ? "PENGINGAT AKTIF" : "PENGINGAT MATI"}</h2>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`rounded-xl px-6 py-3 font-bold text-xs tracking-widest transition-all active:scale-95 ${enabled ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
          >
            {enabled ? "MATIKAN" : "NYALAKAN"}
          </button>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-wider text-slate-500">FREKUENSI</label>
            <select
              className="w-full bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 text-slate-200 outline-none focus:border-emerald-500/50 transition-all appearance-none disabled:opacity-30"
              disabled={!enabled}
              onChange={(e) => setFrequency(e.target.value as any)}
              value={frequency}
            >
              <option value="daily">HARIAN</option>
              <option value="weekly">MINGGUAN</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-wider text-slate-500">WAKTU PENGINGAT</label>
            <input
              className="w-full bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 text-slate-200 outline-none focus:border-emerald-500/50 transition-all disabled:opacity-30"
              disabled={!enabled}
              onChange={(e) => setTime(e.target.value)}
              type="time"
              value={time}
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-wider text-slate-500">HARI</label>
            <select
              className="w-full bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 text-slate-200 outline-none focus:border-emerald-500/50 transition-all appearance-none disabled:opacity-10"
              disabled={!enabled || frequency !== "weekly"}
              onChange={(e) => setWeekday(Number(e.target.value))}
              value={weekday}
            >
              {weekdayOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-10 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 border-dashed">
          <p className="font-mono text-[10px] text-emerald-500/60 leading-relaxed uppercase tracking-tighter">
            Catatan: Pengingat dikirim melalui WhatsApp sesuai dengan jadwal yang Anda tentukan di halaman ini.
          </p>
        </div>

        <div className="mt-10 flex items-center gap-6">
          <button
            className="rounded-xl bg-emerald-500 px-8 py-4 font-bold text-slate-950 hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50"
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? "MENYIMPAN..." : "SIMPAN SETTING"}
          </button>
          {message && <p className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest">{message}</p>}
        </div>
      </section>
    </div>
  );
}
