import { createInsforgeAdminClient } from "@/lib/insforge/server";

type TransactionWithCategory = {
  amount: number | string;
  type?: "income" | "expense" | null;
  categories?: {
    name?: string | null;
    type?: "income" | "expense" | null;
  } | null;
};

export interface GenerateMonthlyReportInput {
  userId: string;
  month: number;
  year: number;
}

export interface GeneratedMonthlyReportSummary {
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  transactionCount: number;
  topCategories: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
}

function toMonthYearDate(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

export function getMonthDateRange(year: number, month: number) {
  const startDate = toMonthYearDate(year, month);
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { startDate, endDate };
}

export function buildMonthlyReportSummary(transactions: TransactionWithCategory[]): GeneratedMonthlyReportSummary {
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals: Record<string, number> = {};

  for (const tx of transactions) {
    const amount = Number(tx.amount ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      continue;
    }

    const txType = tx.type ?? tx.categories?.type ?? "expense";
    const categoryName = tx.categories?.name || "Uncategorized";

    if (txType === "income") {
      totalIncome += amount;
      continue;
    }

    totalExpense += amount;
    categoryTotals[categoryName] = (categoryTotals[categoryName] ?? 0) + amount;
  }

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
    }));

  return {
    totalIncome,
    totalExpense,
    netCashflow: totalIncome - totalExpense,
    transactionCount: transactions.length,
    topCategories
  };
}

export async function generateMonthlyReportForUser(input: GenerateMonthlyReportInput) {
  const { userId, month, year } = input;
  const { startDate, endDate } = getMonthDateRange(year, month);
  const client = createInsforgeAdminClient();

  const { data: transactions, error: txError } = await client.database
    .from("transactions")
    .select("amount, type, categories(name, type)")
    .eq("user_id", userId)
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate);

  if (txError) {
    throw new Error(txError.message);
  }

  const summary = buildMonthlyReportSummary((transactions ?? []) as TransactionWithCategory[]);
  const now = new Date().toISOString();

  const { error: upsertError } = await client.database
    .from("monthly_reports")
    .upsert(
      {
        user_id: userId,
        month_year: startDate,
        total_income: summary.totalIncome,
        total_expense: summary.totalExpense,
        net_cashflow: summary.netCashflow,
        top_categories: summary.topCategories,
        transaction_count: summary.transactionCount,
        generated_at: now,
        updated_at: now
      },
      { onConflict: "user_id, month_year" }
    );

  if (upsertError) {
    throw new Error(upsertError.message);
  }

  return summary;
}
