"use client";

import { useEffect, useRef, useState, useTransition } from "react";

interface SessionState {
  configured: boolean;
  sessionName: string;
  webhookUrl: string;
  session: {
    name: string;
    status: string;
    me?: {
      id?: string;
      pushName?: string;
    } | null;
  } | null;
  qr: string | null;
}

export function WahaSessionCard() {
  const [data, setData] = useState<SessionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearPoll() {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }

  async function load() {
    const response = await fetch("/api/whatsapp/session", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      setError("Gagal mengambil status WhatsApp.");
      return;
    }
    setError(null);
    setData(payload);

    const status = payload.session?.status;
    const shouldPoll = status === "STARTING" || (status === "SCAN_QR_CODE" && !payload.qr);
    clearPoll();
    if (shouldPoll) {
      pollTimeoutRef.current = setTimeout(() => {
        void load();
      }, 2000);
    }
  }

  useEffect(() => {
    startTransition(() => {
      void load();
    });
    return () => clearPoll();
  }, []);

  async function mutate(action: "ensure" | "disconnect") {
    const response = await fetch("/api/whatsapp/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    const payload = await response.json();
    if (!response.ok) {
      setError("Gagal memproses koneksi WhatsApp.");
      return;
    }
    setError(null);
    setData((current) => ({
      configured: current?.configured ?? true,
      webhookUrl: current?.webhookUrl ?? "",
      sessionName: payload.sessionName ?? current?.sessionName ?? "default",
      session: payload.session ?? null,
      qr: payload.qr ?? null
    }));
    await load();
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-10 backdrop-blur-md glow-card relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <span className="font-mono text-4xl uppercase">KONEKSI</span>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-500">Status WhatsApp</p>
            <h2 className="text-3xl font-bold tracking-tight text-white">{data?.session?.status ?? "TERPUTUS"}</h2>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase text-slate-500">SESI:</span>
              <code className="bg-slate-950 px-2 py-0.5 rounded text-[10px] border border-slate-800 text-emerald-500">{data?.sessionName ?? "default"}</code>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase text-slate-500">WEBHOOK:</span>
              <code className="bg-slate-950 px-2 py-0.5 rounded text-[10px] border border-slate-800 text-slate-400">{data?.webhookUrl ?? "/api/whatsapp/webhook"}</code>
            </div>
            {data?.session?.me?.id && (
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase text-slate-500">NOMOR BOT:</span>
                <span className="text-[10px] font-bold text-slate-200">{data.session.me.id}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            className="rounded-xl bg-emerald-500 px-6 py-3 font-bold text-xs tracking-tight text-slate-950 hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50"
            disabled={isPending}
            onClick={() => mutate("ensure")}
          >
            {isPending ? "MEMPROSES..." : "SAMBUNGKAN / SCAN QR"}
          </button>
          <button
            className="rounded-xl border border-slate-800 bg-slate-950 px-6 py-3 font-bold text-xs tracking-tight text-slate-400 hover:text-rose-400 hover:border-rose-900 transition-all active:scale-95 disabled:opacity-50"
            disabled={isPending}
            onClick={() => mutate("disconnect")}
          >
            PUTUSKAN KONEKSI
          </button>
        </div>
      </div>

      {data && !data.configured && (
        <div className="mt-8 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 border-dashed">
          <p className="font-mono text-[10px] text-amber-500 leading-relaxed uppercase">
            Catatan: Konfigurasi API WhatsApp belum lengkap di environment variables.
          </p>
        </div>
      )}

      {data?.qr && (
        <div className="mt-10 grid gap-8 lg:grid-cols-[220px_1fr] lg:items-center p-8 rounded-3xl bg-slate-950 border border-slate-800 animate-in zoom-in duration-500">
          <div className="relative group">
            <div className="absolute -inset-2 bg-emerald-500/10 blur-xl group-hover:bg-emerald-400/20 transition-all" />
            <img
              alt="WAHA QR"
              className="relative rounded-2xl border border-slate-800 bg-white p-4 w-full aspect-square"
              src={data.qr.startsWith("data:") ? data.qr : `data:image/png;base64,${data.qr}`}
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest">Menunggu Scan QR</p>
            </div>
            <p className="text-sm font-medium text-slate-300 leading-relaxed">
              Scan QR ini dengan aplikasi WhatsApp Anda untuk menyambungkan bot pencatatan.
            </p>
          </div>
        </div>
      )}

      {error && <p className="mt-6 font-mono text-[10px] text-rose-500 uppercase tracking-wider">{error}</p>}
    </div>
  );
}
