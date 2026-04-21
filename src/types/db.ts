import type { ReminderFrequency, ReviewStatus, SourceChannel, TransactionType } from "@/types/domain";

export interface ProfileRow {
  id: string;
  full_name: string;
  whatsapp_phone_e164: string | null;
  whatsapp_phone_verified_at: string | null;
  timezone: string;
  default_currency: "IDR";
  reminder_enabled: boolean;
  reminder_frequency: ReminderFrequency | null;
  reminder_time: string | null;
  reminder_weekday: number | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  is_default: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransactionRow {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  currency: "IDR";
  transaction_date: string;
  category_id: string;
  note: string | null;
  source_channel: SourceChannel;
  review_status: ReviewStatus;
  review_reasons: unknown[];
  raw_input_reference: string | null;
  source_message_log_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageLogRow {
  id: string;
  user_id: string | null;
  whatsapp_message_id: string;
  wa_from: string;
  wa_type: "text" | "image" | "command" | "unknown";
  raw_text: string | null;
  media_id: string | null;
  media_mime_type: string | null;
  media_sha256: string | null;
  intent: "create" | "update_last" | "delete_last" | "link_account" | "unknown";
  parsed_payload: unknown;
  dedupe_hash: string | null;
  processing_status: "received" | "processed" | "duplicate" | "failed" | "needs_input";
  transaction_id: string | null;
  provider_payload: unknown;
  received_at: string;
  created_at: string;
}
