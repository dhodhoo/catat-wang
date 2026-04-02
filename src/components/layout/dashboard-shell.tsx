import type { Route } from "next";
import Link from "next/link";
import { LogoutButton } from "@/components/layout/logout-button";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transaksi" },
  { href: "/categories", label: "Kategori" },
  { href: "/reminders", label: "Reminder" },
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
    <div className="min-h-screen bg-[linear-gradient(180deg,_#faf7f2_0%,_#f8efe4_100%)]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-coral">CatatWang</p>
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-slate-600">{subtitle}</p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-card"
              >
                {item.label}
              </Link>
            ))}
            <LogoutButton />
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
