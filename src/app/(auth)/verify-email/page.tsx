import { VerifyEmailCard } from "@/components/auth/verify-email-card";

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 app-backdrop" />
      <div className="absolute inset-0 dashboard-grid opacity-40" />

      <div className="relative mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-12">
        <VerifyEmailCard defaultEmail={params.email ?? ""} />
      </div>
    </main>
  );
}
