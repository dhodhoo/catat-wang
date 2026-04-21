import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AuthFormCard } from "@/components/auth/auth-form-card";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl space-y-5">
          <AuthFormCard
            title="Buat akun"
            subtitle="Daftar untuk mulai mencatat keuangan."
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
      </div>
    </main>
  );
}
