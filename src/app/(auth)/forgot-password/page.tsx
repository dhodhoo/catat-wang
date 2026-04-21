import { AuthFormCard } from "@/components/auth/auth-form-card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl space-y-5">
          <AuthFormCard
            title="Reset password"
            subtitle="Masukkan email untuk menerima kode reset."
            endpoint="/api/auth/reset-password/request"
            submitLabel="Kirim kode reset"
            fields={[{ name: "email", label: "Email", type: "email", placeholder: "nama@email.com" }]}
          />
          <div className="flex justify-end px-2 text-sm text-slate-600">
            <Link className="inline-flex items-center gap-2 font-medium text-slate-700 hover:text-moss" href="/sign-in">
              Kembali ke halaman masuk
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
