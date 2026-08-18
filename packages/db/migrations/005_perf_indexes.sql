-- Query performance for progress, weak topics, and in-progress sessions
CREATE INDEX IF NOT EXISTS practice_sessions_user_started_idx
  ON practice_sessions (user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS practice_sessions_user_incomplete_idx
  ON practice_sessions (user_id, completed_at)
  WHERE completed_at IS NULL;

CREATE INDEX IF NOT EXISTS answers_question_idx
  ON answers (question_id);

CREATE INDEX IF NOT EXISTS class_members_student_idx
  ON class_members (student_id);
