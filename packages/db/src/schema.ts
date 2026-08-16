/**
 * Postgres-oriented table overview for Kasina MVP.
 * Source of truth for DDL: ../migrations/002_mvp_core.sql
 */

export const TABLES = {
  user: "Better Auth user (+ role)",
  session: "Better Auth session",
  account: "Better Auth account (password hash)",
  verification: "Better Auth verification",
  classes: "Teacher classes + invite_code",
  class_members: "Student membership",
  questions: "Curriculum-tagged question bank",
  assignments: "Class assignments (M2)",
  practice_sessions: "Student quiz sessions (M1)",
  answers: "Per-question answers (M1)",
} as const;
