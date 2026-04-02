import { VerifyEmailCard } from "@/components/auth/verify-email-card";

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <VerifyEmailCard defaultEmail={params.email ?? ""} />
    </main>
  );
}
