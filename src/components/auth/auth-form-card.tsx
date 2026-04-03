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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.message ?? "Authentication failed.");
    } else {
      setMessage(data.status ? `Status: ${data.status}` : "Success.");
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
    <div className="w-full max-w-md rounded-[2.5rem] border border-slate-800 bg-slate-900/40 p-10 backdrop-blur-2xl shadow-2xl glow-card relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <span className="font-mono text-4xl">SECURE</span>
      </div>
      
      <div className="mb-10 space-y-2">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-500/80">Access Protocol</p>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
        <p className="text-sm text-slate-400 font-medium leading-relaxed">{subtitle}</p>
      </div>

      <form
        className="space-y-6"
        action={async (formData) => {
          await handleSubmit(formData);
        }}
      >
        {fields.map((field) => (
          <label key={field.name} className="block space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">{field.label}</span>
            <input
              className="w-full bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 text-slate-200 outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700"
              name={field.name}
              placeholder={field.placeholder}
              required
              type={field.type ?? "text"}
            />
          </label>
        ))}
        
        <button
          className="w-full rounded-xl bg-emerald-500 py-4 font-bold text-slate-950 hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "EXECUTING..." : submitLabel.toUpperCase()}
        </button>

        {message && <p className="text-xs font-mono text-emerald-500 uppercase tracking-tight text-center">{message}</p>}
        {error && <p className="text-xs font-mono text-rose-500 uppercase tracking-tight text-center">{error}</p>}
      </form>
    </div>
  );
}
