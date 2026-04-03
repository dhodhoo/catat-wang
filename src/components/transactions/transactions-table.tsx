"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils/format";

interface TransactionRow {
  id: string;
  amount: number;
  type: "income" | "expense";
  transactionDate: string;
  note: string | null;
  reviewStatus: "clear" | "need_review";
  categoryId: string;
  categoryName: string;
}

interface CategoryOption {
  id: string;
  name: string;
  type: "income" | "expense";
}

interface EditDraft {
  id: string;
  amount: string;
  transactionDate: string;
  categoryId: string;
  note: string;
  reviewStatus: "clear" | "need_review";
  type: "income" | "expense";
}

interface CreateDraft {
  amount: string;
  transactionDate: string;
  categoryId: string;
  note: string;
  reviewStatus: "clear" | "need_review";
  type: "income" | "expense";
}

export function TransactionsTable({
  initialTransactions,
  categories
}: {
  initialTransactions: TransactionRow[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [createDraft, setCreateDraft] = useState<CreateDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const categoryOptions = useMemo(() => {
    const d = draft || createDraft;
    if (!d) return [];
    return categories.filter((category) => category.type === d.type);
  }, [categories, draft, createDraft]);

  async function submitEdit() {
    if (!draft) return;
    setError(null);
    const response = await fetch(`/api/transactions/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(draft.amount),
        transactionDate: draft.transactionDate,
        categoryId: draft.categoryId,
        note: draft.note,
        reviewStatus: draft.reviewStatus
      })
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.message ?? "Gagal mengubah transaksi.");
      return;
    }

    setDraft(null);
    startTransition(() => {
      router.refresh();
    });
  }

  async function submitCreate() {
    if (!createDraft) return;
    setError(null);
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: createDraft.type,
        amount: Number(createDraft.amount),
        transactionDate: createDraft.transactionDate,
        categoryId: createDraft.categoryId || undefined,
        note: createDraft.note || null,
        reviewStatus: createDraft.reviewStatus
      })
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.message ?? "Gagal membuat transaksi.");
      return;
    }

    setCreateDraft(null);
    startTransition(() => {
      router.refresh();
    });
  }

  async function deleteTransaction(id: string) {
    if (!window.confirm("Hapus transaksi ini secara permanen?")) return;
    setError(null);
    const response = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = await response.json();
      setError(payload.message ?? "Gagal menghapus transaksi.");
      return;
    }
    if (draft?.id === id) setDraft(null);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-end">
        <button 
          onClick={() => setCreateDraft({
            type: "expense",
            amount: "0",
            transactionDate: new Date().toISOString().split('T')[0],
            categoryId: "",
            note: "",
            reviewStatus: "clear"
          })}
          className="rounded-xl bg-emerald-500 px-6 py-3 text-xs font-bold tracking-tight text-slate-950 hover:bg-emerald-400 transition-all active:scale-95 flex items-center gap-2"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
          TAMBAH TRANSAKSI
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-slate-500 text-left">TANGGAL</th>
              <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-slate-500 text-left">KATEGORI</th>
              <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-slate-500 text-left">CATATAN</th>
              <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-slate-500 text-left">STATUS</th>
              <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-slate-500 text-right">JUMLAH</th>
              <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-slate-500 text-right">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {initialTransactions.map((item) => (
              <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono text-slate-400">{item.transactionDate.split('T')[0]}</td>
                <td className="px-6 py-4 font-bold text-slate-200">{item.categoryName || "Tanpa Kategori"}</td>
                <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{item.note ?? "—"}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${item.reviewStatus === "need_review" ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]" : "bg-emerald-500 shadow-[0_0_8px_#10b981]"}`} />
                    <span className={`text-[10px] font-mono tracking-wider transition-all uppercase ${item.reviewStatus === "need_review" ? "text-amber-500" : "text-emerald-500/80"}`}>
                      {item.reviewStatus === "need_review" ? "PERLU REVIEW" : "BERES"}
                    </span>
                  </div>
                </td>
                <td className={`px-6 py-4 text-right font-mono text-lg ${item.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                  {item.type === "income" ? "+" : "-"}{formatCurrency(item.amount)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setDraft({
                        id: item.id,
                        amount: String(item.amount),
                        transactionDate: item.transactionDate.slice(0, 10),
                        categoryId: item.categoryId,
                        note: item.note ?? "",
                        reviewStatus: item.reviewStatus,
                        type: item.type
                      })}
                      className="text-[10px] font-mono border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => void deleteTransaction(item.id)}
                      className="text-[10px] font-mono border border-rose-900 bg-rose-950/30 text-rose-400 hover:bg-rose-900/50 px-3 py-1.5 rounded-lg transition-all"
                    >
                      HAPUS
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl glow-card">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-500">Edit Transaksi</p>
                <h2 className="text-3xl font-bold tracking-tight">Ubah Data</h2>
              </div>
              <button onClick={() => setDraft(null)} className="font-mono text-[10px] text-slate-500 hover:text-white underline underline-offset-4">TUTUP</button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Nominal</span>
                <input
                  className="w-full bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 font-mono text-xl text-emerald-400 outline-none focus:border-emerald-500/50 transition-all"
                  onChange={(e) => setDraft((c) => (c ? { ...c, amount: e.target.value } : c))}
                  value={draft.amount}
                />
              </label>

              <label className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Tanggal</span>
                <input
                  className="w-full bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 text-slate-200 outline-none focus:border-emerald-500/50 transition-all"
                  onChange={(e) => setDraft((c) => (c ? { ...c, transactionDate: e.target.value } : c))}
                  type="date"
                  value={draft.transactionDate}
                />
              </label>

              <label className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Kategori</span>
                <select
                  className="w-full bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 text-slate-200 outline-none focus:border-emerald-500/50 transition-all appearance-none"
                  onChange={(e) => setDraft((c) => (c ? { ...c, categoryId: e.target.value } : c))}
                  value={draft.categoryId}
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Status Review</span>
                <select
                  className="w-full bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 text-slate-200 outline-none focus:border-emerald-500/50 transition-all appearance-none"
                  onChange={(e) => setDraft((c) => c ? { ...c, reviewStatus: e.target.value as any } : c)}
                  value={draft.reviewStatus}
                >
                  <option value="clear">BERES</option>
                  <option value="need_review">PERLU REVIEW</option>
                </select>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Catatan</span>
                <textarea
                  className="w-full bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 text-slate-300 min-h-24 outline-none focus:border-emerald-500/50 transition-all"
                  onChange={(e) => setDraft((c) => (c ? { ...c, note: e.target.value } : c))}
                  value={draft.note}
                />
              </label>
            </div>

            <div className="mt-10 flex gap-4">
              <button
                className="flex-1 rounded-xl bg-emerald-500 py-4 font-bold text-slate-950 hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50"
                disabled={isPending}
                onClick={() => void submitEdit()}
              >
                {isPending ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
              </button>
            </div>

            {error && <p className="mt-4 text-xs font-mono text-rose-500 uppercase tracking-tight">{error}</p>}
          </div>
        </div>
      )}

      {createDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl glow-card">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-500">Resource Ingestion</p>
                <h2 className="text-3xl font-bold tracking-tight text-white">Buat Transaksi</h2>
              </div>
              <button onClick={() => setCreateDraft(null)} className="font-mono text-[10px] text-slate-500 hover:text-white underline underline-offset-4 uppercase">TUTUP</button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">TIPE TRANSAKSI</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCreateDraft(c => c ? { ...c, type: 'income', categoryId: '' } : c)}
                    className={`rounded-xl py-3 text-[10px] font-mono border transition-all ${createDraft.type === 'income' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                  >
                    PEMASUKAN
                  </button>
                  <button
                    onClick={() => setCreateDraft(c => c ? { ...c, type: 'expense', categoryId: '' } : c)}
                    className={`rounded-xl py-3 text-[10px] font-mono border transition-all ${createDraft.type === 'expense' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                  >
                    PENGELUARAN
                  </button>
                </div>
              </label>

              <label className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">NOMINAL</span>
                <input
                  className={`w-full bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 font-mono text-xl outline-none focus:border-emerald-500/50 transition-all ${createDraft.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}
                  onChange={(e) => setCreateDraft((c: CreateDraft | null) => (c ? { ...c, amount: e.target.value } : c))}
                  placeholder="0"
                  type="number"
                  value={createDraft.amount}
                />
              </label>

              <label className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">TANGGAL</span>
                <input
                  className="w-full bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 text-slate-200 outline-none focus:border-emerald-500/50 transition-all"
                  onChange={(e) => setCreateDraft((c: CreateDraft | null) => (c ? { ...c, transactionDate: e.target.value } : c))}
                  type="date"
                  value={createDraft.transactionDate}
                />
              </label>

              <label className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">KATEGORI</span>
                <select
                  className="w-full bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 text-slate-200 outline-none focus:border-emerald-500/50 transition-all appearance-none"
                  onChange={(e) => setCreateDraft((c: CreateDraft | null) => (c ? { ...c, categoryId: e.target.value } : c))}
                  value={createDraft.categoryId}
                >
                  <option value="" disabled>Pilih Kategori</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">CATATAN</span>
                <textarea
                  className="w-full bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 text-slate-300 min-h-24 outline-none focus:border-emerald-500/50 transition-all"
                  onChange={(e) => setCreateDraft((c: CreateDraft | null) => (c ? { ...c, note: e.target.value } : c))}
                  placeholder="Opsional"
                  value={createDraft.note}
                />
              </label>
            </div>

            <div className="mt-10">
              <button
                className="w-full rounded-xl bg-emerald-500 py-4 font-bold text-slate-950 hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50"
                disabled={isPending || !createDraft.amount || createDraft.amount === '0'}
                onClick={() => void submitCreate()}
              >
                {isPending ? "EXECUTING..." : "SIMPAN TRANSAKSI"}
              </button>
            </div>

            {error && <p className="mt-4 text-xs font-mono text-rose-500 uppercase tracking-tight">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
