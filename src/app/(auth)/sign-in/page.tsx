import Link from "next/link";
import { AuthFormCard } from "@/components/auth/auth-form-card";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <div className="space-y-6">
        <AuthFormCard
          title="Masuk ke dashboard"
          subtitle="Login untuk melihat cashflow dan mengelola transaksi."
          endpoint="/api/auth/sign-in"
          submitLabel="Login"
          fields={[
            { name: "email", label: "Email", type: "email", placeholder: "nama@email.com" },
            { name: "password", label: "Password", type: "password", placeholder: "Password Anda" }
          ]}
        />
        <div className="text-center text-sm text-slate-500">
          <Link href="/forgot-password">Lupa password?</Link>
        </div>
      </div>
    </main>
  );
}
