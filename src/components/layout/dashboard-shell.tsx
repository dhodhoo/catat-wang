"use client";

import type { Route } from "next";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  ChartColumnBig,
  LayoutGrid,
  ListOrdered,
  MessageCircleMore,
  Settings,
  BellRing,
  Shapes
} from "lucide-react";
import { LogoutButton } from "@/components/layout/logout-button";

const navItems: Array<{ href: Route; label: string; icon: ComponentType<{ className?: string }> }> = [
  { href: "/dashboard", label: "Beranda", icon: LayoutGrid },
  { href: "/transactions", label: "Transaksi", icon: ListOrdered },
  { href: "/reports", label: "Laporan", icon: ChartColumnBig },
  { href: "/settings", label: "Settings", icon: Settings }
];

const settingsSubItems: Array<{ href: Route; label: string; icon: ComponentType<{ className?: string }> }> = [
  { href: "/settings/categories", label: "Kategori", icon: Shapes },
  { href: "/settings/reminders", label: "Pengingat", icon: BellRing },
  { href: "/settings/whatsapp", label: "WhatsApp", icon: MessageCircleMore }
];

function getHeaderMeta(pathname: string, fallbackTitle: string) {
  if (pathname === "/dashboard") {
    return {
      title: "Beranda",
      breadcrumb: ["Dashboard", "Beranda"]
    };
  }

  if (pathname === "/transactions") {
    return {
      title: "Transaksi",
      breadcrumb: ["Dashboard", "Transaksi"]
    };
  }

  if (pathname.startsWith("/transactions/")) {
    return {
      title: "Detail transaksi",
      breadcrumb: ["Dashboard", "Transaksi", "Detail"]
    };
  }

  if (pathname === "/reports") {
    return {
      title: "Laporan",
      breadcrumb: ["Dashboard", "Laporan"]
    };
  }

  if (pathname === "/settings") {
    return {
      title: "Settings",
      breadcrumb: ["Dashboard", "Settings"]
    };
  }

  if (pathname === "/settings/categories") {
    return {
      title: "Kategori",
      breadcrumb: ["Dashboard", "Settings", "Kategori"]
    };
  }

  if (pathname === "/settings/reminders") {
    return {
      title: "Reminder",
      breadcrumb: ["Dashboard", "Settings", "Reminder"]
    };
  }

  if (pathname === "/settings/whatsapp") {
    return {
      title: "WhatsApp",
      breadcrumb: ["Dashboard", "Settings", "WhatsApp"]
    };
  }

  return {
    title: fallbackTitle,
    breadcrumb: ["Dashboard", fallbackTitle]
  };
}

export function DashboardShell({
  title,
  subtitle: _subtitle,
  headerAction,
  children
}: {
  title: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isItemActive = (href: Route) => pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
  const headerMeta = getHeaderMeta(pathname, title);
  const isSettingsRoute = pathname === "/settings" || pathname.startsWith("/settings/");

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#e7e5e4] bg-white px-4 py-4 md:flex md:flex-col">
        <div className="mb-8 flex items-center gap-3">
          <Image alt="CatatWang logo" className="h-10 w-10 object-contain" height={40} src="/logo.png" width={40} />
          <div>
            <h2 className="text-lg text-ink">CatatWang</h2>
            <p className="text-xs text-slate-500">Kelola Keuangan Harian</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = isItemActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#f5f5f4] text-ink"
                    : "text-slate-600 hover:bg-[#f5f5f4] hover:text-ink"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-moss" : "text-slate-500 group-hover:text-moss"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {isSettingsRoute ? (
            <div className="mt-3 space-y-1.5 border-l border-[#e7e5e4] pl-3">
              {settingsSubItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                      isActive ? "bg-[#f5f5f4] text-ink" : "text-slate-500 hover:bg-[#f5f5f4] hover:text-ink"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "text-moss" : "text-slate-500 group-hover:text-moss"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="[&>button]:w-full">
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="relative md:ml-64">
        <header className="sticky top-0 z-20 border-b border-[#e7e5e4] bg-paper/95 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 md:px-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                  {headerMeta.breadcrumb.join(" / ")}
                </p>
                <h1 className="mt-1 text-xl text-ink sm:text-2xl">{headerMeta.title}</h1>
              </div>
              {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
            </div>

            {isSettingsRoute ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {settingsSubItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                        isActive ? "bg-moss/10 text-moss" : "text-slate-500 hover:bg-[#f5f5f4] hover:text-ink"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        </header>

        <main className="relative mx-auto max-w-7xl px-4 pb-28 pt-4 sm:px-6 md:px-8 md:pb-8">
          <section className="space-y-8">{children}</section>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e7e5e4] bg-white px-2 pb-2 pt-2 md:hidden">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const isActive = isItemActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-lg px-1 py-2 text-[10px] transition ${
                  isActive ? "bg-moss/10 text-moss" : "text-slate-500 hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="mt-1 max-w-[56px] truncate text-center leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
