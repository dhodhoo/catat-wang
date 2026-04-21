import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AuthFormCard } from "@/components/auth/auth-form-card";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl space-y-5">
          <AuthFormCard
            title="Masuk"
            subtitle="Masuk ke akun CatatWang Anda."
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
