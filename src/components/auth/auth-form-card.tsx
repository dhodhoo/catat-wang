"use client";

import { useState } from "react";

export function AuthFormCard({
  title,
  subtitle,
  fields,
  endpoint,
  submitLabel
}: {
  title: string;
  subtitle: string;
  endpoint: string;
  submitLabel: string;
  fields: Array<{ name: string; label: string; type?: string; placeholder?: string }>;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    setIsLoading(true);

    const payload = Object.fromEntries(formData.entries());
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.message ?? "Permintaan gagal.");
    } else {
      setMessage(data.status ? `Status: ${data.status}` : "Berhasil.");
      if (data.status === "ok" || data.status === "signed_in" || data.status === "verified") {
        window.location.href = "/dashboard";
      }
      if (data.status === "verification_required") {
        window.location.href = `/verify-email?email=${encodeURIComponent(String(payload.email ?? ""))}`;
      }
    }

    setIsLoading(false);
  }

  return (
    <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-card">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      </div>
      <form
        className="space-y-4"
        action={async (formData) => {
          await handleSubmit(formData);
        }}
      >
        {fields.map((field) => (
          <label key={field.name} className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">{field.label}</span>
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-coral"
              name={field.name}
              placeholder={field.placeholder}
              required
              type={field.type ?? "text"}
            />
          </label>
        ))}
        <button
          className="w-full rounded-2xl bg-coral px-4 py-3 font-semibold text-white"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Memproses..." : submitLabel}
        </button>
        {message ? <p className="text-sm text-moss">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </div>
  );
}
