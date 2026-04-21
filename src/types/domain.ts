export type TransactionType = "income" | "expense";

export type SourceChannel = "whatsapp_text" | "web_manual";

export type ReviewStatus = "clear" | "need_review";

export type ReminderFrequency = "daily" | "weekly";

export type MessageIntent =
  | "create"
  | "update_last"
  | "delete_last"
  | "link_account"
  | "unknown";

export interface ReviewReason {
  code: string;
  message: string;
}

export interface ParsedTransactionCandidate {
  type: TransactionType;
  amount: number;
  transactionDate: string;
  categoryName: string;
  note: string | null;
  reviewStatus: ReviewStatus;
  reviewReasons: ReviewReason[];
}

export interface CreateIntentPayload {
  intent: "create";
  transaction: ParsedTransactionCandidate;
}

export interface UpdateLastIntentPayload {
  intent: "update_last";
  patch: {
    amount?: number;
    categoryName?: string;
    transactionDate?: string;
  };
}

export interface DeleteLastIntentPayload {
  intent: "delete_last";
}

export interface LinkAccountIntentPayload {
  intent: "link_account";
  code: string;
}

export interface UnknownIntentPayload {
  intent: "unknown";
}

export type ParsedIncomingText =
  | CreateIntentPayload
  | UpdateLastIntentPayload
  | DeleteLastIntentPayload
  | LinkAccountIntentPayload
  | UnknownIntentPayload;

export type BatchItemStatus = "parsed" | "unknown" | "rejected";

export interface BatchParsedItem {
  raw: string;
  parsed: ParsedIncomingText;
  status: BatchItemStatus;
  reason?: string;
}

export interface BatchParseResult {
  status: "ok" | "mixed_not_allowed";
  items: BatchParsedItem[];
  message?: string;
}

export interface DashboardSummary {
  incomeTotal: number;
  expenseTotal: number;
  netCashflow: number;
}

export interface CashflowBucket {
  label: string;
  incomeTotal: number;
  expenseTotal: number;
  netCashflow: number;
}
export interface CategorySummary {
  name: string;
  amount: number;
  percentage: number;
}

export interface MonthlyReport {
  id: string;
  user_id: string;
  month_year: string;
  total_income: number;
  total_expense: number;
  net_cashflow: number;
  top_categories: CategorySummary[];
  transaction_count: number;
  generated_at: string;
}
