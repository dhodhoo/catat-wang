import { AuthFormCard } from "@/components/auth/auth-form-card";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl space-y-5">
          <AuthFormCard
            title="Verifikasi kode reset"
            subtitle="Langkah 1: verifikasi kode dari email."
            endpoint="/api/auth/reset-password/verify"
            submitLabel="Verifikasi kode"
            fields={[
              { name: "email", label: "Email", type: "email" },
              { name: "code", label: "Kode reset", placeholder: "123456" }
            ]}
          />
          <AuthFormCard
            title="Set password baru"
            subtitle="Langkah 2: simpan password baru menggunakan token."
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
