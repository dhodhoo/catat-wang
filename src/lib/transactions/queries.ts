import { startOfMonth, subDays } from "date-fns";
import { createInsforgeServerClient } from "@/lib/insforge/server";
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
