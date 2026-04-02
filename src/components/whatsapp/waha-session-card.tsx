"use client";

import { useEffect, useState, useTransition } from "react";

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

  async function load() {
    const response = await fetch("/api/whatsapp/session", { cache: "no-store" });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.message ?? "Gagal mengambil status WAHA.");
      return;
    }

    setError(null);
    setData(payload);
  }

  useEffect(() => {
    startTransition(() => {
      void load();
    });
  }, []);

  async function mutate(action: "ensure" | "disconnect") {
    const response = await fetch("/api/whatsapp/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action })
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.message ?? "Gagal memproses session WAHA.");
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
    <div className="rounded-[1.75rem] bg-white p-6 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm text-slate-500">WAHA session</p>
          <h2 className="text-2xl font-semibold">{data?.session?.status ?? "Belum aktif"}</h2>
          <p className="text-sm text-slate-600">
            Session: <code>{data?.sessionName ?? "default"}</code>
          </p>
          <p className="text-sm text-slate-600">
            Webhook target: <code>{data?.webhookUrl ?? "/api/whatsapp/webhook"}</code>
          </p>
          {data?.session?.me?.id ? (
            <p className="text-sm text-slate-600">
              Nomor bot aktif: <strong>{data.session.me.id}</strong>
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white"
            disabled={isPending}
            onClick={() => mutate("ensure")}
            type="button"
          >
            {isPending ? "Memproses..." : "Siapkan / Refresh QR"}
          </button>
          <button
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
            disabled={isPending}
            onClick={() => mutate("disconnect")}
            type="button"
          >
            Putuskan session
          </button>
        </div>
      </div>

      {!data?.configured ? (
        <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          Isi <code>WAHA_BASE_URL</code> dan <code>WAHA_API_KEY</code> dulu agar app bisa bicara ke WAHA.
        </div>
      ) : null}

      {data?.qr ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-[220px_1fr] lg:items-center">
          <img
            alt="WAHA QR"
            className="rounded-3xl border border-slate-200 bg-white p-4"
            src={data.qr.startsWith("data:") ? data.qr : `data:image/png;base64,${data.qr}`}
          />
          <div className="space-y-2 text-sm text-slate-600">
            <p>Scan QR ini dari akun WhatsApp yang akan menjadi nomor bot pencatatan.</p>
            <p>Setelah status berubah menjadi tersambung, gunakan halaman ini untuk melihat nomor bot aktif.</p>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
