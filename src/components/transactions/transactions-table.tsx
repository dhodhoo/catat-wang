"use client";

import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { formatCurrency, formatDateLabel } from "@/lib/utils/format";

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
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [reviewFilter, setReviewFilter] = useState<"all" | "clear" | "need_review">("all");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search);

  const categoryOptions = useMemo(() => {
    const selectedType = draft?.type ?? createDraft?.type;
    if (!selectedType) return [];
    return categories.filter((category) => category.type === selectedType);
  }, [categories, createDraft?.type, draft?.type]);

  const filteredTransactions = useMemo(() => {
    const keyword = deferredSearch.trim().toLowerCase();
    return initialTransactions.filter((item) => {
      const matchesKeyword =
        keyword.length === 0 ||
        item.categoryName.toLowerCase().includes(keyword) ||
        (item.note ?? "").toLowerCase().includes(keyword) ||
        formatDateLabel(item.transactionDate).toLowerCase().includes(keyword);
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesReview = reviewFilter === "all" || item.reviewStatus === reviewFilter;
      return matchesKeyword && matchesType && matchesReview;
    });
  }, [deferredSearch, initialTransactions, reviewFilter, typeFilter]);

  const stats = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, item) => {
        if (item.type === "income") acc.income += item.amount;
        if (item.type === "expense") acc.expense += item.amount;
        if (item.reviewStatus === "need_review") acc.needReview += 1;
        return acc;
      },
      { income: 0, expense: 0, needReview: 0 }
    );
  }, [filteredTransactions]);

  async function submitEdit() {
    if (!draft) return;
    setError(null);
    const response = await fetch(`/api/transactions/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(draft.amount),
        transactionDate: draft.transactionDate,
        categoryId: draft.categoryId || undefined,
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
    <div className="space-y-6">
      <section className="surface-panel p-5 sm:p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">Pusat transaksi</p>
            <div>
              <h2 className="text-3xl text-ink">Cari, saring, lalu perbaiki transaksi dalam beberapa klik.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Semua histori ditampilkan lebih rapi, dengan prioritas pada transaksi yang perlu perhatian dan
                kontrol yang tetap nyaman di layar kecil.
              </p>
            </div>
          </div>

          <button
            className="button-primary gap-2 self-start"
            onClick={() =>
              setCreateDraft({
                type: "expense",
                amount: "",
                transactionDate: new Date().toISOString().split("T")[0],
                categoryId: "",
                note: "",
                reviewStatus: "clear"
              })
            }
          >
            <Plus className="h-4 w-4" />
            Tambah transaksi
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Transaksi tampil", value: filteredTransactions.length, tone: "text-ink" },
              { label: "Pemasukan", value: formatCurrency(stats.income), tone: "text-moss" },
              { label: "Pengeluaran", value: formatCurrency(stats.expense), tone: "text-coral" }
            ].map((item) => (
              <article key={item.label} className="surface-muted p-4">
                <p className="eyebrow">{item.label}</p>
                <p className={`mt-4 text-3xl ${item.tone}`}>
                  {typeof item.value === "number" ? item.value : item.value}
                </p>
              </article>
            ))}
          </div>

          <article className="surface-muted p-4">
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                <CircleAlert className="h-5 w-5" />
              </span>
              <div>
                <p className="eyebrow">Perlu review</p>
                <h3 className="mt-2 text-2xl text-ink">{stats.needReview} transaksi belum beres</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Tandai dan rapikan transaksi yang statusnya masih butuh pengecekan agar laporan tetap akurat.
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="surface-card p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
          <label className="space-y-2">
            <span className="field-label">Cari transaksi</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="field-input pl-11"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari kategori, catatan, atau tanggal"
                value={search}
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="field-label">Tipe</span>
            <select className="field-select min-w-[180px]" onChange={(event) => setTypeFilter(event.target.value as any)} value={typeFilter}>
              <option value="all">Semua tipe</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="field-label">Status review</span>
            <select
              className="field-select min-w-[190px]"
              onChange={(event) => setReviewFilter(event.target.value as any)}
              value={reviewFilter}
            >
              <option value="all">Semua status</option>
              <option value="clear">Sudah beres</option>
              <option value="need_review">Perlu review</option>
            </select>
          </label>
        </div>
      </section>

      <section className="surface-card overflow-hidden">
        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full text-sm">
            <thead className="border-b border-[#e5dccd] bg-[#fff9ef]">
              <tr>
                <th className="px-6 py-4 text-left font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">Tanggal</th>
                <th className="px-6 py-4 text-left font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">Kategori</th>
                <th className="px-6 py-4 text-left font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">Catatan</th>
                <th className="px-6 py-4 text-left font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">Status</th>
                <th className="px-6 py-4 text-right font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">Jumlah</th>
                <th className="px-6 py-4 text-right font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece3d4]">
              {filteredTransactions.map((item) => (
                <tr key={item.id} className="bg-white/30 transition hover:bg-[#fffaf2]">
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDateLabel(item.transactionDate)}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-ink">{item.categoryName || "Tanpa kategori"}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.type === "income" ? "Pemasukan" : "Pengeluaran"}
                      </p>
                    </div>
                  </td>
                  <td className="max-w-sm px-6 py-4 text-slate-600">{item.note || "Tidak ada catatan"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        item.reviewStatus === "need_review"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {item.reviewStatus === "need_review" ? "Perlu review" : "Beres"}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right text-base font-semibold ${item.type === "income" ? "text-moss" : "text-coral"}`}>
                    {item.type === "income" ? "+" : "-"}
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        className="button-secondary gap-2 px-4 py-2"
                        onClick={() =>
                          setDraft({
                            id: item.id,
                            amount: String(item.amount),
                            transactionDate: item.transactionDate.slice(0, 10),
                            categoryId: item.categoryId ?? "",
                            note: item.note ?? "",
                            reviewStatus: item.reviewStatus,
                            type: item.type
                          })
                        }
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <button className="button-danger gap-2" onClick={() => void deleteTransaction(item.id)}>
                        <Trash2 className="h-4 w-4" />
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 p-4 lg:hidden">
          {filteredTransactions.map((item) => (
            <article key={item.id} className="surface-muted p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{formatDateLabel(item.transactionDate)}</p>
                  <h3 className="mt-1 text-xl text-ink">{item.categoryName || "Tanpa kategori"}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.type === "income" ? "Pemasukan" : "Pengeluaran"}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    item.reviewStatus === "need_review" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {item.reviewStatus === "need_review" ? "Perlu review" : "Beres"}
                </span>
              </div>

              <p className={`mt-4 text-2xl ${item.type === "income" ? "text-moss" : "text-coral"}`}>
                {item.type === "income" ? "+" : "-"}
                {formatCurrency(item.amount)}
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-600">{item.note || "Tidak ada catatan untuk transaksi ini."}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="button-secondary gap-2 px-4 py-2"
                  onClick={() =>
                    setDraft({
                      id: item.id,
                      amount: String(item.amount),
                      transactionDate: item.transactionDate.slice(0, 10),
                      categoryId: item.categoryId ?? "",
                      note: item.note ?? "",
                      reviewStatus: item.reviewStatus,
                      type: item.type
                    })
                  }
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button className="button-danger gap-2" onClick={() => void deleteTransaction(item.id)}>
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="flex min-h-[240px] items-center justify-center p-8 text-center">
            <div className="max-w-md">
              <p className="eyebrow">Tidak ada hasil</p>
              <h3 className="mt-3 text-2xl text-ink">Filter saat ini belum menemukan transaksi yang cocok.</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Coba ubah kata kunci pencarian atau reset filter tipe dan status review agar daftar muncul lagi.
              </p>
            </div>
          </div>
        )}
      </section>

      {draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(16,24,40,0.38)] p-4 backdrop-blur-sm">
          <div className="surface-panel max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 sm:p-8">
            <div className="flex flex-col gap-4 border-b border-[#e8ddcc] pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="eyebrow">Edit transaksi</p>
                <h2 className="mt-2 text-3xl text-ink">Perbarui detail yang perlu dikoreksi</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Ubah nominal, tanggal, kategori, atau status review sebelum menyimpan.</p>
              </div>
              <button className="button-ghost self-start px-0" onClick={() => setDraft(null)}>
                Tutup
              </button>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="field-label">Nominal</span>
                <input
                  className="field-input text-xl text-ink"
                  onChange={(event) => setDraft((current) => (current ? { ...current, amount: event.target.value } : current))}
                  value={draft.amount}
                />
              </label>

              <label className="space-y-2">
                <span className="field-label">Tanggal</span>
                <input
                  className="field-input"
                  onChange={(event) =>
                    setDraft((current) => (current ? { ...current, transactionDate: event.target.value } : current))
                  }
                  type="date"
                  value={draft.transactionDate}
                />
              </label>

              <label className="space-y-2">
                <span className="field-label">Kategori</span>
                <select
                  className="field-select"
                  onChange={(event) => setDraft((current) => (current ? { ...current, categoryId: event.target.value } : current))}
                  value={draft.categoryId}
                >
                  <option value="">Tanpa kategori</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="field-label">Status review</span>
                <select
                  className="field-select"
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, reviewStatus: event.target.value as "clear" | "need_review" } : current
                    )
                  }
                  value={draft.reviewStatus}
                >
                  <option value="clear">Sudah beres</option>
                  <option value="need_review">Perlu review</option>
                </select>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="field-label">Catatan</span>
                <textarea
                  className="field-textarea"
                  onChange={(event) => setDraft((current) => (current ? { ...current, note: event.target.value } : current))}
                  value={draft.note}
                />
              </label>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="button-primary flex-1 justify-center" disabled={isPending} onClick={() => void submitEdit()}>
                {isPending ? "Menyimpan..." : "Simpan perubahan"}
              </button>
              <button className="button-secondary justify-center" onClick={() => setDraft(null)}>
                Batal
              </button>
            </div>

            {error && <p className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
          </div>
        </div>
      )}

      {createDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(16,24,40,0.38)] p-4 backdrop-blur-sm">
          <div className="surface-panel max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 sm:p-8">
            <div className="flex flex-col gap-4 border-b border-[#e8ddcc] pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="eyebrow">Tambah transaksi</p>
                <h2 className="mt-2 text-3xl text-ink">Buat pencatatan manual dengan cepat</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Pilih tipe transaksi terlebih dulu, lalu lengkapi nominal dan kategorinya agar laporan tetap rapi.
                </p>
              </div>
              <button className="button-ghost self-start px-0" onClick={() => setCreateDraft(null)}>
                Tutup
              </button>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="field-label">Tipe transaksi</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className={`rounded-[1.1rem] border px-4 py-3 text-sm font-semibold transition ${
                      createDraft.type === "income"
                        ? "border-moss bg-emerald-50 text-moss"
                        : "border-[#d8cfbf] bg-white/70 text-slate-600"
                    }`}
                    onClick={() => setCreateDraft((current) => (current ? { ...current, type: "income", categoryId: "" } : current))}
                    type="button"
                  >
                    Pemasukan
                  </button>
                  <button
                    className={`rounded-[1.1rem] border px-4 py-3 text-sm font-semibold transition ${
                      createDraft.type === "expense"
                        ? "border-coral bg-rose-50 text-coral"
                        : "border-[#d8cfbf] bg-white/70 text-slate-600"
                    }`}
                    onClick={() => setCreateDraft((current) => (current ? { ...current, type: "expense", categoryId: "" } : current))}
                    type="button"
                  >
                    Pengeluaran
                  </button>
                </div>
              </label>

              <label className="space-y-2">
                <span className="field-label">Nominal</span>
                <input
                  className="field-input text-xl text-ink"
                  onChange={(event) =>
                    setCreateDraft((current) => (current ? { ...current, amount: event.target.value } : current))
                  }
                  placeholder="0"
                  type="number"
                  value={createDraft.amount}
                />
              </label>

              <label className="space-y-2">
                <span className="field-label">Tanggal</span>
                <input
                  className="field-input"
                  onChange={(event) =>
                    setCreateDraft((current) => (current ? { ...current, transactionDate: event.target.value } : current))
                  }
                  type="date"
                  value={createDraft.transactionDate}
                />
              </label>

              <label className="space-y-2">
                <span className="field-label">Kategori</span>
                <select
                  className="field-select"
                  onChange={(event) =>
                    setCreateDraft((current) => (current ? { ...current, categoryId: event.target.value } : current))
                  }
                  value={createDraft.categoryId}
                >
                  <option value="">Pilih kategori</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="field-label">Catatan</span>
                <textarea
                  className="field-textarea"
                  onChange={(event) => setCreateDraft((current) => (current ? { ...current, note: event.target.value } : current))}
                  placeholder="Opsional"
                  value={createDraft.note}
                />
              </label>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                className="button-primary flex-1 justify-center"
                disabled={isPending || !createDraft.amount || Number(createDraft.amount) <= 0}
                onClick={() => void submitCreate()}
              >
                {isPending ? "Menyimpan..." : "Simpan transaksi"}
              </button>
              <button className="button-secondary justify-center" onClick={() => setCreateDraft(null)}>
                Batal
              </button>
            </div>

            {error && <p className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
