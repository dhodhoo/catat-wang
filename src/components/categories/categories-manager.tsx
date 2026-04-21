"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Pencil, Trash2 } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  type: "income" | "expense";
  is_default: boolean;
  is_archived: boolean;
}

export function CategoriesManager({ initialCategories }: { initialCategories: CategoryItem[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const activeCategories = useMemo(
    () => categories.filter((category) => !category.is_archived),
    [categories]
  );

  const groupedCategories = useMemo(
    () => ({
      income: activeCategories.filter((category) => category.type === "income"),
      expense: activeCategories.filter((category) => category.type === "expense")
    }),
    [activeCategories]
  );

  async function handleCreate() {
    if (!name.trim()) return;
    try {
      setIsSaving(true);
      setMessage(null);
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), type })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Gagal membuat kategori.");
      setCategories((current) => [payload.data, ...current]);
      setName("");
      setType("expense");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal membuat kategori.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!editingName.trim()) return;
    try {
      setIsSaving(true);
      setMessage(null);
      const response = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Gagal mengubah kategori.");
      setCategories((current) => current.map((cat) => (cat.id === id ? payload.data : cat)));
      setEditingId(null);
      setEditingName("");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal mengubah kategori.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleArchive(category: CategoryItem) {
    try {
      setIsSaving(true);
      setMessage(null);
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Gagal menghapus kategori.");
      setCategories((current) => current.map((item) => (item.id === category.id ? payload.data : item)));
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menghapus kategori.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="surface-panel p-6 sm:p-7">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="eyebrow">Master kategori</p>
            <h2 className="panel-title">Kelompokkan pemasukan dan pengeluaran agar pencatatan terasa lebih tertib.</h2>
            <p className="panel-copy max-w-2xl">
              Kategori yang rapi membantu sistem membaca transaksi lebih akurat, sekaligus membuat laporan bulanan
              lebih mudah dipahami.
            </p>
            <p className="text-sm text-slate-500">{activeCategories.length} kategori aktif.</p>
          </div>

          <div className="surface-muted p-5">
            <p className="eyebrow">Tambah kategori baru</p>
            <div className="mt-5 space-y-4">
              <label className="space-y-2">
                <span className="field-label">Nama kategori</span>
                <input
                  className="field-input"
                  id="category-name"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Contoh: Transport online"
                  value={name}
                />
              </label>

              <label className="space-y-2">
                <span className="field-label">Tipe</span>
                <select className="field-select" onChange={(event) => setType(event.target.value as "income" | "expense")} value={type}>
                  <option value="expense">Pengeluaran</option>
                  <option value="income">Pemasukan</option>
                </select>
              </label>

              <button className="button-primary w-full justify-center" disabled={isSaving || !name.trim()} onClick={handleCreate}>
                {isSaving ? "Menyimpan..." : "Tambah kategori"}
              </button>

              {message && <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p>}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        {[
          {
            key: "expense",
            title: "Kategori pengeluaran",
            description: "Pakai kategori yang spesifik supaya pola belanja cepat terlihat.",
            items: groupedCategories.expense,
            accent: "text-coral",
            icon: ArrowDownCircle
          },
          {
            key: "income",
            title: "Kategori pemasukan",
            description: "Pisahkan sumber pemasukan agar laporan bulanan lebih informatif.",
            items: groupedCategories.income,
            accent: "text-moss",
            icon: ArrowUpCircle
          }
        ].map((group) => {
          const Icon = group.icon;

          return (
            <section key={group.key} className="surface-card p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">{group.title}</p>
                  <h3 className="panel-title">{group.items.length} kategori aktif</h3>
                  <p className="panel-copy">{group.description}</p>
                </div>
                <span className={`flex h-12 w-12 items-center justify-center rounded-full bg-white ${group.accent}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {group.items.length === 0 ? (
                  <div className="surface-muted p-5 text-sm text-slate-500">Belum ada kategori pada grup ini.</div>
                ) : (
                  group.items.map((category) => {
                    const isEditing = editingId === category.id;

                    return (
                      <article key={category.id} className="surface-muted p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            {isEditing ? (
                              <input
                                autoFocus
                                className="field-input"
                                onChange={(event) => setEditingName(event.target.value)}
                                value={editingName}
                              />
                            ) : (
                              <h4 className="text-xl text-ink">{category.name}</h4>
                            )}
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className={`rounded-full px-3 py-1 text-xs font-medium ${group.accent} bg-white`}>
                                {category.type === "income" ? "Pemasukan" : "Pengeluaran"}
                              </span>
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                                {category.is_default ? "Default" : "Custom"}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {isEditing ? (
                              <>
                                <button className="button-primary px-4 py-2" onClick={() => void handleUpdate(category.id)}>
                                  Simpan
                                </button>
                                <button className="button-secondary px-4 py-2" onClick={() => setEditingId(null)}>
                                  Batal
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="button-secondary gap-2 px-4 py-2"
                                  onClick={() => {
                                    setEditingId(category.id);
                                    setEditingName(category.name);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                  Edit
                                </button>
                                {!category.is_default && (
                                  <button className="button-danger gap-2" onClick={() => setDeleteTarget(category)}>
                                    <Trash2 className="h-4 w-4" />
                                    Hapus
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(16,24,40,0.38)] p-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-lg p-6 sm:p-8">
            <p className="eyebrow">Konfirmasi hapus</p>
            <h2 className="mt-2 text-2xl text-ink">Hapus kategori ini?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Tindakan ini tidak bisa dibatalkan. Kategori akan diarsipkan dari daftar aktif.
            </p>

            <div className="mt-4 rounded-xl border border-[#e7e5e4] bg-[#fafaf9] p-4">
              <p className="text-sm text-slate-500">Nama kategori</p>
              <p className="mt-1 text-base font-semibold text-ink">{deleteTarget.name}</p>
              <p className="mt-1 text-sm text-slate-500">
                {deleteTarget.type === "income" ? "Pemasukan" : "Pengeluaran"}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                className="button-danger flex-1 justify-center"
                disabled={isSaving}
                onClick={() => {
                  void handleArchive(deleteTarget).finally(() => setDeleteTarget(null));
                }}
              >
                {isSaving ? "Menghapus..." : "Ya, hapus kategori"}
              </button>
              <button
                className="button-secondary justify-center"
                disabled={isSaving}
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
