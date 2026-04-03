"use client";

import { useState } from "react";

export function WhatsAppLinkCard({
  defaultPhone = "",
  botNumber
}: {
  defaultPhone?: string;
  botNumber?: string | null;
}) {
  const [phone, setPhone] = useState(defaultPhone);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    linkCode: string;
    expiresAt: string;
    instructions: string;
  } | null>(null);

  async function generateCode() {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const response = await fetch("/api/whatsapp/link/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });

    const data = await response.json();
    if (!response.ok) {
      setError("Gagal mendapatkan kode verifikasi.");
    } else {
      setResult(data);
    }
    setIsLoading(false);
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-10 backdrop-blur-md glow-card relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <span className="font-mono text-4xl uppercase">HUBUNGKAN</span>
      </div>

      <div className="mb-10 space-y-1">
        <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-500">Verifikasi Nomor</p>
        <h2 className="text-3xl font-bold tracking-tight text-white">Hubungkan Akun</h2>
        <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-md">
          Masukkan nomor WhatsApp Anda untuk mendapatkan kode verifikasi agar bisa mencatat transaksi.
        </p>
      </div>

      <div className="space-y-6 max-w-md">
        <label className="block space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">NOMOR WHATSAPP</span>
          <input
            className="w-full bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 text-slate-200 outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700 font-mono"
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+62812XXXX"
            type="tel"
            value={phone}
          />
        </label>

        <button
          className="rounded-xl bg-emerald-500 px-8 py-3.5 font-bold text-xs tracking-tight text-slate-950 hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50"
          disabled={isLoading || !phone}
          onClick={() => { void generateCode(); }}
        >
          {isLoading ? "MEMPROSES..." : "DAPATKAN KODE"}
        </button>

        {botNumber && (
          <div className="flex items-center gap-3 py-2">
            <span className="font-mono text-[10px] uppercase text-slate-500">NOMOR BOT:</span>
            <span className="text-[10px] font-bold text-emerald-500/80 tracking-tighter">{botNumber}</span>
          </div>
        )}

        {result && (
          <div className="mt-8 p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-500">Kode Verifikasi</p>
                <div className="text-3xl font-mono font-bold text-white tracking-widest mt-1">{result.linkCode}</div>
              </div>
              <div className="text-[10px] font-mono text-slate-500 text-right uppercase">
                BERLAKU SAMPAI:<br/>
                {new Date(result.expiresAt).toLocaleTimeString()}
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium pt-4 border-t border-slate-800/50 italic">
              {result.instructions}
            </p>
          </div>
        )}

        {error && <p className="text-xs font-mono text-rose-500 uppercase tracking-tight">{error}</p>}
      </div>
    </div>
  );
}
