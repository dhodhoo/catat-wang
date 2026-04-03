"use client";

import { useState } from "react";

export function VerifyEmailCard({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  async function verify() {
    setError(null);
    setMessage(null);
    setIsVerifying(true);

    const response = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, otp })
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.message ?? "Verifikasi email gagal.");
    } else {
      setMessage("Email berhasil diverifikasi.");
      window.location.href = "/dashboard";
    }

    setIsVerifying(false);
  }

  async function resend() {
    setError(null);
    setMessage(null);
    setIsResending(true);

    const response = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.message ?? "Gagal mengirim ulang kode.");
    } else {
      setMessage("Kode verifikasi baru sudah dikirim. Cek inbox dan folder spam.");
    }

    setIsResending(false);
  }

  return (
    <div className="surface-panel w-full max-w-xl p-8 sm:p-10">
      <div className="mb-8 border-b border-[#e8ddcc] pb-6">
        <p className="eyebrow">Verifikasi email</p>
        <h1 className="mt-3 text-3xl text-ink sm:text-[2.5rem]">Aktifkan akun Anda</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
          Masukkan email dan kode 6 digit. Jika kode belum masuk, Anda bisa mengirim ulang dari halaman ini.
        </p>
      </div>

      <form
        className="space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          await verify();
        }}
      >
        <label className="block space-y-2">
          <span className="field-label">Email</span>
          <input
            className="field-input"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@email.com"
            required
            type="email"
            value={email}
          />
        </label>

        <label className="block space-y-2">
          <span className="field-label">Kode OTP</span>
          <input
            className="field-input"
            inputMode="numeric"
            maxLength={6}
            name="otp"
            onChange={(event) => setOtp(event.target.value)}
            pattern="[0-9]{6}"
            placeholder="123456"
            required
            type="text"
            value={otp}
          />
        </label>

        <button className="button-primary w-full justify-center" disabled={isVerifying} type="submit">
          {isVerifying ? "Memverifikasi..." : "Verifikasi"}
        </button>

        <button
          className="button-secondary w-full justify-center"
          disabled={isResending || !email}
          onClick={() => {
            void resend();
          }}
          type="button"
        >
          {isResending ? "Mengirim ulang..." : "Kirim ulang kode"}
        </button>

        <p className="rounded-[1.25rem] border border-[#ece2d2] bg-[#fffaf1] px-4 py-3 text-sm leading-6 text-slate-500">
          Jika inbox kosong, cek folder spam, promotions, atau social. Pengiriman email bisa terlambat beberapa menit.
        </p>

        {message ? (
          <p className="rounded-[1.25rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-[1.25rem] border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
