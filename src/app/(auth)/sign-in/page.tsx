import Link from "next/link";
import { ArrowRight, BadgeCheck, MessageCircleMore, WalletCards } from "lucide-react";
import { AuthFormCard } from "@/components/auth/auth-form-card";

export default function SignInPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 app-backdrop" />
      <div className="absolute inset-0 dashboard-grid opacity-40" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="surface-card glow-card order-2 p-8 sm:p-10 lg:order-1">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="status-chip">
                <span className="h-2 w-2 rounded-full bg-moss" />
                CatatWang
              </span>
              <span className="stat-chip">WhatsApp jadi buku kas yang rapi</span>
            </div>

            <div className="space-y-4">
              <p className="eyebrow">Masuk ke workspace keuangan Anda</p>
              <h1 className="section-title max-w-2xl text-balance">
                Ringkas pemasukan dan pengeluaran tanpa pindah-pindah aplikasi.
              </h1>
              <p className="max-w-xl text-base leading-8 text-slate-600">
                Catat transaksi lewat chat, lihat histori yang rapi, lalu cek laporan bulanan di satu tempat
                yang enak dipakai setiap hari.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: MessageCircleMore,
                  title: "Input natural",
                  description: "Tulis seperti biasa di WhatsApp, sistem bantu baca nominal dan kategori."
                },
                {
                  icon: WalletCards,
                  title: "Ringkasan cepat",
                  description: "Dashboard menonjolkan angka paling penting tanpa bikin penuh."
                },
                {
                  icon: BadgeCheck,
                  title: "Lebih tenang",
                  description: "Review transaksi yang meragukan sebelum memengaruhi laporan."
                }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="surface-muted p-5">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-moss shadow-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h2 className="mt-5 text-xl text-ink">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <div className="order-1 space-y-5 lg:order-2">
          <AuthFormCard
            title="Masuk"
            subtitle="Lanjutkan ke dashboard dan pantau arus kas Anda hari ini."
            endpoint="/api/auth/sign-in"
            submitLabel="Masuk"
            fields={[
              { name: "email", label: "Email", type: "email", placeholder: "nama@email.com" },
              { name: "password", label: "Password", type: "password", placeholder: "Masukkan password" }
            ]}
          />

          <div className="flex flex-col gap-3 px-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <Link className="button-ghost w-fit px-0 text-moss hover:bg-transparent" href="/forgot-password">
              Lupa password?
            </Link>
            <Link className="inline-flex items-center gap-2 font-medium text-slate-700 hover:text-moss" href="/sign-up">
              Belum punya akun? Daftar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
