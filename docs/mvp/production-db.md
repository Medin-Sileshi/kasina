# Production database — migrate & seed

## Apply schema

1. Open the Supabase SQL editor for the **production** project.
2. Paste and run [`packages/db/migrations/002_mvp_core.sql`](../../packages/db/migrations/002_mvp_core.sql).
3. Confirm tables exist: `user`, `session`, `classes`, `class_members`, `questions`, `assignments`, `practice_sessions`, `answers`.

## Seed questions + demo class

Create the teacher account first in the live app (`https://kasina.et/teacher/signup`), then:

```bash
export SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="..."

# Upserts Grade 12 Math seed + DEMO2026 class for teacher@kasina.local
# (or the email configured in packages/db/scripts/seed.ts)
pnpm db:seed
```

Verify:

```bash
# Count questions (service role / SQL editor)
# select count(*) from questions;
```

Expect ≥140 after the expanded bank is seeded.

## Reset pilot data

Wipes practice sessions/answers for a clean classroom week (keeps users/classes/questions — see script):

```bash
export SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
pnpm db:reset-pilot
```

Read [`packages/db/scripts/reset-pilot.ts`](../../packages/db/scripts/reset-pilot.ts) before running against production.

## Local vs production

| | Local | Production |
|--|-------|------------|
| Credentials | `apps/server/.dev.vars` | Wrangler secrets + exported env for seed scripts |
| API | `http://localhost:8787` | `https://api.kasina.et` |
| Never commit | `.dev.vars`, `.env.local` | — |

Full hosting steps: [deploy-kasina-et.md](./deploy-kasina-et.md).
