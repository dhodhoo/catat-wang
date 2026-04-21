import { VerifyEmailCard } from "@/components/auth/verify-email-card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl space-y-5">
          <VerifyEmailCard defaultEmail={params.email ?? ""} />
          <div className="flex justify-end px-2 text-sm text-slate-600">
            <Link className="inline-flex items-center gap-2 font-medium text-slate-700 hover:text-moss" href="/sign-in">
              Kembali ke halaman masuk
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
