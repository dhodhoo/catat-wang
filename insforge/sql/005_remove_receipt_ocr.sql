-- Remove legacy OCR receipt artifacts and align source channel enum.
UPDATE transactions
SET source_channel = 'whatsapp_text'
WHERE source_channel = 'whatsapp_receipt';

ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS transactions_source_channel_check;

ALTER TABLE transactions
  ADD CONSTRAINT transactions_source_channel_check
  CHECK (source_channel IN ('whatsapp_text', 'web_manual'));

DROP INDEX IF EXISTS idx_receipt_attachments_user_id;
DROP POLICY IF EXISTS "receipt_attachments_owner_all" ON receipt_attachments;
ALTER TABLE IF EXISTS receipt_attachments DISABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS receipt_attachments_updated_at ON receipt_attachments;
DROP TABLE IF EXISTS receipt_attachments;
