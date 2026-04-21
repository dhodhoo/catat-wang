"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  async function handleLogout() {
    try {
      setIsSubmitting(true);
      await fetch("/api/auth/sign-out", {
        method: "POST"
      });
      router.push("/sign-in");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        className="button-secondary border-rose-200 bg-rose-50/70 px-4 py-3 text-rose-700 hover:border-rose-300 hover:text-rose-800"
        disabled={isSubmitting}
        onClick={() => setIsConfirmOpen(true)}
        type="button"
      >
        {isSubmitting ? "Keluar..." : "Keluar"}
      </button>

      {isConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(16,24,40,0.38)] p-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-lg p-6 sm:p-8">
            <p className="eyebrow">Konfirmasi logout</p>
            <h2 className="mt-2 text-2xl text-ink">Keluar dari akun sekarang?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Anda akan diarahkan ke halaman masuk dan perlu login kembali untuk melanjutkan.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                className="button-danger flex-1 justify-center"
                disabled={isSubmitting}
                onClick={() => {
                  void handleLogout().finally(() => setIsConfirmOpen(false));
                }}
                type="button"
              >
                {isSubmitting ? "Keluar..." : "Ya, logout"}
              </button>
              <button
                className="button-secondary justify-center"
                disabled={isSubmitting}
                onClick={() => setIsConfirmOpen(false)}
                type="button"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
