-- School join requests + roster cascade (school_admin, invited, roster audit)
-- Apply after 006_schools_approval_sync.sql

-- Extend user.role to include school_admin
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS user_role_check;
ALTER TABLE "user"
  ADD CONSTRAINT user_role_check
  CHECK (role IN ('student', 'teacher', 'admin', 'school_admin'));

-- Extend approval_status to include invited (pre-approved, not yet OTP-activated)
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS user_approval_status_check;
ALTER TABLE "user"
  ADD CONSTRAINT user_approval_status_check
  CHECK (approval_status IN ('pending', 'approved', 'rejected', 'revoked', 'invited'));

CREATE TABLE IF NOT EXISTS school_join_requests (
  id TEXT PRIMARY KEY NOT NULL,
  school_name TEXT NOT NULL,
  sub_city TEXT,
  woreda TEXT,
  region TEXT NOT NULL DEFAULT 'Addis Ababa',
  -- Self-declared only; admin sets judged type on approval
  declared_school_type TEXT NOT NULL DEFAULT 'government'
    CHECK (declared_school_type IN ('government', 'private', 'other')),
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  estimated_teachers INTEGER,
  estimated_students INTEGER,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  school_id TEXT REFERENCES schools(id) ON DELETE SET NULL,
  decided_at TIMESTAMPTZ,
  decided_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS school_join_requests_status_idx
  ON school_join_requests (status, created_at DESC);

-- Roster cascade actions (school_admin / teacher) — distinct from admin_audit_log
CREATE TABLE IF NOT EXISTS roster_audit_log (
  id TEXT PRIMARY KEY NOT NULL,
  actor_user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  actor_role TEXT NOT NULL
    CHECK (actor_role IN ('school_admin', 'teacher', 'admin')),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
  meta_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS roster_audit_log_created_idx
  ON roster_audit_log (created_at DESC);

CREATE INDEX IF NOT EXISTS roster_audit_log_school_idx
  ON roster_audit_log (school_id, created_at DESC);
