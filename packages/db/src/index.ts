/**
 * Kasina DB package — Postgres (Supabase) for MVP server;
 * SQLite notes remain relevant for future offline mobile.
 *
 * Apply migrations:
 *   1. Open Supabase SQL editor (or psql $DATABASE_URL)
 *   2. Run migrations/002_mvp_core.sql
 *   3. Create teacher via Better Auth sign-up (role=teacher)
 *   4. Run: pnpm --filter @kasina/db seed
 *
 * Demo invite code: DEMO2026
 */

export const SCHEMA_VERSION = 2;
export const DEMO_INVITE_CODE = "DEMO2026";
export const DEMO_TEACHER_EMAIL = "teacher@kasina.local";
