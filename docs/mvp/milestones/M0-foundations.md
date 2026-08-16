# M0 — Foundations

**Window:** Week 0–1  
**Purpose:** Unblock everything that M1–M5 depend on.  
**Status:** Implemented in code — production DNS/Workers deploy remaining ([deploy-kasina-et.md](../deploy-kasina-et.md), [M0-setup.md](./M0-setup.md))

---

## Goal

A teacher can log in, a student can join a class with an invite code, and tagged Mathematics questions exist in the database behind a deployed API.

---

## Deliverables checklist

### Shared packages

- [ ] Expand `@kasina/types` with:
  - [ ] `User` / `UserRole` (`student` | `teacher`)
  - [ ] `Class`, `ClassMember`
  - [ ] `Question` with curriculum fields (`grade`, `subject`, `unit`, `topic`, `year`, `difficulty`, bilingual stems/explanations as needed)
  - [ ] `Assignment`
  - [ ] `Session`, `Answer`
- [ ] Finalize question JSON schema in `packages/question-bank`
- [x] Import + validate CLI (`pnpm questions:validate`)
- [x] Reject imports missing `unit` / `topic` / `correct` / explanation

### Database (Supabase Postgres)

- [ ] Create project + connection env vars for server/web
- [ ] Migrations for minimum tables:
  - [ ] `users`
  - [ ] `classes`
  - [ ] `class_members`
  - [ ] `questions`
  - [ ] `assignments`
  - [ ] `sessions`
  - [ ] `answers`
- [ ] Seed script: 1 teacher, 1 class, known invite code, sample membership
- [ ] Align `packages/db` docs/schema notes with Postgres migrations (keep migration mindset)

### Content

- [ ] Seed **≥50** Grade 12 Mathematics questions
- [ ] Every question tagged with `unit` and `topic`
- [ ] Correct answer + English explanation validated
- [ ] Track toward **150** by M5 (content parallel track)

### Auth & API

- [ ] Wire **Better Auth** on `apps/server` + `apps/web`
- [ ] Teacher: email + password sign-up / login
- [ ] Student: join flow via **class invite code** + display name (no SMS OTP)
- [ ] Session cookie / token usable from web API client
- [ ] Health route on Hono confirming DB connectivity

### Deploy & web shell

- [ ] Deploy `apps/server` to Cloudflare Workers
- [ ] Web env vars pointed at API + auth URLs
- [ ] Apply design tokens in web (primary greens from design spec: `#1B4332`, `#2D6A4F`, `#40916C`, etc.)
- [ ] Minimal landing: “Teacher login” / “Join class”

---

## Suggested API surface (M0)

| Method | Path | Notes |
|--------|------|-------|
| `POST` | `/auth/*` | Better Auth handlers |
| `POST` | `/classes/join` | Body: invite code + display name |
| `GET` | `/me` | Current user + role + classes |
| `GET` | `/questions` | Filtered seed read (admin/dev ok for M0) |
| `GET` | `/health` | Liveness |

Full class/assignment CRUD can land in M2; M0 only needs join + identity.

---

## Repo touchpoints

| Path | Work |
|------|------|
| `packages/types` | Domain types |
| `packages/question-bank` | Schema, sample JSON, import CLI |
| `packages/db` | Schema reference / migration notes |
| `apps/server` | Hono + Better Auth + Supabase client |
| `apps/web` | Auth pages, env, design tokens |

---

## Exit criteria

All must be true:

- [ ] Teacher can create an account and log in  
- [ ] Student can join the seeded class with the invite code  
- [ ] ≥50 tagged Math questions are queryable from the API/DB  
- [ ] Server is deployed; web can talk to it in local + preview  

**Demo script (2 minutes):** Log in as teacher → copy invite code → join as student in another browser → show question count in DB/admin or a simple debug page.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Better Auth + Workers edge cases | Spike auth on day 1; fall back to simple session table if blocked >2 days |
| Content not tagged | Block merge of question files without `unit`/`topic` validation |
| Env sprawl | Single `.env.example` at root documenting `SUPABASE_*`, `BETTER_AUTH_*`, `NEXT_PUBLIC_API_URL` |

---

## Out of scope for M0

- Quiz UI, assignments UI, weak topics, mobile, offline, Melak, CBT
