import Link from "next/link";
import { AuthFormCard } from "@/components/auth/auth-form-card";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <div className="space-y-6">
        <AuthFormCard
          title="Buat akun CatatWang"
          subtitle="Daftar dengan email, lalu hubungkan WhatsApp Anda."
          endpoint="/api/auth/sign-up"
          submitLabel="Daftar"
          fields={[
            { name: "fullName", label: "Nama lengkap", placeholder: "Nama Anda" },
            { name: "email", label: "Email", type: "email", placeholder: "nama@email.com" },
            { name: "password", label: "Password", type: "password", placeholder: "Minimal 6 karakter" }
          ]}
        />
        <p className="text-center text-sm text-slate-500">
          Sudah punya akun? <Link href="/sign-in">Login</Link>
        </p>
      </div>
    </main>
  );
}
