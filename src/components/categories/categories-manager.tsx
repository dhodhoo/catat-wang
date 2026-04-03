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
    if (!window.confirm(`Hapus kategori "${category.name}"?`)) return;
    try {
      setIsSaving(true);
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
    <div className="space-y-12">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-md glow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <span className="font-mono text-4xl uppercase">KATEGORI</span>
        </div>
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-500">Master Data</p>
          <h2 className="text-2xl font-bold tracking-tight">Kategori Baru</h2>
        </div>
        
        <div className="flex flex-col gap-6 md:flex-row md:items-end">
          <div className="flex-1 space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-wider text-slate-500" htmlFor="node-name">NAMA KATEGORI</label>
            <input
              className="w-full bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 text-slate-200 outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700"
              id="node-name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Jajan Bakso"
              value={name}
            />
          </div>
          <div className="w-full md:w-56 space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-wider text-slate-500" htmlFor="node-type">TIPE</label>
            <select
              className="w-full bg-slate-950 rounded-xl border border-slate-800 px-4 py-3 text-slate-200 outline-none focus:border-emerald-500/50 transition-all appearance-none"
              id="node-type"
              onChange={(e) => setType(e.target.value as any)}
              value={type}
            >
              <option value="expense">PENGELUARAN</option>
              <option value="income">PEMASUKAN</option>
            </select>
          </div>
          <button
            className="rounded-xl bg-emerald-500 px-8 py-3.5 font-bold text-slate-950 hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 h-[52px]"
            disabled={isSaving || !name.trim()}
            onClick={handleCreate}
          >
            TAMBAH
          </button>
        </div>
        {message && <p className="mt-4 font-mono text-[10px] text-rose-500 uppercase tracking-tight">{message}</p>}
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activeCategories.map((category) => {
          const isEditing = editingId === category.id;
          return (
            <article key={category.id} className="group relative rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm transition-all hover:bg-slate-900/60 glow-card">
              <div className="flex items-start justify-between mb-6">
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <input
                      autoFocus
                      className="w-full bg-slate-950 rounded-lg border border-emerald-500/50 px-3 py-1.5 text-sm outline-none font-bold text-white transition-all"
                      onChange={(e) => setEditingName(e.target.value)}
                      value={editingName}
                    />
                  ) : (
                    <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors uppercase">{category.name}</h3>
                  )}
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    {category.type === "income" ? "PEMASUKAN" : "PENGELUARAN"}
                  </p>
                </div>
                <span className={`rounded-lg px-2 py-1 text-[8px] font-mono tracking-widest uppercase ${category.is_default ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                  {category.is_default ? "DEFAULT" : "CUSTOM"}
                </span>
              </div>
              
              <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                {isEditing ? (
                  <>
                    <button
                      className="text-[10px] font-mono border border-emerald-900 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/50 px-3 py-1.5 rounded-lg transition-all"
                      onClick={() => handleUpdate(category.id)}
                    >
                      SIMPAN
                    </button>
                    <button
                      className="text-[10px] font-mono border border-slate-700 text-slate-400 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-all"
                      onClick={() => setEditingId(null)}
                    >
                      BATAL
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="text-[10px] font-mono border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all"
                      onClick={() => { setEditingId(category.id); setEditingName(category.name); }}
                    >
                      EDIT
                    </button>
                    {!category.is_default && (
                      <button
                        className="text-[10px] font-mono border border-rose-900 bg-rose-950/30 text-rose-400 hover:bg-rose-900/50 px-3 py-1.5 rounded-lg transition-all"
                        onClick={() => handleArchive(category)}
                      >
                        HAPUS
                      </button>
                    )}
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
