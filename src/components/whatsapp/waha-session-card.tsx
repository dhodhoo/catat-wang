"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { CheckCircle2, QrCode, RefreshCw, Unplug } from "lucide-react";

interface SessionState {
  provider?: "waha" | "baileys";
  configured: boolean;
  missingConfig?: string[];
  webhookSecretConfigured?: boolean;
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

interface ApiErrorPayload {
  message?: string;
}

async function readJsonSafe<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
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
    const payload = await readJsonSafe<SessionState & ApiErrorPayload>(response);
    if (!response.ok) {
      setError(payload?.message ?? "Gagal mengambil status WhatsApp.");
      return;
    }
    if (!payload) {
      setError("Gagal membaca respons status WhatsApp.");
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
    const payload = await readJsonSafe<
      { sessionName?: string; session?: SessionState["session"]; qr?: string | null } & ApiErrorPayload
    >(response);
    if (!response.ok) {
      setError(payload?.message ?? "Gagal memproses koneksi WhatsApp.");
      return;
    }
    if (!payload) {
      setError("Gagal membaca respons proses koneksi WhatsApp.");
      return;
    }
    setError(null);
    setData((current) => ({
      provider: current?.provider,
      configured: current?.configured ?? true,
      missingConfig: current?.missingConfig ?? [],
      webhookSecretConfigured: current?.webhookSecretConfigured ?? false,
      webhookUrl: current?.webhookUrl ?? "",
      sessionName: payload.sessionName ?? current?.sessionName ?? "default",
      session: payload.session ?? null,
      qr: payload.qr ?? null
    }));
    await load();
  }

  const statusTone = useMemo(() => {
    const status = data?.session?.status ?? "TERPUTUS";
    if (status === "WORKING") return "bg-emerald-50 text-emerald-700";
    if (status === "SCAN_QR_CODE" || status === "STARTING") return "bg-amber-50 text-amber-700";
    return "bg-rose-50 text-rose-700";
  }, [data?.session?.status]);

  const providerLabel = data?.provider === "baileys" ? "Baileys" : "WAHA";

  return (
    <div className="surface-panel p-6 sm:p-7">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-4 py-2 text-sm font-medium ${statusTone}`}>
            {data?.session?.status ?? "TERPUTUS"}
          </span>
          <span className="status-chip">
            <span className="h-2 w-2 rounded-full bg-moss" />
            Sesi {data?.sessionName ?? "default"}
          </span>
        </div>

        <div>
          <p className="eyebrow">Koneksi {providerLabel}</p>
          <h2 className="panel-title">Nyalakan sesi lalu scan QR untuk menghubungkan bot.</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="button-primary gap-2" disabled={isPending} onClick={() => void mutate("ensure")}>
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            {isPending ? "Memproses..." : "Sambungkan / scan QR"}
          </button>
          <button className="button-secondary gap-2" disabled={isPending} onClick={() => void mutate("disconnect")}>
            <Unplug className="h-4 w-4" />
            Putuskan koneksi
          </button>
        </div>

        {data?.qr ? (
          <div className="rounded-xl border border-[#e7e5e4] bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-moss">
                <QrCode className="h-5 w-5" />
              </span>
              <div>
                <p className="field-label">QR siap discan</p>
                <p className="mt-1 text-sm text-slate-600">Buka WhatsApp lalu scan kode di bawah ini.</p>
              </div>
            </div>

            <img
              alt={`${providerLabel} QR`}
              className="mt-4 aspect-square w-full rounded-lg border border-[#e7e5e4] bg-white p-4"
              src={data.qr.startsWith("data:") ? data.qr : `data:image/png;base64,${data.qr}`}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#e7e5e4] bg-[#fafaf9] px-5 py-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-moss shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              QR akan muncul di sini ketika sesi meminta scan dari perangkat Anda.
            </p>
          </div>
        )}

        {!data?.configured && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <p>Konfigurasi API WhatsApp belum lengkap di environment variables.</p>
            {data?.missingConfig?.length ? <p className="mt-1">Field wajib: {data.missingConfig.join(", ")}</p> : null}
          </div>
        )}
      </div>

      {error && <p className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
    </div>
  );
}
