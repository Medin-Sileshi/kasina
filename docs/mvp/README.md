# Classroom MVP (C0–C5)

**Status:** Built and live — real-class pilot + Ministry demo amplifiers in progress  
**Target duration:** ~6 weeks (build, completed Aug 2026)  
**Subject scope:** Grade 12 Mathematics only  
**Surfaces:** Web student + web teacher (`apps/web`)  
**Production hosts:** `https://kasina.et` (web) · `https://api.kasina.et` (Workers) — see [deploy-kasina-et.md](./deploy-kasina-et.md)

> **Naming:** These milestones are **C0–C5** (classroom MVP). They do **not** use the same numbers as the company roadmap **M0–M6** in [docs/vision](../vision/README.md).

---

## Product thesis

Practice alone does not help students pass. The MVP proves a **closed classroom loop**:

```text
Teacher assigns topic/set
        ↓
Student answers with feedback
        ↓
Session results → weak topics
        ↓
Teacher + student act on weak topics
```

National exam success is a **downstream effect** of topic mastery and teacher intervention — not a separate MVP product. The classroom loop shipped first; CBT, Melak, and textbook reader are **amplifiers** on top (Vision M1 — see [docs/vision](../vision/README.md)).

---

## Locked defaults (ASAP)

| Decision | Choice | Why |
|----------|--------|-----|
| Student surface | **Web** (`apps/web`), responsive | One codebase; quiz design already specified; mobile APK after pilot |
| Teacher surface | Same web app, `/teacher/*` | No second client for MVP |
| Subject | **Grade 12 Mathematics only** | Matches content + design spec |
| Auth | **Better Auth**: teacher email/password; students join via **class invite code** + email/password | Skip SMS OTP (biggest schedule killer); phone OTP in V1 |
| Backend | `apps/server` Hono on Cloudflare Workers + **Supabase Postgres** | Auth/roster/assignments sync; on-device SQLite deferred |
| Offline | Deferred | MVP requires connectivity for assign/sync (cuts 1–2 weeks) |
| Out of C0–C5 | Mobile APK, school admin, Ministry, paywall, desktop | CBT + Melak + textbook reader added in Vision M1; see [non-goals](./non-goals.md) |

---

## What “done” means

MVP ships when **one real class** can run this for 1 week:

1. Teacher creates class → shares invite code  
2. Students join and practice assigned work and/or self-serve Math topics  
3. After each question: correct/wrong + explanation  
4. Student sees results, reviews wrong answers, sees weak topics  
5. Teacher sees per-student scores and class weak topics **without handholding**

**Exit criteria (not vanity metrics):**

- Teacher can articulate who needs help on which topic  
- Students finish assigned sessions without coaching  

Full gate checklist: [C5 — MVP gate](./milestones/M5-mvp-gate.md)

---

## Architecture (MVP slice)

```text
apps/web
  ├── Student: quiz + progress
  └── Teacher: class + assign + results
         │
         ▼
apps/server (Hono + Better Auth)
         │
         ├── Supabase Postgres
         └── packages/question-bank
```

### Reuse what exists

| Package / app | MVP use |
|---------------|---------|
| `apps/web` | Student quiz UX + teacher dashboard |
| `apps/server` | API, auth, Workers deploy |
| `packages/types` | Shared Class, Assignment, Session, Question types |
| `packages/question-bank` | JSON questions + import/validate CLI (~160 Gr12 Math) |
| `packages/db` | Schema/migrations mindset (evolve toward Postgres) |
| `packages/ui` | Shared components (Answer Option, etc.) |

---

## Domain model (minimum tables)

| Table | Purpose |
|-------|---------|
| `users` | `role`: `student` \| `teacher` |
| `classes` | `teacher_id`, `invite_code`, `name`, `grade`, `subject` |
| `class_members` | `class_id`, `student_id` |
| `questions` | Curriculum fields: `unit`, `topic`, `difficulty`, stem, options, correct, explanation |
| `assignments` | `class_id`, topic/unit filter **or** `question_ids`, `due_at`, `title` |
| `sessions` | `user_id`, optional `assignment_id`, subject, started/completed, score |
| `answers` | `session_id`, `question_id`, selected, correct, `time_taken` |

Curriculum tags on questions make practice **teachable** (weak topics → teacher action). Untagged questions break the loop.

Curriculum map: [curriculum-map-grade12-math.md](./curriculum-map-grade12-math.md)

---

## Milestone map (C0–C5)

| Milestone | Weeks | Goal | Status | Doc |
|-----------|-------|------|--------|-----|
| **C0** Foundations | 0–1 | Auth, schema, seed content, deploy | **Done** — live on kasina.et | [C0](./milestones/M0-foundations.md) · [setup](./milestones/M0-setup.md) · [deploy](./deploy-kasina-et.md) |
| **C1** Student practice | 1–3 | Full quiz loop + persistence | **Done** | [C1](./milestones/M1-student-practice-loop.md) |
| **C2** Teacher classroom | 3–4 | Assign + see who is stuck | **Done** | [C2](./milestones/M2-teacher-classroom-loop.md) |
| **C3** Learning quality | 4–5 | Weak topics → targeted practice | **Done** — bank ~178 + Amharic on core topics | [C3](./milestones/M3-learning-quality.md) |
| **C4** Pilot harden | 5–6 | Polish, guards, device test | **Mostly done** | [C4](./milestones/M4-pilot-harden.md) · [Teacher guide](./pilot-teacher-guide.md) · [QA matrix](./pilot-qa-matrix.md) |
| **C5** MVP gate | End of 6 | Real-class go / no-go | **In progress** — pilot evidence | [C5](./milestones/M5-mvp-gate.md) · [Evidence pack](./pilot-results/) · [Student handout](./pilot-student-handout.md) |

Each milestone must end in something **demoable**. Do not start the next milestone’s features until the current exit criteria pass.

---

## Suggested build order

1. `packages/types` + `packages/question-bank` + Supabase schema  
2. `apps/server` — auth + classes + questions + sessions APIs  
3. `apps/web` — student quiz flow (C1)  
4. `apps/web` — teacher assign/results (C2)  
5. Weak-topic + polish + pilot (C3–C5)

---

## Team split (1–2 people)

| Who | Owns |
|-----|------|
| Lead | C1 quiz + API sessions; C3 weak topics |
| Second | Content import + C2 teacher UI + pilot ops |
| Parallel always | Question tagging quality (unit / topic / explanation) |

Content quality is on the critical path.

---

## After classroom MVP (short)

Vision **M1–M6** lives in [docs/vision](../vision/README.md). Next product bets after the Ministry demo: [m2-backlog.md](../vision/m2-backlog.md).
