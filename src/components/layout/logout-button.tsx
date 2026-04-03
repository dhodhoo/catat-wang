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
      className="button-secondary border-rose-200 bg-rose-50/70 px-4 py-3 text-rose-700 hover:border-rose-300 hover:text-rose-800"
      disabled={isSubmitting}
      onClick={handleLogout}
      type="button"
    >
      {isSubmitting ? "Keluar..." : "Keluar"}
    </button>
  );
}
