import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(239,111,82,0.18),_transparent_32%),linear-gradient(180deg,_#faf7f2_0%,_#f4ecdf_100%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-between px-6 py-12">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="inline-flex rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-moss shadow-card">
              WhatsApp-first personal finance
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-ink">
                Catat pemasukan dan pengeluaran secepat kirim chat.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                CatatWang mengubah chat WhatsApp dan foto struk menjadi transaksi yang
                otomatis tersimpan, lalu merangkum cashflow harian, mingguan, dan bulanan
                di dashboard web yang ringan.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#db5b3f]"
                href="/sign-up"
              >
                Mulai gratis
              </Link>
              <Link
                className="rounded-full border border-moss/20 bg-white px-6 py-3 text-sm font-semibold text-moss shadow-card transition hover:border-moss/40"
                href="/sign-in"
              >
                Login
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] bg-white/90 p-6 shadow-card">
            <div className="space-y-4 rounded-[1.5rem] bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-300">WhatsApp Preview</p>
              <div className="rounded-2xl bg-slate-800 p-4">
                <p className="text-sm text-slate-200">jajan 25rb</p>
              </div>
              <div className="rounded-2xl bg-moss p-4">
                <p className="text-sm">
                  Tercatat: Pengeluaran Rp25.000, kategori Makan &amp; Minum, hari ini.
                  Balas UBAH atau HAPUS bila perlu.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-800 p-4">
                <p className="text-sm text-slate-200">[foto struk]</p>
              </div>
              <div className="rounded-2xl bg-moss p-4">
                <p className="text-sm">
                  Tercatat dari struk: Pengeluaran Rp72.500 di Indomaret. Balas UBAH atau
                  HAPUS bila perlu.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
