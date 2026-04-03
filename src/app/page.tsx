import Link from "next/link";
import { ArrowRight, ChartNoAxesCombined, MessageCircleMore, ShieldCheck, Wallet } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 app-backdrop" />
      <div className="absolute inset-0 dashboard-grid opacity-40" />

      <div className="relative mx-auto max-w-7xl px-6 py-6">
        <header className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-moss text-white shadow-card">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <p className="eyebrow">CatatWang</p>
              <p className="text-sm text-slate-600">WhatsApp-first personal finance tracker</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link className="button-ghost" href="/sign-in">
              Masuk
            </Link>
            <Link className="button-primary" href="/sign-up">
              Coba sekarang
            </Link>
          </div>
        </header>

        <section className="grid gap-10 pb-10 pt-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pb-16 lg:pt-16">
          <div className="space-y-8">
            <div className="flex flex-wrap gap-3">
              <span className="status-chip">
                <span className="h-2 w-2 rounded-full bg-coral" />
                Dibuat untuk ritme harian
              </span>
              <span className="stat-chip">Lebih nyaman dibuka di mobile maupun desktop</span>
            </div>

            <div className="space-y-5">
              <p className="eyebrow">Catat uang tanpa memaksa Anda belajar aplikasi rumit</p>
              <h1 className="text-5xl leading-none text-ink sm:text-6xl lg:text-7xl">
                Chat masuk,
                <br />
                buku kas rapi,
                <br />
                keputusan lebih tenang.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                CatatWang mengubah pesan WhatsApp menjadi transaksi yang tertata, dashboard yang mudah dibaca,
                dan laporan bulanan yang enak ditinjau kapan saja.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link className="button-primary gap-2 px-6 py-4 text-base" href="/sign-up">
                Buat akun gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className="button-secondary gap-2 px-6 py-4 text-base" href="/sign-in">
                Lihat dashboard
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Input natural", value: "WA", description: "Tulis transaksi seperti biasa lewat chat." },
                { label: "Review cepat", value: "<1 mnt", description: "Cek transaksi yang perlu perhatian." },
                { label: "Laporan bulanan", value: "1 klik", description: "Ringkasan siap ditinjau kapan saja." }
              ].map((item) => (
                <article key={item.label} className="surface-muted p-5">
                  <p className="eyebrow">{item.label}</p>
                  <p className="mt-4 text-3xl text-ink">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="surface-panel glow-card p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <section className="rounded-[1.7rem] border border-[#ded4c4] bg-[#fbf6ee] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="eyebrow">Simulasi chat</p>
                    <h2 className="mt-2 text-2xl text-ink">Pencatatan terasa natural</h2>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-moss shadow-sm">
                    <MessageCircleMore className="h-5 w-5" />
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="max-w-[82%] rounded-[1.35rem] rounded-tl-md bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                    makan siang 38 ribu di warteg
                  </div>
                  <div className="ml-auto max-w-[86%] rounded-[1.35rem] rounded-tr-md bg-moss px-4 py-3 text-sm text-white shadow-sm">
                    Tercatat sebagai pengeluaran makan: <strong>Rp38.000</strong>
                    <div className="mt-2 text-xs text-white/70">Kategori tersimpan otomatis, siap direview.</div>
                  </div>
                  <div className="max-w-[82%] rounded-[1.35rem] rounded-tl-md bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                    gaji bulan april 8 juta
                  </div>
                  <div className="ml-auto max-w-[86%] rounded-[1.35rem] rounded-tr-md bg-coral px-4 py-3 text-sm text-white shadow-sm">
                    Pemasukan masuk ke laporan bulan ini: <strong>Rp8.000.000</strong>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="surface-card p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="eyebrow">Snapshot hari ini</p>
                      <h2 className="mt-2 text-2xl text-ink">Arus kas terkini</h2>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff6ea] text-coral">
                      <ChartNoAxesCombined className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    {[
                      { label: "Pemasukan", value: "Rp8.500.000", accent: "text-moss" },
                      { label: "Pengeluaran", value: "Rp2.140.000", accent: "text-coral" },
                      { label: "Sisa aman", value: "Rp6.360.000", accent: "text-ink" }
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-2xl bg-[#fffaf3] px-4 py-3">
                        <span className="text-sm text-slate-500">{item.label}</span>
                        <span className={`text-base font-semibold ${item.accent}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="surface-card p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-moss">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="eyebrow">Kenapa terasa nyaman</p>
                      <h2 className="mt-2 text-xl text-ink">Semua angka penting muncul lebih dulu</h2>
                    </div>
                  </div>
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                    <li>Prioritas visual jelas, jadi Anda tidak perlu menebak angka mana yang harus dilihat.</li>
                    <li>Tabel dan kartu transaksi tetap mudah dipakai di layar kecil.</li>
                    <li>Alur koneksi WhatsApp dibikin lebih bertahap dan gampang diikuti.</li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </section>

        <section className="grid gap-5 pb-12 md:grid-cols-3">
          {[
            {
              title: "1. Hubungkan WhatsApp",
              description: "Aktifkan sesi, scan QR, lalu verifikasi nomor Anda supaya chat bisa dikenali."
            },
            {
              title: "2. Catat seperti biasa",
              description: "Tulis pemasukan atau pengeluaran dengan bahasa natural, sistem bantu menstrukturkan."
            },
            {
              title: "3. Tinjau dan perbaiki",
              description: "Periksa transaksi, edit bila perlu, lalu nikmati laporan bulanan yang lebih rapi."
            }
          ].map((item) => (
            <article key={item.title} className="surface-card p-6">
              <p className="eyebrow">Alur penggunaan</p>
              <h2 className="mt-4 text-2xl text-ink">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
