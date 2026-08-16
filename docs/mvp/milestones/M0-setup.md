# M0 local setup & verify

## 1. Design language

Already locked in `docs/design/` and `apps/web/src/app/globals.css`.

## 2. Supabase

1. Create a project at https://supabase.com
2. Run SQL from `packages/db/migrations/002_mvp_core.sql` in the SQL editor
3. Copy URL + service role key + database connection string (use **Session mode** pooler URI for `DATABASE_URL` if available)

## 3. Env files

```bash
cp .env.example .env
cp apps/server/.dev.vars.example apps/server/.dev.vars
cp apps/web/.env.example apps/web/.env.local
```

Fill `SUPABASE_*`, `DATABASE_URL`, `BETTER_AUTH_SECRET` in `.dev.vars`.

## 4. Install & validate questions

```bash
pnpm install
pnpm questions:validate
```

Expect: `Validated 50 question(s).`

## 5. Run API + web

```bash
pnpm --filter server dev    # http://localhost:8787
pnpm --filter web dev       # http://localhost:3000
```

Check: `curl http://localhost:8787/health`

## 6. Demo teacher + seed

1. Open http://localhost:3000/teacher/signup
2. Create `teacher@kasina.local` (or any email) with a password
3. Seed questions + DEMO2026 class:

```bash
# ensure SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are exported
pnpm db:seed
```

4. Teacher home should show invite **DEMO2026**
5. Second browser: http://localhost:3000/join → join → `/student`
6. `/debug/questions` shows ≥50 questions (while signed in)

## 7. Deploy (kasina.et)

Full runbook: **[deploy-kasina-et.md](../deploy-kasina-et.md)** · DB seed: **[production-db.md](../production-db.md)**

```bash
cd apps/server
npx wrangler login
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put DATABASE_URL
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put BETTER_AUTH_URL   # https://api.kasina.et
npx wrangler secret put APP_URL           # https://kasina.et
pnpm deploy
```

Point `NEXT_PUBLIC_API_URL=https://api.kasina.et` and `NEXT_PUBLIC_APP_URL=https://kasina.et` on Pages/Vercel.

## Verification checklist (M0 exit)

- [x] Design tokens in `docs/design/` + `globals.css`
- [x] Domain types expanded
- [x] Tagged Math questions validate via `pnpm questions:validate`
- [x] Postgres migration `002_mvp_core.sql` ready
- [x] Hono routes: `/health`, `/api/auth/*`, `/me`, `/classes/join`, `/questions`
- [x] Web shell: landing, teacher auth, join, student, debug questions
- [x] Web production build succeeds
- [ ] Supabase project created + migration applied (ops — see production-db.md)
- [ ] `wrangler deploy` with secrets + `api.kasina.et` (ops — see deploy-kasina-et.md)
- [ ] Live demo: teacher → DEMO2026 → student join → practice
