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

export function TransactionsTable({
  initialTransactions,
  categories
}: {
  initialTransactions: TransactionRow[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const categoryOptions = useMemo(() => {
    if (!draft) {
      return [];
    }

    return categories.filter((category) => category.type === draft.type);
  }, [categories, draft]);

  async function submitEdit() {
    if (!draft) {
      return;
    }

    setError(null);

    const response = await fetch(`/api/transactions/${draft.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: Number(draft.amount),
        transactionDate: draft.transactionDate,
        categoryId: draft.categoryId,
        note: draft.note,
        reviewStatus: draft.reviewStatus
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message ?? "Gagal mengubah transaksi.");
      return;
    }

    setDraft(null);
    startTransition(() => {
      router.refresh();
    });
  }

  async function deleteTransaction(id: string) {
    const confirmed = window.confirm("Hapus transaksi ini?");
    if (!confirmed) {
      return;
    }

    setError(null);
    const response = await fetch(`/api/transactions/${id}`, {
      method: "DELETE"
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.message ?? "Gagal menghapus transaksi.");
      return;
    }

    if (draft?.id === id) {
      setDraft(null);
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-card">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50 text-left text-sm text-slate-500">
            <tr>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Catatan</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Nominal</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {initialTransactions.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4">{item.transactionDate}</td>
                <td className="px-6 py-4">{item.categoryName || "-"}</td>
                <td className="px-6 py-4">{item.note ?? "-"}</td>
                <td className="px-6 py-4">{item.reviewStatus === "need_review" ? "Perlu Review" : "Clear"}</td>
                <td className="px-6 py-4 text-right font-medium">
                  <span className={item.type === "income" ? "text-moss" : "text-coral"}>
                    {item.type === "income" ? "+" : "-"}
                    {formatCurrency(item.amount)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                      href={`/transactions/${item.id}`}
                    >
                      Detail
                    </Link>
                    <button
                      className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                      onClick={() =>
                        setDraft({
                          id: item.id,
                          amount: String(item.amount),
                          transactionDate: item.transactionDate.slice(0, 10),
                          categoryId: item.categoryId,
                          note: item.note ?? "",
                          reviewStatus: item.reviewStatus,
                          type: item.type
                        })
                      }
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-full bg-coral px-3 py-2 text-xs font-semibold text-white"
                      onClick={() => {
                        void deleteTransaction(item.id);
                      }}
                      type="button"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {draft ? (
        <div className="rounded-[1.75rem] bg-white p-6 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Edit transaksi</p>
              <h2 className="mt-1 text-2xl font-semibold">Perbarui data transaksi</h2>
            </div>
            <button
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={() => setDraft(null)}
              type="button"
            >
              Tutup
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Nominal</span>
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-coral"
                inputMode="numeric"
                onChange={(event) => setDraft((current) => (current ? { ...current, amount: event.target.value } : current))}
                value={draft.amount}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Tanggal</span>
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-coral"
                onChange={(event) =>
                  setDraft((current) => (current ? { ...current, transactionDate: event.target.value } : current))
                }
                type="date"
                value={draft.transactionDate}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Kategori</span>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-coral"
                onChange={(event) => setDraft((current) => (current ? { ...current, categoryId: event.target.value } : current))}
                value={draft.categoryId}
              >
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Status review</span>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-coral"
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? {
                          ...current,
                          reviewStatus: event.target.value as "clear" | "need_review"
                        }
                      : current
                  )
                }
                value={draft.reviewStatus}
              >
                <option value="clear">Clear</option>
                <option value="need_review">Perlu Review</option>
              </select>
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Catatan</span>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-coral"
                onChange={(event) => setDraft((current) => (current ? { ...current, note: event.target.value } : current))}
                value={draft.note}
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white"
              disabled={isPending}
              onClick={() => {
                void submitEdit();
              }}
              type="button"
            >
              {isPending ? "Menyimpan..." : "Simpan perubahan"}
            </button>
            <button
              className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
              onClick={() => setDraft(null)}
              type="button"
            >
              Batal
            </button>
          </div>

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
