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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ phone })
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message ?? "Gagal membuat link code.");
    } else {
      setResult(data);
    }

    setIsLoading(false);
  }

  return (
    <div className="rounded-[1.75rem] bg-white p-6 shadow-card">
      <p className="text-sm text-slate-500">Hubungkan nomor user</p>
      <h2 className="mt-2 text-2xl font-semibold">Generate kode LINK</h2>
      <p className="mt-3 text-sm text-slate-600">
        Isi nomor WhatsApp Anda, lalu kirim kode ke nomor bot agar akun ini terhubung.
      </p>
      <div className="mt-5 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Nomor WhatsApp Anda</span>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-coral"
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+62812..."
            type="tel"
            value={phone}
          />
        </label>

        <button
          className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white"
          disabled={isLoading || !phone}
          onClick={() => {
            void generateCode();
          }}
          type="button"
        >
          {isLoading ? "Membuat kode..." : "Generate kode"}
        </button>

        {botNumber ? (
          <p className="text-sm text-slate-700">
            Nomor bot aktif: <strong>{botNumber}</strong>
          </p>
        ) : null}

        {result ? (
          <div className="rounded-2xl bg-moss/10 p-4 text-sm text-slate-700">
            <p>
              Kode Anda: <strong>{result.linkCode}</strong>
            </p>
            <p className="mt-2">Berlaku sampai: {new Date(result.expiresAt).toLocaleString("id-ID")}</p>
            <p className="mt-2">{result.instructions}</p>
          </div>
        ) : null}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
