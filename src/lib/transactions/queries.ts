import { startOfMonth, subDays } from "date-fns";
import { createInsforgeServerClient } from "@/lib/insforge/server";
import { extractRelationName } from "@/lib/utils/db";
import type { CashflowBucket, DashboardSummary } from "@/types/domain";

export async function getDashboardSummary(accessToken: string, userId: string): Promise<DashboardSummary> {
  const client = createInsforgeServerClient(accessToken);
  const fromDate = startOfMonth(new Date()).toISOString().slice(0, 10);

  const { data, error } = await client.database
    .from("transactions")
    .select("type, amount")
    .eq("user_id", userId)
    .gte("transaction_date", fromDate);

  if (error) {
    throw new Error(error.message);
  }

  const incomeTotal = (data ?? [])
    .filter((item: { type: string }) => item.type === "income")
    .reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);
  const expenseTotal = (data ?? [])
    .filter((item: { type: string }) => item.type === "expense")
    .reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);

  return {
    incomeTotal,
    expenseTotal,
    netCashflow: incomeTotal - expenseTotal
  };
}

export async function getCashflowSeries(accessToken: string, userId: string): Promise<CashflowBucket[]> {
  const client = createInsforgeServerClient(accessToken);
  const fromDate = subDays(new Date(), 6).toISOString().slice(0, 10);
  const { data, error } = await client.database
    .from("transactions")
    .select("transaction_date, type, amount")
    .eq("user_id", userId)
    .gte("transaction_date", fromDate)
    .order("transaction_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const buckets = new Map<string, CashflowBucket>();
  for (const row of data ?? []) {
    if (!buckets.has(row.transaction_date)) {
      buckets.set(row.transaction_date, {
        label: row.transaction_date,
        incomeTotal: 0,
        expenseTotal: 0,
        netCashflow: 0
      });
    }

    const bucket = buckets.get(row.transaction_date)!;
    if (row.type === "income") {
      bucket.incomeTotal += row.amount;
    } else {
      bucket.expenseTotal += row.amount;
    }
    bucket.netCashflow = bucket.incomeTotal - bucket.expenseTotal;
  }

  return Array.from(buckets.values());
}

export interface DashboardRecentTransaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  transactionDate: string;
  note: string | null;
  categoryName: string;
}

export interface DashboardTopExpenseCategory {
  name: string;
  total: number;
}

export async function getDashboardRecentTransactions(
  accessToken: string,
  userId: string,
  limit = 5
): Promise<DashboardRecentTransaction[]> {
  const client = createInsforgeServerClient(accessToken);
  const { data, error } = await client.database
    .from("transactions")
    .select("id, amount, type, transaction_date, note, categories(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    amount: row.amount,
    type: row.type,
    transactionDate: row.transaction_date,
    note: row.note,
    categoryName: extractRelationName(row.categories) ?? "Lainnya"
  }));
}

export async function getDashboardTopExpenseCategories(
  accessToken: string,
  userId: string,
  limit = 4
): Promise<DashboardTopExpenseCategory[]> {
  const client = createInsforgeServerClient(accessToken);
  const { data, error } = await client.database
    .from("transactions")
    .select("amount, categories(name)")
    .eq("user_id", userId)
    .eq("type", "expense");

  if (error) {
    throw new Error(error.message);
  }

  const aggregate = new Map<string, number>();
  for (const row of data ?? []) {
    const name = extractRelationName(row.categories) ?? "Lainnya";
    aggregate.set(name, (aggregate.get(name) ?? 0) + row.amount);
  }

  return Array.from(aggregate.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}
