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
    <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-card">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Verifikasi email</h1>
        <p className="mt-2 text-sm text-slate-500">
          Masukkan email dan kode 6 digit. Jika kode belum masuk, kirim ulang dari halaman ini.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          await verify();
        }}
      >
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-coral"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@email.com"
            required
            type="email"
            value={email}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Kode OTP</span>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-coral"
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

        <button
          className="w-full rounded-2xl bg-coral px-4 py-3 font-semibold text-white"
          disabled={isVerifying}
          type="submit"
        >
          {isVerifying ? "Memverifikasi..." : "Verifikasi"}
        </button>

        <button
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700"
          disabled={isResending || !email}
          onClick={() => {
            void resend();
          }}
          type="button"
        >
          {isResending ? "Mengirim ulang..." : "Kirim ulang kode"}
        </button>

        <p className="text-xs text-slate-500">
          Jika inbox kosong, cek folder spam, promotions, atau social. Pengiriman bisa terlambat beberapa menit.
        </p>

        {message ? <p className="text-sm text-moss">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </div>
  );
}
