"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <button
      className="rounded-xl px-5 py-2.5 text-xs font-bold tracking-wide transition-all text-rose-500 hover:text-rose-400 active:scale-95 disabled:opacity-50"
      disabled={isSubmitting}
      onClick={handleLogout}
      type="button"
    >
      {isSubmitting ? "KELUAR..." : "KELUAR"}
    </button>
  );
}
