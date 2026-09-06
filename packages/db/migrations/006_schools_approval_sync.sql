-- Schools entity + signup approval + offline sync columns (architecture fix brief)
-- Apply after 005_perf_indexes.sql

CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  sub_city TEXT,
  woreda TEXT,
  region TEXT NOT NULL DEFAULT 'Addis Ababa',
  cohort_tag TEXT,
  school_type TEXT NOT NULL DEFAULT 'government'
    CHECK (school_type IN ('government', 'private', 'other')),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  teacher_invite_code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS schools_cohort_idx ON schools (cohort_tag);
CREATE INDEX IF NOT EXISTS schools_type_idx ON schools (school_type);

ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS school_id TEXT REFERENCES schools(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS classes_school_idx ON classes (school_id);

-- Phone + approval on user (phone unique when present)
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "phoneVerified" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'approved'
    CHECK (approval_status IN ('pending', 'approved', 'rejected', 'revoked'));
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS school_id TEXT REFERENCES schools(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS user_phone_unique
  ON "user" (phone)
  WHERE phone IS NOT NULL AND phone <> '';

-- Signup requests (decoupled approval workflow)
CREATE TABLE IF NOT EXISTS signup_requests (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  school_id TEXT NOT NULL REFERENCES schools(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  decided_at TIMESTAMPTZ,
  decided_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS signup_requests_status_idx ON signup_requests (status);
CREATE INDEX IF NOT EXISTS signup_requests_school_idx ON signup_requests (school_id);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id TEXT PRIMARY KEY NOT NULL,
  admin_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  signup_request_id TEXT REFERENCES signup_requests(id) ON DELETE SET NULL,
  meta_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_audit_log_created_idx
  ON admin_audit_log (created_at DESC);

-- Offline sync support on practice sessions
ALTER TABLE practice_sessions
  ADD COLUMN IF NOT EXISTS client_session_id TEXT;
ALTER TABLE practice_sessions
  ADD COLUMN IF NOT EXISTS sync_status TEXT NOT NULL DEFAULT 'synced'
    CHECK (sync_status IN ('synced', 'late', 'pending'));

CREATE UNIQUE INDEX IF NOT EXISTS practice_sessions_client_id_idx
  ON practice_sessions (user_id, client_session_id)
  WHERE client_session_id IS NOT NULL;

-- OTP send queue for manual fallback / monitoring
CREATE TABLE IF NOT EXISTS otp_send_log (
  id TEXT PRIMARY KEY NOT NULL,
  phone TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'login',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'manual')),
  code_hint TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS otp_send_log_status_idx ON otp_send_log (status, created_at DESC);

-- Placeholder pilot schools (Addis Ababa cohort) — names editable later
INSERT INTO schools (id, name, sub_city, region, cohort_tag, school_type, verified, teacher_invite_code)
VALUES
  ('school-kolfe', 'Pilot School — Kolfe Keranio', 'Kolfe Keranio', 'Addis Ababa', 'dap-pilot', 'government', false, 'KOLFE2026'),
  ('school-nifas', 'Pilot School — Nifas Silk-Lafto', 'Nifas Silk-Lafto', 'Addis Ababa', 'dap-pilot', 'government', false, 'NIFAS2026'),
  ('school-lemikura', 'Pilot School — Lemi Kura', 'Lemi Kura', 'Addis Ababa', 'dap-pilot', 'government', false, 'LEMI2026')
ON CONFLICT (id) DO NOTHING;
