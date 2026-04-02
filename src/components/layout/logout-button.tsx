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
      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-card disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isSubmitting}
      onClick={handleLogout}
      type="button"
    >
      {isSubmitting ? "Keluar..." : "Logout"}
    </button>
  );
}
