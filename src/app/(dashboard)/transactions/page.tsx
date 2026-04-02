import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { requireCurrentUser } from "@/lib/insforge/auth";
import { getAccessTokenFromCookies } from "@/lib/insforge/cookies";
import { createInsforgeServerClient } from "@/lib/insforge/server";
import { extractRelationName } from "@/lib/utils/db";

export default async function TransactionsPage() {
  const user = await requireCurrentUser();
  const accessToken = (await getAccessTokenFromCookies()) ?? "";
  const client = createInsforgeServerClient(accessToken);
  const { data } = await client.database
    .from("transactions")
    .select("id, amount, type, transaction_date, category_id, note, review_status, categories(name)")
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: false })
    .limit(50);
  const { data: categories } = await client.database
    .from("categories")
    .select("id, name, type")
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .order("name", { ascending: true });

  const transactions = (data ?? []).map((item: any) => ({
    id: item.id,
    amount: item.amount,
    type: item.type,
    transactionDate: item.transaction_date,
    note: item.note,
    reviewStatus: item.review_status,
    categoryId: item.category_id,
    categoryName: extractRelationName(item.categories) ?? "-"
  }));

  return (
    <DashboardShell
      title="Histori transaksi"
      subtitle="Review, edit, atau hapus transaksi yang masuk dari WhatsApp maupun input manual."
    >
      <TransactionsTable initialTransactions={transactions} categories={(categories ?? []) as any[]} />
    </DashboardShell>
  );
}
