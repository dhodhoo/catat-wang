"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowPathIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
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
  const router = useRouter();
  const [reports, setReports] = useState(initialReports);
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(
    initialReports[0] || null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const selectedMonthLabel = useMemo(() => {
    if (!selectedReport) return "";
    const date = new Date(selectedReport.month_year);
    return `${months[date.getMonth()].label} ${date.getFullYear()}`;
  }, [selectedReport]);

  const largestCategory = useMemo(() => {
    if (!selectedReport?.top_categories.length) return null;
    return [...selectedReport.top_categories].sort(
      (a, b) => b.amount - a.amount,
    )[0];
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
    const date = new Date(report.month_year);
    const reportLabel = `${months[date.getMonth()].label} ${date.getFullYear()}`;

    if (
      !window.confirm(
        `Hapus laporan ${reportLabel}? Tindakan ini tidak bisa dibatalkan.`,
      )
    ) {
      return;
    }

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

  return (
    <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
      <aside className="space-y-6">
        <section className="surface-panel p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Arsip laporan</p>
              <h2 className="mt-3 text-3xl text-ink">
                {reports.length} laporan tersimpan
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Simpan histori bulanan supaya perubahan pola pengeluaran lebih
                mudah dibandingkan.
              </p>
            </div>
            <button
              className="button-primary gap-2"
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

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <article className="surface-muted p-4">
              <p className="eyebrow">Laporan terbaru</p>
              <p className="mt-4 text-2xl text-ink">
                {reports[0]
                  ? `${months[new Date(reports[0].month_year).getMonth()].label} ${new Date(reports[0].month_year).getFullYear()}`
                  : "-"}
              </p>
            </article>
            <article className="surface-muted p-4">
              <p className="eyebrow">Total transaksi</p>
              <p className="mt-4 text-2xl text-ink">
                {reports.reduce(
                  (total, report) => total + report.transaction_count,
                  0,
                )}
              </p>
            </article>
          </div>
        </section>

        <section className="surface-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="eyebrow">Pilih periode</p>
              <h3 className="mt-2 text-2xl text-ink">Riwayat bulan ke bulan</h3>
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
                    className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
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
                          className={`text-lg ${isSelected ? "text-white" : "text-ink"}`}
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
                        className={`rounded-full px-3 py-1 text-xs ${
                          isSelected
                            ? "bg-white/12 text-white"
                            : "bg-white text-slate-600"
                        }`}
                      >
                        {formatCurrency(report.net_cashflow)}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span
                        className={
                          isSelected ? "text-emerald-100" : "text-moss"
                        }
                      >
                        +{formatCurrency(report.total_income)}
                      </span>
                      <span
                        className={isSelected ? "text-rose-100" : "text-coral"}
                      >
                        -{formatCurrency(report.total_expense)}
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
                  <h2 className="mt-3 text-4xl text-ink">
                    {selectedMonthLabel}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
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
                    value: formatCurrency(selectedReport.total_income),
                    tone: "text-moss",
                  },
                  {
                    label: "Pengeluaran",
                    value: formatCurrency(selectedReport.total_expense),
                    tone: "text-coral",
                  },
                  {
                    label: "Selisih bersih",
                    value: formatCurrency(selectedReport.net_cashflow),
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
                    <p className={`mt-5 text-2xl ${item.tone}`}>{item.value}</p>
                  </article>
                ))}
              </div>

              {error ? (
                <p className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </p>
              ) : null}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
              <div className="surface-card p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow">Distribusi pengeluaran</p>
                    <h3 className="mt-3 text-3xl text-ink">
                      Kategori paling dominan bulan ini
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      className="button-danger gap-2 px-4 py-2"
                      disabled={isDeleting}
                      onClick={() => deleteReport(selectedReport)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                      {isDeleting ? "Menghapus..." : "Hapus laporan"}
                    </button>
                    <ChartBarIcon className="h-6 w-6 text-moss/70" />
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
                          <span className="text-slate-500">
                            {formatCurrency(cat.amount)} (
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

              <div className="space-y-6">
                <section className="surface-card p-5 sm:p-6">
                  <p className="eyebrow">Highlight periode</p>
                  <h3 className="mt-3 text-3xl text-ink">
                    {selectedReport.transaction_count} transaksi tercatat
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Volume transaksi ini membantu Anda menilai apakah periode
                    tersebut aktif atau relatif tenang.
                  </p>
                </section>

                <section className="surface-card p-5 sm:p-6">
                  <p className="eyebrow">Insight cepat</p>
                  <h3 className="mt-3 text-2xl text-ink">
                    {largestCategory
                      ? `${largestCategory.name} jadi pengeluaran paling besar`
                      : "Belum ada kategori dominan"}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {largestCategory
                      ? `${largestCategory.name} menyumbang ${largestCategory.percentage.toFixed(1)}% dari total pengeluaran bulan ini.`
                      : "Tambahkan lebih banyak transaksi atau kategori agar insight ini terisi otomatis."}
                  </p>
                </section>
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
    </div>
  );
}
