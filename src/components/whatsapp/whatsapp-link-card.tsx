"use client";

import { useState } from "react";
import { KeyRound, Phone, Send } from "lucide-react";

function toWaMeNumber(phone?: string | null) {
  return (phone ?? "").replace(/[^\d]/g, "");
}

export function WhatsAppLinkCard({
  defaultPhone = "",
  botNumber,
  canManageWaha = false
}: {
  defaultPhone?: string;
  botNumber?: string | null;
  canManageWaha?: boolean;
}) {
  const [phone, setPhone] = useState(defaultPhone);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    linkCode: string;
    expiresAt: string;
    instructions: string;
  } | null>(null);
  const botNumberDigits = toWaMeNumber(botNumber);
  const autoSendLink = result?.linkCode && botNumberDigits
    ? `https://wa.me/${botNumberDigits}?text=${encodeURIComponent(result.linkCode)}`
    : null;

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
    <div className="surface-card p-6 sm:p-7">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="eyebrow">Verifikasi nomor</p>
          <h2 className="mt-3 text-3xl text-ink">Hubungkan nomor pribadi Anda ke workspace ini.</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            {canManageWaha
              ? "Setelah sesi WhatsApp aktif, masukkan nomor Anda untuk mendapatkan kode verifikasi yang akan menghubungkan chat dengan akun CatatWang."
              : "Masukkan nomor Anda untuk mendapatkan kode verifikasi, lalu kirim kode itu ke bot WhatsApp yang dibagikan admin workspace."}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <article className="surface-muted p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-moss shadow-sm">
                <Phone className="h-5 w-5" />
              </span>
              <p className="mt-5 text-sm text-slate-500">{canManageWaha ? "Nomor bot aktif" : "Akses bot"}</p>
              <p className="mt-2 text-xl text-ink">
                {botNumber ? botNumber : canManageWaha ? "Belum terdeteksi" : "Belum tersedia"}
              </p>
            </article>

            <article className="surface-muted p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-coral shadow-sm">
                <Send className="h-5 w-5" />
              </span>
              <p className="mt-5 text-sm text-slate-500">Langkah berikutnya</p>
              <p className="mt-2 text-xl text-ink">
                {botNumber ? "Klik tombol kirim otomatis setelah kode muncul." : "Nomor bot belum tersedia, hubungi admin workspace."}
              </p>
            </article>
          </div>
        </div>

        <div className="surface-muted p-5">
          <label className="space-y-2">
            <span className="field-label">Nomor WhatsApp</span>
            <input
              className="field-input"
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+62812xxxxxxx"
              type="tel"
              value={phone}
            />
          </label>

          <button className="button-primary mt-5 w-full justify-center" disabled={isLoading || !phone} onClick={() => void generateCode()}>
            {isLoading ? "Memproses..." : "Dapatkan kode verifikasi"}
          </button>

          {result && (
            <div className="mt-5 rounded-[1.5rem] border border-emerald-100 bg-white px-5 py-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Kode verifikasi</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-moss">
                      <KeyRound className="h-5 w-5" />
                    </span>
                    <div className="text-3xl tracking-[0.22em] text-ink">{result.linkCode}</div>
                  </div>
                </div>
                <p className="text-right text-xs leading-5 text-slate-500">
                  Berlaku sampai
                  <br />
                  {new Date(result.expiresAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>

              <div className="mt-5 rounded-[1.25rem] bg-[#fffaf1] px-4 py-3 text-sm leading-6 text-slate-600">
                {result.instructions}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {autoSendLink ? (
                  <a
                    className="button-primary justify-center"
                    href={autoSendLink}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Kirim LINK ke WhatsApp bot
                  </a>
                ) : (
                  <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    Nomor bot belum tersedia, jadi kode masih perlu dikirim manual.
                  </p>
                )}
              </div>
            </div>
          )}

          {error && <p className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        </div>
      </div>
    </div>
  );
}
