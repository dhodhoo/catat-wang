import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { requireCurrentUser } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { createInsforgeServerClient } from "@/lib/insforge/server";

export default async function TransactionsPage() {
  const user = await requireCurrentUser();
  const accessToken = (await getAccessTokenFromCookies()) ?? "";
  const client = createInsforgeServerClient(accessToken);
  const { data: categories } = await client.database
    .from("categories")
    .select("id, name, type")
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .order("name", { ascending: true });

  return (
    <DashboardShell title="Transaksi">
      <TransactionsTable categories={(categories ?? []) as any[]} />
    </DashboardShell>
  );
}
