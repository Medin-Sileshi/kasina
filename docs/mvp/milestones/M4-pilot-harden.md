# M4 — Pilot Harden

> **Path update (2026-10-25):** This is a historical classroom-MVP milestone. Product direction has since changed: **online-first and low-bandwidth** (not offline-first), tutor renamed **Adey AI** (formerly Melak), pure not-for-profit, pilot scope = secondary schools in phases. Forward plan: [kasina-path-milestones.md](../../kasina-path-milestones.md). Statements below about deferred OTP, offline, Melak or CBT describe the state **at the time of this milestone**.

**Window:** Week 5–6  
**Depends on:** M3 exit criteria  
**Purpose:** Make the product safe and usable for a real school class without feature creep.  
**Status:** Partial — rate limits, role guards, guides, smoke script ready; live DNS cutover + device QA matrix still ops

---

## Goal

Ship an install-free pilot: share a URL + invite code with one class. Critical bugs fixed; roles enforced; usable on Android Chrome and desktop.

---

## Deliverables checklist

### UX / responsive

- [ ] Phone-width pass on: join, home, subject, quiz, results, progress, teacher class/assign/results
- [ ] Touch targets ≥ 44px on primary quiz actions
- [ ] No horizontal scroll on quiz options
- [ ] Sticky quiz bar doesn’t cover submit on small screens

### Security & integrity

- [ ] Role guards: students redirected from `/teacher/*`
- [ ] Teachers cannot read other teachers’ classes
- [ ] Students only see own sessions + classes they joined
- [ ] Zod validation on all mutating API routes
- [ ] Basic rate limiting on join + answer submit (Workers-friendly)

### Pilot ops

- [ ] Seed/reset script for pilot class (or documented manual setup)
- [ ] Teacher onboarding one-pager (PDF or `docs/mvp/pilot-teacher-guide.md`):
  - [ ] Login  
  - [ ] Create/share invite  
  - [ ] Create assignment  
  - [ ] Where to see results  
- [ ] Student join instructions (3 steps max) — _handout still describes email + password; the identity model (phone OTP vs email) is open decision #1 in the path file._
- [ ] Support contact for pilot week

### Device / QA matrix

- [ ] Android Chrome (small phone)
- [ ] Android Chrome (large phone)
- [ ] Android Chrome (tablet or large)
- [ ] Desktop Chrome or Firefox
- [ ] Airplane-mode expectations documented (MVP needs network — show clear error) — _consistent with the online-first path; K1 adds throttled 2G/3G rows and queue-state checks to this matrix._

### Bug policy

- [ ] Fix **critical** bugs only (blockers for assign / quiz / results / auth)
- [ ] Log non-critical issues in a “post-MVP” list — do not implement mid-pilot

---

## Exit criteria

All must be true:

- [ ] Fresh teacher can onboard from one-pager alone  
- [ ] Fresh students join and complete an assignment on phone browsers  
- [ ] No student can open teacher routes  
- [ ] Critical path bug count = 0 on QA matrix  
- [ ] Staging (or production) URL ready to share  

**Demo script:** Hand phone to someone unfamiliar → they join + finish 5 questions using only the student instructions sheet.

---

## Risks

| Risk | Mitigation |
|------|------------|
| “Just one more feature” | Non-goals doc is law; M5 is measurement not build |
| School Wi-Fi flaky | Clear retry UI; keep payloads small |
| Auth cookie issues on mobile browsers | Test third-party cookie / same-site early |

---

## Out of scope for M4

- New product features (Melak, CBT, offline, iOS, etc.) _(Melak is now Adey AI; offline is replaced by online-first resilience)_  
- Visual redesign unrelated to bugs  
- Multi-school admin
