import type {
  DashboardSummary,
  ReminderFrequency,
  ReviewStatus,
  SourceChannel,
  TransactionType
} from "@/types/domain";

export interface ApiErrorBody {
  error: string;
  message: string;
}

export interface AuthSuccessBody {
  status: "ok" | "signed_in" | "verification_required" | "verified";
  verifyMethod?: "code";
  email?: string;
}

export interface TransactionResponseItem {
  id: string;
  type: TransactionType;
  amount: number;
  currency: "IDR";
  transactionDate: string;
  categoryId: string;
  categoryName: string;
  note: string | null;
  sourceChannel: SourceChannel;
  reviewStatus: ReviewStatus;
  createdAt: string;
}

export interface TransactionsListResponse {
  data: TransactionResponseItem[];
  count: number;
}

export interface DashboardSummaryResponse extends DashboardSummary {}

export interface ReminderSettingsResponse {
  enabled: boolean;
  frequency: ReminderFrequency | null;
  time: string | null;
  weekday: number | null;
}
