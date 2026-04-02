CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  whatsapp_phone_e164 TEXT UNIQUE,
  whatsapp_phone_verified_at TIMESTAMPTZ,
  timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  default_currency TEXT NOT NULL DEFAULT 'IDR' CHECK (default_currency = 'IDR'),
  reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_frequency TEXT CHECK (reminder_frequency IN ('daily', 'weekly')),
  reminder_time TIME,
  reminder_weekday SMALLINT CHECK (reminder_weekday BETWEEN 0 AND 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount BIGINT NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'IDR' CHECK (currency = 'IDR'),
  transaction_date DATE NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  note TEXT,
  source_channel TEXT NOT NULL CHECK (source_channel IN ('whatsapp_text', 'whatsapp_receipt', 'web_manual')),
  review_status TEXT NOT NULL DEFAULT 'clear' CHECK (review_status IN ('clear', 'need_review')),
  review_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_input_reference TEXT,
  source_message_log_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS receipt_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
  storage_bucket TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  image_url TEXT NOT NULL,
  ocr_text TEXT,
  merchant_name TEXT,
  detected_total BIGINT,
  detected_date DATE,
  ocr_confidence NUMERIC(5,4),
  raw_ocr_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  whatsapp_message_id TEXT NOT NULL UNIQUE,
  wa_from TEXT NOT NULL,
  wa_type TEXT NOT NULL CHECK (wa_type IN ('text', 'image', 'command', 'unknown')),
  raw_text TEXT,
  media_id TEXT,
  media_mime_type TEXT,
  media_sha256 TEXT,
  intent TEXT NOT NULL CHECK (intent IN ('create', 'update_last', 'delete_last', 'link_account', 'unknown')),
  parsed_payload JSONB,
  dedupe_hash TEXT,
  processing_status TEXT NOT NULL CHECK (processing_status IN ('received', 'processed', 'duplicate', 'failed', 'needs_input')),
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  provider_payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_link_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_e164 TEXT NOT NULL,
  link_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transaction_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'system', 'whatsapp')),
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'review_status_changed')),
  before_data JSONB,
  after_data JSONB,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reminder_dispatch_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  message_text TEXT NOT NULL,
  whatsapp_message_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();
CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();
CREATE TRIGGER receipt_attachments_updated_at BEFORE UPDATE ON receipt_attachments FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();
