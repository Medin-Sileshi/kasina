# Kasina — Status as of August 2026

Production: **kasina.et** (web) · **api.kasina.et** (Workers API)

This table tracks the **company vision** (M0–M6). For the shipped classroom build, see [docs/mvp](../mvp/README.md) (C0–C5).

---

## Vision M1 (Ministry demo — target 11 Sep 2026)

| Item | Status |
|------|--------|
| Grade 12 Math practice (150+ items) | **178 items** in bank; sample placeholders being replaced |
| Quiz: answer, reveal, results, review | **Shipped** — `/quiz/*` |
| Teacher class, assign, weak topics | **Shipped** — `/teacher/*` |
| Textbook reader Gr 12 | **Shipped** — `/read/*`, R2 markdown / page images |
| Melak AI (EN + Amharic) | **Shipped (offline-first)** — `/melak` lightweight tutor; optional cloud when online |
| CBT simulator | **In progress** — `mode: cbt` on existing questions |
| Demo class (~40 students, mixed scores) | **In progress** — seed script |
| Phone OTP | **Skipped** — invite code + email (Better Auth) |
| Android app | **Scaffold only** — `apps/mobile` hello world |
| Ministry portal | **Not built** — out of M1 scope |

---

## Explicitly out of Sep 11 demo

Phone OTP, Play Store APK, Telebirr, Raspberry Pi school server, `/ministry`, iOS, Electron, Qobo data collection.

---

## After demo → Vision M2 (Dec 2026)

See [m2-backlog.md](./m2-backlog.md).

---

## Demo runbook

See [demo-script.md](./demo-script.md) for the 20-minute Ministry meeting flow.
