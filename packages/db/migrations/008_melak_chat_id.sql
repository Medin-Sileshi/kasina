-- Adey AI / Melak conversation isolation (K1)
ALTER TABLE melak_messages
  ADD COLUMN IF NOT EXISTS chat_id UUID;

CREATE INDEX IF NOT EXISTS melak_messages_user_chat_created_idx
  ON melak_messages (user_id, chat_id, created_at);
