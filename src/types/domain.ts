export type TransactionType = "income" | "expense";

export type SourceChannel = "whatsapp_text" | "whatsapp_receipt" | "web_manual";

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
