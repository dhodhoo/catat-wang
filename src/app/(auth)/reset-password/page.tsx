import { ResetPasswordFlowCard } from "@/components/auth/reset-password-flow-card";

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl space-y-5">
          <ResetPasswordFlowCard defaultEmail={params.email ?? ""} />
        </div>
      </div>
    </main>
  );
}
