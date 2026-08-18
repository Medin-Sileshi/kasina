# Vision M2 — Core Product (Dec 2026)

Start **after** the Ministry demo (11 Sep 2026) and at least one real-class week using the classroom MVP gate ([C5](../mvp/milestones/M5-mvp-gate.md)).

---

## Build triggers

Do not start M2 tracks until:

1. Demo delivered successfully.
2. One non-demo class completes a week on kasina.et.
3. Teacher can name weak topics and at-risk students without support.

---

## Track A — Content

| Item | Scope | Reuse |
|------|-------|-------|
| Grade 12 Physics, Chemistry, Biology | Question banks + curriculum tags | Textbooks already on R2 |
| Stream variants | Natural vs social where MoE differs | `stream` field on questions |
| Amharic depth | Stems + explanations on all high-traffic items | Existing `stemAm` / `explanationAm` pattern |
| Linear programming / Business Math | If pilot schools request | Textbook units on R2 |

---

## Track B — Textbook linking

| Item | Scope | Reuse |
|------|-------|-------|
| `textbookRef` on questions | Chapter, section, page range | [`TextbookRef`](../../packages/types/src/index.ts) already defined |
| “Read in textbook” CTA | From wrong-answer review + Melak grounding | `/read/[subject]` reader exists |
| Deep links by page | For scanned math/biology image books | R2 page image pipeline exists |

---

## Track C — Mobile student app

| Item | Scope | Reuse |
|------|-------|-------|
| Expo app (`apps/mobile`) | Login, quiz, Melak, progress | Web API unchanged |
| Offline SQLite sync | Download assignments + question pack | Deferred from C0–C5 intentionally |
| Push notifications | Assignment reminders | After OTP identity is stable |

---

## Track D — Auth V1 (additive)

| Item | Scope | Reuse |
|------|-------|-------|
| Phone OTP | Africa’s Talking | **Additive** to invite codes — do not replace Better Auth |
| Parent contact | Optional phone on student profile | Schema addition only when legal review done |

---

## Track E — School admin portal

| Item | Scope | Reuse |
|------|-------|-------|
| `/school` portal | School profile, teacher roster, bulk enroll | **Separate** from teacher UI |
| Multi-class oversight | Principal view across teachers | New routes; same Postgres |
| Invite code batches | Generate codes per cohort | Extend `classes` admin API |

---

## Track F — Payments (non-blocking)

| Item | Scope | Notes |
|------|-------|-------|
| Telebirr | Apply Month 1 of M2 | Do not block pilots on payment |
| Bank transfer fallback | Manual reconciliation | For schools without Telebirr |
| Student paywall | Only after 3+ paying schools ask | Free invite-code pilot continues |

---

## Track G — School server (late M2)

| Item | Scope | Notes |
|------|-------|-------|
| Raspberry Pi image | Docs + prototype | **After** 3 schools use web daily |
| Local Wi‑Fi content | Mirror R2 textbooks + question bank | Requires sync protocol design |
| Solar kit partnership | Hardware — not software-first | Vision M6; document only in M2 |

---

## Explicitly not M2

- Grades 7–11 expansion (Vision M3)
- Ministry national dashboard (Vision M4)
- Tutoring marketplace / Qobo (Vision M5–M6)
- NEAEA direct integration (Vision M6)

---

## Suggested M2 calendar (Sep–Dec 2026)

| Month | Focus |
|-------|-------|
| Sep | Real-class pilot evidence; fix demo feedback; Physics bank start |
| Oct | Chem/Bio banks; `textbookRef` links; Expo login + quiz |
| Nov | OTP additive; school admin MVP; Telebirr application |
| Dec | Multi-subject pilot at 3 schools; M2 gate review |

---

## Data & legal (start in M2, required before M6)

- Explicit student consent for any analytics beyond classroom use.
- No silent “credit score” or Qobo fields — FDRE-compliant design before collection.
- Document retention and deletion in Privacy Policy before multi-school scale.
