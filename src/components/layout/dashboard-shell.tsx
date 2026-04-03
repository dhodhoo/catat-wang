"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  BellRing,
  ChartColumnBig,
  LayoutGrid,
  ListOrdered,
  MessageCircleMore,
  Shapes
} from "lucide-react";
import { LogoutButton } from "@/components/layout/logout-button";

const navItems: Array<{ href: Route; label: string; icon: ComponentType<{ className?: string }> }> = [
  { href: "/dashboard", label: "Beranda", icon: LayoutGrid },
  { href: "/transactions", label: "Transaksi", icon: ListOrdered },
  { href: "/reports", label: "Laporan", icon: ChartColumnBig },
  { href: "/categories", label: "Kategori", icon: Shapes },
  { href: "/reminders", label: "Pengingat", icon: BellRing },
  { href: "/settings/whatsapp", label: "WhatsApp", icon: MessageCircleMore }
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
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 app-backdrop" />
      <div className="pointer-events-none absolute inset-0 dashboard-grid opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="surface-panel sticky top-4 z-20 mb-8 p-4 sm:p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="status-chip">
                    <span className="h-2 w-2 rounded-full bg-moss" />
                    CatatWang workspace
                  </span>
                  <span className="stat-chip">WhatsApp-first finance tracker</span>
                </div>

                <div className="space-y-2">
                  <p className="eyebrow">Pusat kendali keuangan pribadi</p>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                      <h1 className="section-title text-balance">{title}</h1>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                        {subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="status-chip">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Siap dipakai hari ini
                </span>
                <LogoutButton />
              </div>
            </div>

            <nav className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-[1.25rem] border px-4 py-3 transition-all ${
                      isActive
                        ? "border-moss/20 bg-moss text-white shadow-[0_16px_30px_rgba(53,89,74,0.18)]"
                        : "border-[#e2d8c8] bg-[#fffaf2]/70 text-slate-600 hover:border-moss/20 hover:bg-white hover:text-moss"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                        isActive ? "bg-white/18 text-white" : "bg-white text-slate-500 group-hover:text-moss"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p
                        className={`mt-0.5 text-[11px] ${
                          isActive ? "text-white/70" : "text-slate-500"
                        }`}
                      >
                        {isActive ? "Sedang dibuka" : "Buka halaman"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <main className="space-y-8">{children}</main>
      </div>
    </div>
  );
}
