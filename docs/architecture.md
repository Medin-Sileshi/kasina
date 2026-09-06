# Kasina — system architecture (current)

**Status:** As implemented in the monorepo (not a roadmap).  
**Live:** [kasina.et](https://kasina.et) (web) · [api.kasina.et](https://api.kasina.et) (API)  
**Product:** Ethiopian secondary EdTech — Grade 12 Mathematics practice, teacher classroom loop, Melak tutor, CBT-style sessions, textbook reader. Pilot focus: Addis Ababa government schools.

---

## 1. System topology

```
┌──────────────────────────────┐     HTTPS / cookies      ┌──────────────────────────────┐
│  apps/web (Next.js 16 PWA)   │ ───────────────────────► │  apps/server (Hono)           │
│  React 19 · Vercel           │                          │  Cloudflare Workers            │
│  kasina.et / www.kasina.et   │                          │  api.kasina.et                 │
└──────────────┬───────────────┘                          └──────────────┬───────────────┘
               │                                                         │
               │ IndexedDB (questions, sessions, sync queue)             │ Better Auth (pg Pool)
               │ @kasina/melak-core (on-device fallback)                  │ Supabase Postgres
               │ Service worker (/sw.js)                                 │ Hyperdrive (Workers)
               ▼                                                         │ R2 textbooks
         Offline practice + Melak                                        │ SMS gateway (OTP)
                                                                         │ Melak LLM (optional)
                                                                         ▼
                                                              Supabase · R2 · device SMS · LM Studio / VPS
```

| Surface | Stack | Host |
|---------|--------|------|
| Web | Next.js 16 PWA + SW + IndexedDB | `kasina.et` (Vercel) |
| API | Hono on Cloudflare Workers | `api.kasina.et` |
| API (local) | Same Hono app via `@hono/node-server` | `localhost:8787` (`node-dev.ts`) |
| Database | Postgres | Supabase (+ Hyperdrive on Workers) |
| Textbooks | Markdown / page assets | R2 bucket `kasina-textbooks` |
| Melak enhanced | Self-hosted / demo LLM | `MELAK_CLOUD_ENDPOINT` (LM Studio) or `MELAK_LLM_*` (OpenAI-compatible VPS) |
| Melak fallback | Rule engine | `@kasina/melak-core` (browser + server) |
| OTP SMS | Device SIM gateway | `SMS_GATEWAY_*` (mocked if unset) |
| Mobile / desktop | Expo stub · Electron shell | **Not** the pilot delivery path |

---

## 2. Monorepo layout

pnpm workspace (`apps/*`, `packages/*`) + Turbo.

| Path | Role |
|------|------|
| `apps/web` | Marketing, student, teacher, admin (`/medin`) UI |
| `apps/server` | Hono API (Workers + Node local) |
| `apps/mobile` | Expo stub (post-pilot) |
| `apps/desktop` | Electron shell (loads web; not pilot offline) |
| `packages/db` | SQL migrations, seed, reset-pilot |
| `packages/question-bank` | Grade 12 Math question JSON + validation |
| `packages/melak-core` | Deterministic on-device Melak replies |
| `packages/types` | Shared TypeScript types |
| `packages/ui` | Deprecated; web uses local components |
| `content/textbooks/` | Source markdown / pages uploaded to R2 |
| `docs/` | Architecture, MVP, ops, vision |
| `scripts/` | Textbook upload, PDF→MD, prod smoke |

---

## 3. Runtime & deployment

### Web (`apps/web`)

- **Framework:** Next.js App Router, React 19.
- **API client:** `NEXT_PUBLIC_API_URL` → `https://api.kasina.et` (prod) or `http://localhost:8787` (dev) via `apps/web/src/lib/auth-client.ts`.
- **Deploy:** GitHub → Vercel (root/`apps/web` monorepo install). Env: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`.
- **Local:** `pnpm --filter web dev` (port 3000).

### API (`apps/server`)

- **Entry:** `apps/server/src/index.ts` (Hono).
- **Prod:** `wrangler deploy --minify` — Worker name `kasina-server`, custom domain `api.kasina.et` (`wrangler.jsonc`).
- **Local:** `pnpm --filter server dev` → `src/node-dev.ts` loads `.dev.vars`, serves on **8787**. Optional `wrangler dev`.
- **Bindings:** `HYPERDRIVE` (Postgres), `TEXTBOOKS` (R2). Secrets via `wrangler secret put`.

### CORS / trusted origins

API trusts `APP_URL`, `http://localhost:3000`, `https://kasina.et`, `https://www.kasina.et`.

---

## 4. Authentication & roles

**Library:** [Better Auth](https://www.better-auth.com/) — `apps/server/src/auth.ts`, client `apps/web/src/lib/auth-client.ts`.  
**Mount:** `GET|POST /api/auth/*`.

### Credentials

| Method | Use |
|--------|-----|
| **Phone OTP** | Primary student/teacher path; SMS via device gateway |
| **Email + password** | Teacher signup/login, admin `/medin/login`, backup student login |

### Roles (`user.role`)

`student` | `teacher` | `admin`

### Approval gate

- New student join (`POST /classes/join`) and teacher signup (`POST /teacher/signup`) set `approval_status = pending` and insert `signup_requests`.
- Client `ApprovalGate` blocks student/teacher shells until `approved`.
- Admins approve/reject/revoke from `/medin` (API `/admin/*`).

### Schools & invites

- Signup ties users to a `schools` row (`school_id`).
- Teachers: per-school `teacher_invite_code`, or env override `TEACHER_SIGNUP_SECRET`.
- Demo class invite (seed): **`DEMO2026`**.

### Admin surface

| UI | Purpose |
|----|---------|
| `/medin/login` | Admin email/password entry |
| `/medin`, `/medin/signups`, `/medin/otp`, `/medin/audit` | Console (overview, approvals, OTP queue, audit) |
| `/admin/*` | Legacy redirects to `/medin/*` |

API admin routes require `role === admin`.

---

## 5. Data layer

### Postgres (Supabase)

| Access path | Mechanism |
|-------------|-----------|
| App CRUD | Supabase JS service role (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) — `apps/server/src/db.ts` |
| Better Auth sessions | `pg` Pool → `HYPERDRIVE.connectionString` (Workers) or `DATABASE_URL` (Node) |

### Migrations (`packages/db/migrations/`)

Apply in order (006 is required for current features):

| Migration | What it adds |
|-----------|----------------|
| `002_mvp_core.sql` | Better Auth tables (`user`, `session`, `account`, `verification`); `classes`, `class_members`, `questions`, `assignments`, `practice_sessions`, `answers` |
| `003_seed_notes.sql` | Seed notes (DEMO2026 via script) |
| `004_melak.sql` | `melak_messages` |
| `005_perf_indexes.sql` | Performance indexes |
| `006_schools_approval_sync.sql` | `schools`, `signup_requests`, `admin_audit_log`, `otp_send_log`; user phone / approval / school; session `client_session_id`, `sync_status` |

### Core tables (conceptual)

```
user ──◄── class_members ──► classes ──► assignments
  │                              │
  ├── practice_sessions ──► answers ──► questions
  ├── melak_messages
  ├── signup_requests ──► schools
  └── (Better Auth: session, account, verification)

admin_audit_log · otp_send_log
```

**Seed:** `pnpm db:seed` / `pnpm db:reset-pilot` — Grade 12 Math bank + demo class **DEMO2026**.

### Question bank scope

Live practice content = **Grade 12 Mathematics** (`packages/question-bank`). Textbook assets exist for math/biology/chemistry/physics under `content/textbooks/`, but the interactive QB is Math-only today. See [content-status.md](./content-status.md).

---

## 6. Storage (textbooks)

| Piece | Detail |
|-------|--------|
| Bucket | R2 `kasina-textbooks`, binding `TEXTBOOKS` |
| Source | `content/textbooks/md/grade-12/{subject}/` |
| Upload | `pnpm textbooks:upload` → `scripts/upload_textbooks_r2.py` |
| API | `GET /textbooks`, `/textbooks/grade-12/:subject`, chapters, pages |
| Local Node | Filesystem mock under `content/textbooks/md/grade-12` |
| UI | Student `/read/[subject]`; teacher `/teacher/textbook/[subject]` |

---

## 7. Melak tutor

### Modes (current product default)

1. **Enhanced (online) — default** when the browser is online and the “Enhanced” checkbox is on (default **checked**).
2. **On-device — fallback** when offline, Enhanced is unchecked, cloud endpoint missing, timeout, or empty LLM response.

### On-device path

- Package: `@kasina/melak-core` (`generateMelakReply`).
- Runs in the **browser** for local-only turns and on the **server** as silent/timeout fallback.
- Curriculum-grounded rules; no network ML.

### Enhanced path (`POST /melak/chat`)

```
Client (online=true)
        │
        ▼
Server tries MELAK_CLOUD_ENDPOINT  →  LM Studio native POST /api/v1/chat
   else MELAK_LLM_BASE_URL         →  OpenAI-compatible /v1/chat/completions
        │
        ├─ success → persist + return mode: "online"
        └─ fail / 60s timeout / empty → @kasina/melak-core, mode: "offline"
```

| Setting | Value / notes |
|---------|----------------|
| Cloud timeout | **60s** (`CLOUD_TIMEOUT_MS`) |
| Daily user turns | **20** / UTC day |
| Rate limit | 60 requests / minute / user |
| Persistence | User + assistant rows in `melak_messages` |
| History | Flat per-user list (`GET /melak/history`) — **no `chat_id` / conversation id** |
| Optional link | `question_id`, practice `session_id` when opened from a quiz |

**Env:** `MELAK_CLOUD_ENDPOINT`, `MELAK_LLM_BASE_URL`, `MELAK_LLM_API_KEY`, `MELAK_LLM_MODEL`.  
`ANTHROPIC_API_KEY` is deprecated / unused.

**UI:** `/student/melak` — markdown + KaTeX rendering (`MelakMessageContent`).

---

## 8. Offline-first & PWA

Designed for weak school connectivity.

| Layer | Implementation |
|-------|----------------|
| Manifest | `apps/web/src/app/manifest.ts` (`start_url: /join`) |
| Service worker | `public/sw.js` — precache shell; cache-first `/_next/static/`; network-first navigations |
| Register | `components/pwa-register.tsx` |
| IndexedDB | `kasina-offline` — `question_bank`, `local_sessions`, `answer_queue`, `sync_meta` |
| Pull | `GET /sessions/offline-pack` |
| Push | `POST /sessions/sync` on reconnect |
| Late work | Past assignment `due_at` → `sync_status = 'late'` (accepted, flagged for teachers) |

**Loop:** online hub install/sync → offline practice/CBT → reconnect flush.

---

## 9. API surface (`apps/server`)

| Mount | Module | Responsibility |
|-------|--------|----------------|
| `/`, `/health`, `/me` | `index.ts` | Health, current user |
| `/api/auth/*` | Better Auth | Sign-in, OTP, sessions |
| `/classes` | `routes/classes.ts` | Classes, join, overview, results, weak topics |
| `/assignments` | `routes/assignments.ts` | Create/list assignments |
| `/sessions` | `routes/sessions.ts` | Practice/CBT sessions, offline-pack, sync, answers, complete |
| `/progress` | `routes/progress.ts` | Student progress + weak topics |
| `/subjects` | `routes/subjects.ts` | Math meta |
| `/textbooks` | `routes/textbooks.ts` | R2 textbook reads |
| `/melak` | `routes/melak.ts` | Chat, history, question context |
| `/teacher/signup` | `routes/teacher-signup.ts` | Teacher registration |
| `/schools` | `routes/schools.ts` | School list/create |
| `/admin` | `routes/admin.ts` | Overview, signups, revoke, activity, audit, OTP queue |
| `/questions` | `index.ts` | Admin-oriented question access |

---

## 10. Web route map (`apps/web`)

| Area | Routes |
|------|--------|
| Marketing | `/`, `/about`, `/students`, `/teachers`, `/melak`, `/practice-tools`, `/pilot`, `/impact`, `/partners`, `/faq`, `/contact`, `/get-involved`, `/privacy-policy`, `/terms-of-use` |
| Join | `/join` (class invite) |
| Student | `/student`, `/student/login`, `/student/melak`, `/subjects/mathematics`, `/quiz/[sessionId]` (+ results/review), `/cbt`, `/progress`, `/read/[subject]` |
| Teacher | `/teacher`, `/teacher/login`, `/teacher/signup`, classes, assign, assignments, students, practice-sets, analytics, textbook |
| Admin | `/medin/login`, `/medin/*` (signups, otp, audit); `/admin/*` redirects |

---

## 11. Classroom product loop

```
Teacher creates class → invite code
        ↓
Student joins (pending → admin approve)
        ↓
Teacher assigns topic / set  ·  Student self-serves Math
        ↓
Quiz / CBT with per-question feedback
        ↓
Session results → weak topics
        ↓
Teacher dashboard + student progress act on weak topics
```

Amplifiers on the same stack: **Melak**, **textbook reader**, **offline sync**.

---

## 12. SMS (OTP)

| Piece | Detail |
|-------|--------|
| Code | `apps/server/src/lib/sms.ts` |
| Style | android-sms-gateway `POST …/3rdparty/v1/messages` |
| Env | `SMS_GATEWAY_URL`, `SMS_GATEWAY_USER` / `SMS_GATEWAY_PASSWORD`, or `SMS_GATEWAY_TOKEN` |
| If unset | Mocked send; OTP still logged in `otp_send_log` |
| Admin | `/medin/otp` → `GET /admin/otp-queue`, manual mark |
| Ops | [ops/sms-gateway.md](./ops/sms-gateway.md) |

---

## 13. Environment variables (index)

### Server (`.dev.vars` / Workers secrets)

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role API access |
| `DATABASE_URL` | Postgres for Better Auth (local / non-Hyperdrive) |
| `HYPERDRIVE` | Workers binding → pooled Postgres |
| `BETTER_AUTH_SECRET` | Auth signing secret |
| `BETTER_AUTH_URL` | Auth base URL (`https://api.kasina.et` or local) |
| `APP_URL` | Web origin for CORS / redirects |
| `TEACHER_SIGNUP_SECRET` | Optional teacher signup override code |
| `SMS_GATEWAY_*` | Device SMS gateway |
| `MELAK_CLOUD_ENDPOINT` | Full LM Studio chat URL (demo tunnel) |
| `MELAK_LLM_BASE_URL` | OpenAI-compatible VPS base |
| `MELAK_LLM_API_KEY` | Optional LLM auth |
| `MELAK_LLM_MODEL` | Model id (e.g. `qwen/qwen3.5-9b`) |
| `TEXTBOOKS` | R2 binding (Workers) |

### Web

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | API origin |
| `NEXT_PUBLIC_APP_URL` | Canonical site URL (SEO / absolute links) |
| `API_PROXY_TARGET` | Optional Next rewrite target |

---

## 14. Local development

```bash
pnpm install
# Configure apps/server/.dev.vars (see .dev.vars.example)
pnpm --filter server dev   # :8787
pnpm --filter web dev      # :3000
```

Optional: apply migrations in Supabase SQL editor through **006**, then `pnpm db:seed`.

---

## 15. CI & quality

- **GitHub Actions** (`.github/workflows/ci.yml`): lint, types, vitest, web build, Playwright smoke.
- **Prod smoke:** `pnpm smoke:prod` / `scripts/smoke-prod.sh`.
- Deploy guide: [mvp/deploy-kasina-et.md](./mvp/deploy-kasina-et.md).

---

## 16. What this is not (current)

- Not Claude / Anthropic-powered Melak.
- No Melak **conversation / chat_id** — history is flat per `user_id`.
- Question bank is **not** multi-subject yet (Math only).
- `apps/mobile` / `apps/desktop` are not the pilot offline story; the **web PWA** is.
- Older MVP docs that say “OTP deferred / offline deferred” are **superseded** by the code above.

---

## 17. Related docs

| Doc | Topic |
|-----|--------|
| [content-status.md](./content-status.md) | Curriculum / bank coverage |
| [data-and-child-protection.md](./data-and-child-protection.md) | Data & safeguarding |
| [ops/sms-gateway.md](./ops/sms-gateway.md) | OTP SMS ops |
| [mvp/deploy-kasina-et.md](./mvp/deploy-kasina-et.md) | Production deploy |
| [mvp/production-db.md](./mvp/production-db.md) | DB + seed |
| [mvp/README.md](./mvp/README.md) | Classroom MVP history (C0–C5) |
| [vision/README.md](./vision/README.md) | Longer company roadmap |

---

## 18. Recurring infrastructure cost (ops)

| Item | Role |
|------|------|
| Vercel | Web hosting |
| Cloudflare Workers + Hyperdrive + R2 | API, DB pool, textbooks |
| Supabase | Postgres |
| Melak VPS / demo laptop + tunnel | Enhanced LLM |
| OTP phone + SIM | Carrier SMS |

Not DAP one-time deliverables — treat as ongoing run cost.
