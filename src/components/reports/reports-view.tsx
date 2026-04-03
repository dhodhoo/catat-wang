"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils/format";
import type { MonthlyReport } from "@/types/domain";
import { ChartBarIcon, DocumentChartBarIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export function ReportsView({ initialReports }: { initialReports: MonthlyReport[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(initialReports[0] || null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  async function generateReport() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    setIsGenerating(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year })
      });

      if (!response.ok) throw new Error("Gagal generate laporan");
      
      router.refresh();
      // Wait a bit for DB sync then reload page data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      alert("Error: " + (err as any).message);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      {/* Sidebar - History */}
      <aside className="lg:col-span-4 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Arsip Laporan</h3>
          <button 
            onClick={generateReport}
            disabled={isGenerating}
            className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 uppercase tracking-tighter disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
            Generate Lap. Baru
          </button>
        </div>

        <div className="space-y-3">
          {initialReports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center">
              <p className="text-xs text-slate-500 font-mono">BELUM ADA LAPORAN</p>
            </div>
          ) : (
            initialReports.map((report) => {
              const date = new Date(report.month_year);
              const monthLabel = months[date.getMonth()].label;
              const yearLabel = date.getFullYear();
              const isSelected = selectedReport?.id === report.id;

              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${isSelected ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{monthLabel} {yearLabel}</span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{report.transaction_count} TX</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-emerald-500">+{formatCurrency(report.total_income)}</span>
                    <span className="text-rose-500">-{formatCurrency(report.total_expense)}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Detail */}
      <main className="lg:col-span-8">
        {selectedReport ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header Stats */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 glow-card">
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">Total Pemasukan</p>
                <p className="text-2xl font-mono text-emerald-400">{formatCurrency(selectedReport.total_income)}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 glow-card">
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">Total Pengeluaran</p>
                <p className="text-2xl font-mono text-rose-400">{formatCurrency(selectedReport.total_expense)}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 glow-card">
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">Selisih Bersih</p>
                <p className={`text-2xl font-mono ${selectedReport.net_cashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(selectedReport.net_cashflow)}
                </p>
              </div>
            </div>

            {/* Top Categories */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 glow-card">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500">Distribusi Pengeluaran</h4>
                  <p className="text-sm text-slate-300">Top 5 Kategori pengeluaran terbesar.</p>
                </div>
                <DocumentChartBarIcon className="w-5 h-5 text-emerald-500/50" />
              </div>

              <div className="space-y-6">
                {selectedReport.top_categories.map((cat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300 uppercase tracking-tighter">{cat.name}</span>
                      <span className="text-slate-500">{formatCurrency(cat.amount)} ({cat.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
                {selectedReport.top_categories.length === 0 && (
                  <p className="text-center text-xs text-slate-500 font-mono py-10">TIDAK ADA DATA KATEGORI</p>
                )}
              </div>
            </div>

            {/* Footer Info */}
            <div className="flex justify-between items-center opacity-30 px-2">
              <p className="text-[10px] font-mono uppercase">ID: {selectedReport.id}</p>
              <p className="text-[10px] font-mono uppercase">GEN: {new Date(selectedReport.generated_at).toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/20 text-slate-600">
            <ChartBarIcon className="w-12 h-12 mb-4 opacity-10" />
            <p className="font-mono text-xs uppercase tracking-widest">Silakan pilih laporan untuk melihat detail</p>
          </div>
        )}
      </main>
    </div>
  );
}
