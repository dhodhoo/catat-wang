"use client";

import { useState } from "react";

export function ResetPasswordFlowCard({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  async function handleVerifyCode() {
    if (!email.trim() || !code.trim()) {
      setVerifyError("Email dan kode reset wajib diisi.");
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);
    setVerifyMessage(null);
    setSaveError(null);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/auth/reset-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() })
      });
      const data = await response.json();
      if (!response.ok) {
        setVerifyError(data.message ?? "Kode reset tidak valid.");
        return;
      }

      const verifiedToken = String(data.token ?? "");
      if (!verifiedToken) {
        setVerifyError("Token reset tidak ditemukan.");
        return;
      }

      setToken(verifiedToken);
      setVerifyMessage("Kode valid. Silakan masukkan password baru.");
    } catch {
      setVerifyError("Gagal memverifikasi kode reset.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleSaveNewPassword() {
    if (!token || !newPassword.trim()) {
      setSaveError("Password baru wajib diisi.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: newPassword.trim() })
      });
      const data = await response.json();
      if (!response.ok) {
        setSaveError(data.message ?? "Reset password gagal.");
        return;
      }

      setSaveMessage("Password baru berhasil disimpan. Mengarahkan ke halaman masuk...");
      setTimeout(() => {
        window.location.href = "/sign-in";
      }, 900);
    } catch {
      setSaveError("Reset password gagal.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="surface-panel glow-card w-full max-w-xl overflow-hidden p-8 sm:p-10">
      <div className="mb-8 border-b border-[#e8ddcc] pb-6">
        <div className="space-y-2">
          <p className="eyebrow">Reset password</p>
          <h1 className="text-3xl text-ink sm:text-[2.5rem]">Verifikasi kode reset</h1>
          <p className="max-w-md text-sm text-slate-600 sm:text-base">
            Masukkan kode dari email, lalu set password baru.
          </p>
        </div>
      </div>

      <div className="space-y-7">
        <section className="space-y-4">
          <label className="block space-y-2">
            <span className="field-label">Email</span>
            <input
              className="field-input"
              disabled={isVerifying || isSaving}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label className="block space-y-2">
            <span className="field-label">Kode reset</span>
            <input
              className="field-input"
              disabled={isVerifying || isSaving}
              onChange={(event) => setCode(event.target.value)}
              placeholder="123456"
              required
              value={code}
            />
          </label>

          <button
            className="button-primary w-full justify-center py-4 text-base"
            disabled={isVerifying || isSaving}
            onClick={() => void handleVerifyCode()}
            type="button"
          >
            {isVerifying ? "Memverifikasi..." : "Verifikasi kode"}
          </button>

          {verifyMessage ? (
            <p className="rounded-[1.25rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {verifyMessage}
            </p>
          ) : null}
          {verifyError ? (
            <p className="rounded-[1.25rem] border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {verifyError}
            </p>
          ) : null}
        </section>

        <section className="space-y-4 border-t border-[#e8ddcc] pt-7">
          <label className="block space-y-2">
            <span className="field-label">Password baru</span>
            <input
              className="field-input"
              disabled={!token || isSaving || isVerifying}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Masukkan password baru"
              required
              type="password"
              value={newPassword}
            />
          </label>

          <button
            className="button-primary w-full justify-center py-4 text-base disabled:opacity-60"
            disabled={!token || isSaving || isVerifying}
            onClick={() => void handleSaveNewPassword()}
            type="button"
          >
            {isSaving ? "Menyimpan..." : "Simpan password baru"}
          </button>

          {saveMessage ? (
            <p className="rounded-[1.25rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {saveMessage}
            </p>
          ) : null}
          {saveError ? (
            <p className="rounded-[1.25rem] border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {saveError}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
