# V1 — Mobile student + auth (superseded)

> **Path update (2026-10-25):** This stub is **superseded** by [kasina-path-milestones.md](../../kasina-path-milestones.md). It is kept so older links and the M5 decision history still resolve.

**Status:** Superseded. Do not expand.
**Originally depended on:** M5 GO.

## What happened to each original V1 priority

| Original V1 priority | Outcome | Where it lives now |
|----------------------|---------|--------------------|
| 1. Mobile student APK (Expo, `apps/mobile`) | **Parked.** Low-end Android devices limit on-device work, and the web PWA covers the pilot. Revisit only if pilot data shows web is the limiting factor. | K7 (conditional) |
| 2. Phone OTP auth | **Shipped** (device SIM SMS gateway, `/medin/otp` queue). Student identity model (OTP vs email) still to be settled. | K0 decision #1, K4 |
| 3. Offline SQLite sync | **Dropped.** Replaced by online-first resilience: cached shell, school-level caching, queued answers and tutor questions sent on reconnect. | K1 |
| 4. Multi-subject expansion | **Planned in phases** (Grade 11 Math, then other subjects), each with a review checklist. | K3 |
| 5. Cached Melak | **Replaced** by **Adey AI**: self-hosted ~9B open model, curriculum-grounded, evaluated in Amharic, model-agnostic. | K2 |

## Still out of scope

- Ministry dashboard, paywall, or a paid private-school arm (Kasina is a pure not-for-profit)
- Desktop Electron as a student surface
- Full Amharic UI chrome (content Amharic continues in parallel under K3)

## Links

- Forward plan: [kasina-path-milestones.md](../../kasina-path-milestones.md)
- MVP thesis: [../README.md](../README.md)
- Gate decision: [../pilot-results/05-decision.md](../pilot-results/05-decision.md)
- Deferrals: [../post-mvp-backlog.md](../post-mvp-backlog.md)
