"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowPathIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";
import { Trash2 } from "lucide-react";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils/format";
import type { MonthlyReport } from "@/types/domain";

const months = [
  { label: "Januari", value: 1 },
  { label: "Februari", value: 2 },
  { label: "Maret", value: 3 },
  { label: "April", value: 4 },
  { label: "Mei", value: 5 },
  { label: "Juni", value: 6 },
  { label: "Juli", value: 7 },
  { label: "Agustus", value: 8 },
  { label: "September", value: 9 },
  { label: "Oktober", value: 10 },
  { label: "November", value: 11 },
  { label: "Desember", value: 12 },
];

export function ReportsView({
  initialReports,
}: {
  initialReports: MonthlyReport[];
}) {
  const numericClass = "whitespace-nowrap tabular-nums leading-tight";
  const router = useRouter();
  const [reports, setReports] = useState(initialReports);
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(
    initialReports[0] || null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MonthlyReport | null>(null);

  const selectedMonthLabel = useMemo(() => {
    if (!selectedReport) return "";
    const date = new Date(selectedReport.month_year);
    return `${months[date.getMonth()].label} ${date.getFullYear()}`;
  }, [selectedReport]);

  async function generateReport() {
    setError(null);

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    setIsGenerating(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal generate laporan");
      }

      router.refresh();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      alert("Error: " + (err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  }

  function deleteReport(report: MonthlyReport) {
    setError(null);

    startDeleteTransition(async () => {
      const response = await fetch(`/api/reports/${report.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.message ?? "Gagal menghapus laporan.");
        return;
      }

      const remainingReports = reports.filter(
        (item) => item.id !== report.id,
      );
      setReports(remainingReports);
      setSelectedReport(remainingReports[0] ?? null);
      router.refresh();
    });
  }

  async function downloadReportPdf(report: MonthlyReport) {
    setError(null);
    setIsDownloading(true);

    try {
      const response = await fetch(`/api/reports/${report.id}/pdf`, {
        method: "GET",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message ?? "Gagal mengunduh PDF laporan.");
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `laporan-${report.month_year}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsDownloading(false);
    }
  }

  function renderResponsiveCurrency(amount: number, withSign?: "+" | "-") {
    const displayAmount = withSign ? Math.abs(amount) : amount;
    const prefix = withSign ?? "";

    return (
      <>
        <span className="sm:hidden">
          {prefix}
          {formatCurrencyCompact(displayAmount)}
        </span>
        <span className="hidden sm:inline">
          {prefix}
          {formatCurrency(displayAmount)}
        </span>
      </>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
      <aside className="space-y-6">
        <section className="surface-panel p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Arsip laporan</p>
              <h2 className="mt-2 text-2xl text-ink sm:text-3xl">
                {reports.length} laporan tersimpan
              </h2>
              <p className="panel-copy">
                Simpan histori bulanan supaya perubahan pola pengeluaran lebih
                mudah dibandingkan.
              </p>
            </div>
            <button
              className="button-primary gap-2 px-4 py-2.5"
              disabled={isGenerating}
              onClick={generateReport}
              type="button"
            >
              <ArrowPathIcon
                className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
              />
              {isGenerating ? "Memproses..." : "Generate"}
            </button>
          </div>

        </section>

        <section className="surface-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="eyebrow">Pilih periode</p>
              <h3 className="mt-2 text-xl text-ink sm:text-2xl">Riwayat bulan ke bulan</h3>
            </div>
            <DocumentChartBarIcon className="h-5 w-5 text-moss/70" />
          </div>

          <div className="soft-scrollbar max-h-[560px] space-y-3 overflow-y-auto pr-1">
            {reports.length === 0 ? (
              <div className="surface-muted p-6 text-center text-sm text-slate-500">
                Belum ada laporan yang bisa ditinjau.
              </div>
            ) : (
              reports.map((report) => {
                const date = new Date(report.month_year);
                const monthLabel = months[date.getMonth()].label;
                const yearLabel = date.getFullYear();
                const isSelected = selectedReport?.id === report.id;

                return (
                  <button
                    key={report.id}
                    className={`w-full rounded-[1.2rem] border p-3.5 text-left transition ${
                      isSelected
                        ? "border-moss/20 bg-moss text-white shadow-[0_18px_30px_rgba(53,89,74,0.18)]"
                        : "border-[#e1d7c7] bg-[#fff9ef] hover:border-moss/20 hover:bg-white"
                    }`}
                    onClick={() => {
                      setError(null);
                      setSelectedReport(report);
                    }}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p
                          className={`text-base sm:text-lg ${isSelected ? "text-white" : "text-ink"}`}
                        >
                          {monthLabel} {yearLabel}
                        </p>
                        <p
                          className={`mt-1 text-sm ${isSelected ? "text-white/70" : "text-slate-500"}`}
                        >
                          {report.transaction_count} transaksi
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${numericClass} ${
                          isSelected
                            ? "bg-white/12 text-white"
                            : "bg-white text-slate-600"
                        }`}
                      >
                        {renderResponsiveCurrency(report.net_cashflow)}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                      <span
                        className={`${numericClass} ${
                          isSelected ? "text-emerald-100" : "text-moss"
                        }`}
                      >
                        {renderResponsiveCurrency(report.total_income, "+")}
                      </span>
                      <span
                        className={`${numericClass} ${isSelected ? "text-rose-100" : "text-coral"}`}
                      >
                        {renderResponsiveCurrency(report.total_expense, "-")}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>
      </aside>

      <main>
        {selectedReport ? (
          <div className="space-y-6">
            <section className="surface-panel p-6 sm:p-7">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="eyebrow">Laporan aktif</p>
                  <h2 className="panel-title-lg">
                    {selectedMonthLabel}
                  </h2>
                  <p className="panel-copy max-w-2xl">
                    Ringkasan bulan ini menempatkan arus kas, volume transaksi,
                    dan kategori dominan dalam satu area yang lebih mudah
                    dibaca.
                  </p>
                </div>
                <span className="status-chip">
                  <span className="h-2 w-2 rounded-full bg-moss" />
                  Dibuat{" "}
                  {new Date(selectedReport.generated_at).toLocaleString(
                    "id-ID",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  {
                    label: "Pemasukan",
                    value: selectedReport.total_income,
                    tone: "text-moss",
                  },
                  {
                    label: "Pengeluaran",
                    value: selectedReport.total_expense,
                    tone: "text-coral",
                  },
                  {
                    label: "Selisih bersih",
                    value: selectedReport.net_cashflow,
                    tone:
                      selectedReport.net_cashflow >= 0
                        ? "text-ink"
                        : "text-coral",
                  },
                ].map((item) => (
                  <article
                    key={item.label}
                    className="surface-muted overflow-hidden p-5"
                  >
                    <p className="eyebrow">{item.label}</p>
                    <p className={`mt-5 text-[clamp(1.05rem,3.6vw,1.5rem)] ${numericClass} ${item.tone}`}>
                      {renderResponsiveCurrency(item.value)}
                    </p>
                  </article>
                ))}
              </div>

              {error ? (
                <p className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </p>
              ) : null}
            </section>

            <section>
              <div className="surface-card p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow">Distribusi pengeluaran</p>
                    <h3 className="mt-3 text-3xl text-ink">
                      Kategori paling dominan bulan ini
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      className="button-primary gap-2 px-4 py-2.5"
                      disabled={isDownloading}
                      onClick={() => downloadReportPdf(selectedReport)}
                      type="button"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      {isDownloading ? "Menyiapkan PDF..." : "Download PDF"}
                    </button>
                    <button
                      className="button-danger gap-2 px-4 py-2.5"
                      disabled={isDeleting}
                      onClick={() => setDeleteTarget(selectedReport)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                      {isDeleting ? "Menghapus..." : "Hapus laporan"}
                    </button>
                    <ChartBarIcon className="hidden h-6 w-6 text-moss/70 sm:block" />
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  {selectedReport.top_categories.length === 0 ? (
                    <div className="surface-muted p-6 text-center text-sm text-slate-500">
                      Tidak ada data kategori untuk periode ini.
                    </div>
                  ) : (
                    selectedReport.top_categories.map((cat) => (
                      <div
                        key={`${selectedReport.id}-${cat.name}`}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium text-ink">
                            {cat.name}
                          </span>
                          <span className={`text-right text-slate-500 ${numericClass}`}>
                            {renderResponsiveCurrency(cat.amount)} (
                            {cat.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#efe4d5]">
                          <div
                            className="h-full rounded-full bg-moss"
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="surface-card flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
            <ChartBarIcon className="h-12 w-12 text-moss/40" />
            <p className="mt-5 text-2xl text-ink">
              Belum ada laporan untuk ditampilkan.
            </p>
            <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
              Generate laporan pertama Anda untuk mulai melihat pola pemasukan
              dan pengeluaran bulanan.
            </p>
          </div>
        )}
      </main>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(16,24,40,0.38)] p-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-lg p-6 sm:p-8">
            <p className="eyebrow">Konfirmasi hapus</p>
            <h2 className="mt-2 text-2xl text-ink">Hapus laporan ini?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Tindakan ini tidak bisa dibatalkan. Arsip laporan akan dihapus permanen.
            </p>

            <div className="mt-4 rounded-xl border border-[#e7e5e4] bg-[#fafaf9] p-4">
              <p className="text-sm text-slate-500">Periode</p>
              <p className="mt-1 text-base font-semibold text-ink">
                {(() => {
                  const date = new Date(deleteTarget.month_year);
                  return `${months[date.getMonth()].label} ${date.getFullYear()}`;
                })()}
              </p>
              <p className={`mt-1 text-sm ${numericClass} ${deleteTarget.net_cashflow >= 0 ? "text-moss" : "text-coral"}`}>
                {renderResponsiveCurrency(deleteTarget.net_cashflow)}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                className="button-danger flex-1 justify-center"
                disabled={isDeleting}
                onClick={() => {
                  void Promise.resolve(deleteReport(deleteTarget)).finally(() => setDeleteTarget(null));
                }}
              >
                {isDeleting ? "Menghapus..." : "Ya, hapus laporan"}
              </button>
              <button
                className="button-secondary justify-center"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
