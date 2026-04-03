import { AuthFormCard } from "@/components/auth/auth-form-card";

export default function ResetPasswordPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 app-backdrop" />
      <div className="absolute inset-0 dashboard-grid opacity-40" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <AuthFormCard
            title="Verifikasi kode reset"
            subtitle="Langkah 1. Tukar kode reset dari email menjadi token yang bisa dipakai."
            endpoint="/api/auth/reset-password/verify"
            submitLabel="Verifikasi kode"
            fields={[
              { name: "email", label: "Email", type: "email" },
              { name: "code", label: "Kode reset", placeholder: "123456" }
            ]}
          />
          <AuthFormCard
            title="Set password baru"
            subtitle="Langkah 2. Gunakan token hasil verifikasi untuk menyimpan password baru."
            endpoint="/api/auth/reset-password/confirm"
            submitLabel="Simpan password baru"
            fields={[
              { name: "token", label: "Token reset" },
              { name: "newPassword", label: "Password baru", type: "password" }
            ]}
          />
        </div>
      </div>
    </main>
  );
}
