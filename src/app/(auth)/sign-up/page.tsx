import Link from "next/link";
import { ArrowRight, ChartColumnBig, ShieldCheck, Sparkles } from "lucide-react";
import { AuthFormCard } from "@/components/auth/auth-form-card";

export default function SignUpPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 app-backdrop" />
      <div className="absolute inset-0 dashboard-grid opacity-40" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-6 py-12 lg:grid-cols-[0.98fr_1.02fr]">
        <div className="order-2 space-y-5 lg:order-1">
          <AuthFormCard
            title="Buat akun"
            subtitle="Siapkan workspace baru untuk mencatat transaksi via WhatsApp dan web."
            endpoint="/api/auth/sign-up"
            submitLabel="Buat akun"
            fields={[
              { name: "fullName", label: "Nama Lengkap", placeholder: "Nama Anda" },
              { name: "email", label: "Email", type: "email", placeholder: "nama@email.com" },
              { name: "password", label: "Password", type: "password", placeholder: "Buat password yang kuat" }
            ]}
          />

          <div className="flex justify-end px-2 text-sm text-slate-600">
            <Link className="inline-flex items-center gap-2 font-medium text-slate-700 hover:text-moss" href="/sign-in">
              Sudah punya akun? Masuk
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <section className="surface-card glow-card order-1 p-8 sm:p-10 lg:order-2">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="status-chip">
                <span className="h-2 w-2 rounded-full bg-coral" />
                Onboarding cepat
              </span>
              <span className="stat-chip">Cocok untuk dipakai tiap hari</span>
            </div>

            <div className="space-y-4">
              <p className="eyebrow">Mulai dari pencatatan yang lebih ringan</p>
              <h1 className="section-title max-w-2xl text-balance">
                Bikin sistem keuangan pribadi yang terasa sederhana sejak hari pertama.
              </h1>
              <p className="max-w-xl text-base leading-8 text-slate-600">
                Begitu akun aktif, Anda bisa sambungkan WhatsApp, cek transaksi yang masuk, dan lihat laporan
                bulanan tanpa setup yang ribet.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Sparkles,
                  title: "Cepat aktif",
                  description: "Daftar, verifikasi, lalu langsung mulai mencatat."
                },
                {
                  icon: ChartColumnBig,
                  title: "Siap dianalisis",
                  description: "Data yang masuk langsung tersusun untuk dashboard dan laporan."
                },
                {
                  icon: ShieldCheck,
                  title: "Lebih tertib",
                  description: "Kategori, reminder, dan review status membantu kebiasaan finansial."
                }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="surface-muted p-5">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-coral shadow-sm">
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
      </div>
    </main>
  );
}
