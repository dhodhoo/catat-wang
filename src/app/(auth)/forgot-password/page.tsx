import { AuthFormCard } from "@/components/auth/auth-form-card";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <AuthFormCard
        title="Reset password"
        subtitle="Minta kode reset password ke email Anda."
        endpoint="/api/auth/reset-password/request"
        submitLabel="Kirim kode reset"
        fields={[{ name: "email", label: "Email", type: "email", placeholder: "nama@email.com" }]}
      />
    </main>
  );
}
