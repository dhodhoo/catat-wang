import { AuthFormCard } from "@/components/auth/auth-form-card";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <div className="grid gap-6 lg:grid-cols-2">
        <AuthFormCard
          title="Verifikasi kode reset"
          subtitle="Langkah 1: tukar kode reset menjadi token."
          endpoint="/api/auth/reset-password/verify"
          submitLabel="Verifikasi kode"
          fields={[
            { name: "email", label: "Email", type: "email" },
            { name: "code", label: "Kode reset", placeholder: "123456" }
          ]}
        />
        <AuthFormCard
          title="Set password baru"
          subtitle="Langkah 2: gunakan token dari respons verifikasi."
          endpoint="/api/auth/reset-password/confirm"
          submitLabel="Simpan password baru"
          fields={[
            { name: "token", label: "Token reset" },
            { name: "newPassword", label: "Password baru", type: "password" }
          ]}
        />
      </div>
    </main>
  );
}
