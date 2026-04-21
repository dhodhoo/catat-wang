ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_link_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_dispatch_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_owner_all" ON profiles
  FOR ALL
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "categories_owner_all" ON categories
  FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "transactions_owner_all" ON transactions
  FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "message_logs_owner_all" ON message_logs
  FOR ALL
  USING (user_id = (SELECT auth.uid()) OR user_id IS NULL)
  WITH CHECK (user_id = (SELECT auth.uid()) OR user_id IS NULL);

CREATE POLICY "whatsapp_link_requests_owner_all" ON whatsapp_link_requests
  FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "transaction_audits_owner_all" ON transaction_audits
  FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "reminder_dispatch_logs_owner_all" ON reminder_dispatch_logs
  FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
