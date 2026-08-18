-- Melak chat message persistence (Vision M1 pilot)
CREATE TABLE IF NOT EXISTS melak_messages (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  question_id TEXT REFERENCES questions(id) ON DELETE SET NULL,
  session_id TEXT REFERENCES practice_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS melak_messages_user_created_idx
  ON melak_messages (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS melak_messages_user_day_idx
  ON melak_messages (user_id, created_at);
