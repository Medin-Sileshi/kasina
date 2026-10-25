# Kasina

Ethiopian secondary-school learning platform — practice quizzes, teacher assignments, **Adey AI** tutoring (online, low-bandwidth), and CBT exam-style sessions.

## Monorepo layout

| Path | Role |
|------|------|
| `apps/web` | Next.js student + teacher UI (Vercel → kasina.et) |
| `apps/server` | Hono API on Cloudflare Workers (api.kasina.et) |
| `apps/mobile` | Expo stub — **not on path** (parked; see K1) |
| `apps/desktop` | Electron shell — **not on path** (parked; see K1) |
| `packages/db` | Postgres migrations + seed scripts (Supabase) |
| `packages/question-bank` | Grade 12 Math questions (Zod-validated JSON) |
| `packages/melak-core` | Rule-based Adey AI fallback replies (package name alias; no ML) |
| `packages/types` | Shared TypeScript types |
| `packages/ui` | **Deprecated** Turborepo starter; web uses local components |

## Quick start

```bash
pnpm install
cp apps/server/.dev.vars.example apps/server/.dev.vars   # fill Supabase + auth secrets
pnpm dev
```

Apply SQL migrations in order under `packages/db/migrations/` (002 → 008), then:

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

- Path forward (K0–K7): `docs/kasina-path-milestones.md`
- Architecture (as implemented): `docs/architecture.md`
- Content status: `docs/content-status.md`
- Data & child protection: `docs/data-and-child-protection.md`
- SMS gateway ops: `docs/ops/sms-gateway.md`
- MVP deploy: `docs/mvp/`
- Vision / demo: `docs/vision/`

**Identity:** students may use phone OTP (school cascade) or email+password via class invite `/join` — both are intentional.

## CI

GitHub Actions runs frozen lockfile install, lint, typecheck, unit tests, web build, and a Playwright landing smoke test on push/PR to `main`.
