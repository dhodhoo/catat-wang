import Link from "next/link";
import { AuthFormCard } from "@/components/auth/auth-form-card";

export default function SignInPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 overflow-hidden">
      {/* Background Architectural Patterns */}
      <div className="absolute inset-0 dashboard-grid opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <AuthFormCard
          title="Login"
          subtitle="Masukkan akun Anda untuk melanjutkan."
          endpoint="/api/auth/sign-in"
          submitLabel="Login"
          fields={[
            { name: "email", label: "Email", type: "email", placeholder: "pilot@catatwang.app" },
            { name: "password", label: "Password", type: "password", placeholder: "••••••••" }
          ]}
        />
        <div className="text-center">
          <Link href="/forgot-password" className="font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-emerald-500 transition-colors">
            Lupa Password?
          </Link>
        </div>
      </div>
    </main>
  );
}
