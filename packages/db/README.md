# Kasina DB

Postgres schema for the MVP server (Supabase). Offline SQLite for mobile comes later.

## Apply migrations

1. Create a Supabase project.
2. In the SQL editor, run [`migrations/002_mvp_core.sql`](./migrations/002_mvp_core.sql).
3. Set env vars (see repo root `.env.example`).
4. Sign up the demo teacher in the web app: `teacher@kasina.local` with role teacher.
5. Seed questions + demo class:

```bash
pnpm --filter @kasina/db seed
```

Demo invite code: **DEMO2026**

## Tables

See [`src/schema.ts`](./src/schema.ts). Practice quiz sessions are stored in `practice_sessions` (not Better Auth `session`).
