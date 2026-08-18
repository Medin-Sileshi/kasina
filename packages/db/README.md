# Kasina DB

Postgres schema for the MVP server (Supabase). Offline SQLite for mobile comes later.

## Apply migrations

Run these in the Supabase SQL editor **in order**:

1. [`002_mvp_core.sql`](./migrations/002_mvp_core.sql) — core tables
2. [`003_seed_notes.sql`](./migrations/003_seed_notes.sql) — optional notes
3. [`004_melak.sql`](./migrations/004_melak.sql) — Melak chat persistence
4. [`005_perf_indexes.sql`](./migrations/005_perf_indexes.sql) — progress / weak-topic indexes

Set env vars (see repo root `.env.example` and `apps/server/.dev.vars.example`).

## Seed

Teachers must exist before the demo class is attached. Either:

- Sign up via **Create teacher account** with `TEACHER_SIGNUP_SECRET`, or
- Use the legacy demo email after manual role assignment.

Then seed questions + demo class:

```bash
pnpm --filter @kasina/db seed
```

Questions are validated with `@kasina/question-bank` before insert.

Demo invite code: **DEMO2026** · Demo class: **Ministry Demo School — Grade 12 Math**

## Tables

See [`src/schema.ts`](./src/schema.ts). Practice quiz sessions live in `practice_sessions` (not Better Auth `session`).
