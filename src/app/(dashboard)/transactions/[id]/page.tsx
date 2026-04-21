import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireCurrentUser } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { createInsforgeServerClient } from "@/lib/insforge/server";
import { extractRelationName } from "@/lib/utils/db";
import { formatCurrency } from "@/lib/utils/format";

export default async function TransactionDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireCurrentUser();
  const accessToken = (await getAccessTokenFromCookies()) ?? "";
  const client = createInsforgeServerClient(accessToken);
  const { data } = await client.database
    .from("transactions")
    .select("*, categories(name)")
    .eq("user_id", user.id)
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  return (
    <DashboardShell title="Detail transaksi">
      <div className="surface-card p-6">
        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Nominal</dt>
            <dd className="text-xl font-semibold">{formatCurrency(data.amount)}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Kategori</dt>
            <dd>{extractRelationName(data.categories) ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Tanggal</dt>
            <dd>{data.transaction_date}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Source</dt>
            <dd>{data.source_channel}</dd>
          </div>
        </dl>
      </div>
    </DashboardShell>
  );
}
