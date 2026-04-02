CREATE OR REPLACE FUNCTION seed_default_categories_for_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO categories (user_id, name, type, is_default)
  VALUES
    (target_user_id, 'Makan & Minum', 'expense', TRUE),
    (target_user_id, 'Transportasi', 'expense', TRUE),
    (target_user_id, 'Belanja', 'expense', TRUE),
    (target_user_id, 'Tagihan', 'expense', TRUE),
    (target_user_id, 'Hiburan', 'expense', TRUE),
    (target_user_id, 'Kesehatan', 'expense', TRUE),
    (target_user_id, 'Pendidikan', 'expense', TRUE),
    (target_user_id, 'Hadiah', 'expense', TRUE),
    (target_user_id, 'Lainnya', 'expense', TRUE),
    (target_user_id, 'Gaji', 'income', TRUE),
    (target_user_id, 'Bonus', 'income', TRUE),
    (target_user_id, 'Lainnya', 'income', TRUE)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
