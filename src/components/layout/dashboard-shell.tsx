import type { Route } from "next";
import Link from "next/link";
import { LogoutButton } from "@/components/layout/logout-button";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/dashboard", label: "Beranda" },
  { href: "/transactions", label: "Transaksi" },
  { href: "/categories", label: "Kategori" },
  { href: "/reminders", label: "Pengingat" },
  { href: "/settings/whatsapp", label: "WhatsApp" }
];

export function DashboardShell({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
      {/* Precision Background Pattern */}
      <div className="absolute inset-0 dashboard-grid pointer-events-none opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-emerald-500/10 blur-[120px] pointer-events-none" />
      
      <div className="relative mx-auto max-w-6xl px-6 py-10">
        <header className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-slate-800 pb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-500/80">
                Pencatat Wang / v1.0.4
              </p>
            </div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="max-w-md text-sm text-slate-400 font-medium">
              {subtitle}
            </p>
          </div>
          
          <nav className="flex flex-wrap gap-1 p-1 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-5 py-2.5 text-xs font-bold tracking-wide transition-all hover:text-emerald-400 active:scale-95"
              >
                {item.label}
              </Link>
            ))}
            <div className="mx-2 w-px h-8 bg-slate-800 self-center" />
            <LogoutButton />
          </nav>
        </header>

        <main className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
