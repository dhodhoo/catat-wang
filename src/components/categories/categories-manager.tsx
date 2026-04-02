"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const activeCategories = categories.filter((category) => !category.is_archived);

  async function handleCreate() {
    if (!name.trim()) {
      setMessage("Nama kategori wajib diisi.");
      return;
    }

    try {
      setIsSaving(true);
      setMessage(null);
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Gagal membuat kategori.");
      }

      setCategories((current) => [payload.data, ...current]);
      setName("");
      setType("expense");
      setMessage("Kategori berhasil ditambahkan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal membuat kategori.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!editingName.trim()) {
      setMessage("Nama kategori tidak boleh kosong.");
      return;
    }

    try {
      setIsSaving(true);
      setMessage(null);
      const response = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingName.trim()
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Gagal mengubah kategori.");
      }

      setCategories((current) => current.map((category) => (category.id === id ? payload.data : category)));
      setEditingId(null);
      setEditingName("");
      setMessage("Kategori berhasil diubah.");
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
        body: JSON.stringify({
          isArchived: true
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Gagal menghapus kategori.");
      }

      setCategories((current) => current.map((item) => (item.id === category.id ? payload.data : item)));
      setMessage(`Kategori ${category.name} dihapus dari daftar aktif.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menghapus kategori.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="new-category-name">
              Nama kategori
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-amber-400"
              id="new-category-name"
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Ngopi"
              value={name}
            />
          </div>
          <div className="w-full md:w-48">
            <label className="text-sm font-medium text-slate-700" htmlFor="new-category-type">
              Tipe
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
              id="new-category-type"
              onChange={(event) => setType(event.target.value as "income" | "expense")}
              value={type}
            >
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
            </select>
          </div>
          <button
            className="rounded-full bg-moss px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
            onClick={handleCreate}
            type="button"
          >
            Tambah kategori
          </button>
        </div>
        {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {activeCategories.map((category) => {
          const isEditing = editingId === category.id;

          return (
            <article key={category.id} className="rounded-[1.75rem] bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <input
                      autoFocus
                      className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-amber-400"
                      onChange={(event) => setEditingName(event.target.value)}
                      value={editingName}
                    />
                  ) : (
                    <p className="text-lg font-semibold">{category.name}</p>
                  )}
                  <p className="mt-1 text-sm text-slate-500">{category.type === "income" ? "Pemasukan" : "Pengeluaran"}</p>
                </div>
                <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-moss">
                  {category.is_default ? "Default" : "Custom"}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {isEditing ? (
                  <>
                    <button
                      className="rounded-full bg-moss px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isSaving}
                      onClick={() => handleUpdate(category.id)}
                      type="button"
                    >
                      Simpan
                    </button>
                    <button
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                      onClick={() => {
                        setEditingId(null);
                        setEditingName("");
                      }}
                      type="button"
                    >
                      Batal
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isSaving}
                      onClick={() => {
                        setEditingId(category.id);
                        setEditingName(category.name);
                      }}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-full border border-coral/30 bg-coral/5 px-4 py-2 text-sm font-medium text-coral disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isSaving || category.is_default}
                      onClick={() => handleArchive(category)}
                      type="button"
                    >
                      Hapus
                    </button>
                  </>
                )}
              </div>
              {category.is_default ? (
                <p className="mt-3 text-xs text-slate-500">Kategori default tidak bisa dihapus.</p>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
