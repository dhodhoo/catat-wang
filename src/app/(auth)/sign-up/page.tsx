import Link from "next/link";
import { AuthFormCard } from "@/components/auth/auth-form-card";

export default function SignUpPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 overflow-hidden">
      {/* Background Architectural Patterns */}
      <div className="absolute inset-0 dashboard-grid opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <AuthFormCard
          title="Daftar"
          subtitle="Buat akun baru untuk mulai mencatat."
          endpoint="/api/auth/sign-up"
          submitLabel="Daftar"
          fields={[
            { name: "fullName", label: "Nama Lengkap", placeholder: "Nama Anda" },
            { name: "email", label: "Email", type: "email", placeholder: "pilot@catatwang.app" },
            { name: "password", label: "Password", type: "password", placeholder: "••••••••" }
          ]}
        />
        <div className="text-center">
          <Link href="/sign-in" className="font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-emerald-500 transition-colors">
            Sudah punya akun? Login
          </Link>
        </div>
      </div>
    </main>
  );
}
