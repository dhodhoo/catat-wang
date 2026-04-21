"use client";

import { useRef, useState } from "react";

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
  const submitLockRef = useRef(false);

  async function handleSubmit(formData: FormData) {
    if (submitLockRef.current) {
      return;
    }

    submitLockRef.current = true;
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      const payload = Object.fromEntries(formData.entries());
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message ?? "Authentication failed.");
      } else {
        const status = String(data.status ?? "");
        if (status === "ok" || status === "signed_in" || status === "verified") {
          window.location.href = "/dashboard";
          return;
        }
        if (status === "verification_required") {
          window.location.href = `/verify-email?email=${encodeURIComponent(String(payload.email ?? ""))}`;
          return;
        }
        setMessage(data.message ?? "Berhasil.");
      }
    } finally {
      submitLockRef.current = false;
      setIsLoading(false);
    }
  }

  return (
    <div className="surface-panel glow-card w-full max-w-xl overflow-hidden p-8 sm:p-10">
      <div className="mb-8 border-b border-[#e8ddcc] pb-6">
        <div className="space-y-2">
          <p className="eyebrow">Akses akun CatatWang</p>
          <h1 className="text-3xl text-ink sm:text-[2.5rem]">{title}</h1>
          <p className="max-w-md text-sm text-slate-600 sm:text-base">{subtitle}</p>
        </div>
      </div>

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (isLoading) {
            return;
          }
          void handleSubmit(new FormData(event.currentTarget));
        }}
      >
        {fields.map((field) => {
          const isPasswordField = field.type === "password";
          const autoCompleteValue = isPasswordField
            ? field.name.toLowerCase().includes("new")
              ? "new-password"
              : "current-password"
            : field.name;

          return (
            <label key={field.name} className="block space-y-2">
              <span className="field-label">{field.label}</span>
              <input
                autoComplete={autoCompleteValue}
                className="field-input"
                disabled={isLoading}
                name={field.name}
                placeholder={field.placeholder}
                required
                type={field.type ?? "text"}
              />
            </label>
          );
        })}

        <button className="button-primary mt-2 w-full justify-center py-4 text-base" disabled={isLoading} type="submit">
          {isLoading ? "Memproses..." : submitLabel}
        </button>

        {message && (
          <p className="rounded-[1.25rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-[1.25rem] border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
