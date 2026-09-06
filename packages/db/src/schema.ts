/**
 * Postgres-oriented table overview for Kasina MVP.
 * Source of truth for DDL: ../migrations/002_mvp_core.sql
 */

export const TABLES = {
  user: "Better Auth user (+ role, phone, approval_status, school_id)",
  session: "Better Auth session",
  account: "Better Auth account (password hash)",
  verification: "Better Auth verification",
  schools: "Partner schools (type, verified, teacher_invite_code)",
  classes: "Teacher classes + invite_code + school_id",
  class_members: "Student membership",
  questions: "Curriculum-tagged question bank",
  assignments: "Class assignments",
  practice_sessions: "Student quiz sessions (+ client_session_id, sync_status)",
  answers: "Per-question answers",
  melak_messages: "Melak chat turns",
  signup_requests: "Pending student/teacher signup approvals",
  admin_audit_log: "Admin approve/reject/revoke actions",
  otp_send_log: "OTP send queue for monitoring / manual fallback",
} as const;
