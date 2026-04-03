import { AuthFormCard } from "@/components/auth/auth-form-card";

export default function ForgotPasswordPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 app-backdrop" />
      <div className="absolute inset-0 dashboard-grid opacity-40" />

      <div className="relative mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-12">
        <AuthFormCard
          title="Reset password"
          subtitle="Masukkan email Anda, lalu kami kirimkan kode reset untuk melanjutkan proses."
          endpoint="/api/auth/reset-password/request"
          submitLabel="Kirim kode reset"
          fields={[{ name: "email", label: "Email", type: "email", placeholder: "nama@email.com" }]}
        />
      </div>
    </main>
  );
}
