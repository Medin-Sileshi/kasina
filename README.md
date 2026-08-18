# Kasina

Ethiopian secondary-school learning platform — practice quizzes, teacher assignments, offline-first **Melak** tutoring, and CBT exam-style sessions.

## Monorepo layout

| Path | Role |
|------|------|
| `apps/web` | Next.js student + teacher UI (Vercel → kasina.et) |
| `apps/server` | Hono API on Cloudflare Workers (api.kasina.et) |
| `apps/mobile` | Expo stub — offline Melak Android app is post-pilot |
| `packages/db` | Postgres migrations + seed scripts (Supabase) |
| `packages/question-bank` | Grade 12 Math questions (Zod-validated JSON) |
| `packages/melak-core` | Rule-based offline Melak tutor (no ML) |
| `packages/types` | Shared TypeScript types |
| `packages/ui` | **Deprecated** Turborepo starter; web uses local components |

## Quick start

```bash
pnpm install
cp apps/server/.dev.vars.example apps/server/.dev.vars   # fill Supabase + auth secrets
pnpm dev
```

Apply SQL migrations in order under `packages/db/migrations/` (002 → 005), then:

```bash
pnpm db:seed
```

Demo class invite: **DEMO2026**. Teachers sign up with the access code from `TEACHER_SIGNUP_SECRET`.

## Scripts

```bash
pnpm lint              # ESLint across packages
pnpm check-types       # TypeScript
pnpm test              # Vitest (melak-core + question-bank)
pnpm --filter web build
pnpm questions:validate
pnpm db:seed
```

## Docs

- MVP deploy: `docs/mvp/`
- Vision / demo: `docs/vision/`

## CI

GitHub Actions runs frozen lockfile install, lint, typecheck, unit tests, web build, and a Playwright landing smoke test on push/PR to `main`.
