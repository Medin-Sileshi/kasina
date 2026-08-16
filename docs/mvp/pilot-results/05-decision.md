# 05 — GO / NO-GO decision

Fill after [01-scorecard.md](./01-scorecard.md), [02-metrics.md](./02-metrics.md), [03-interviews.md](./03-interviews.md), and [04-bugs.md](./04-bugs.md).

Share this page with stakeholders.

## Decision

**Date:** ________  
**Author:** ________  
**Pilot ID:** (from [00-setup.md](./00-setup.md)) ________

### Verdict (pick one)

- [ ] **GO** — Primary gates pass; teacher wants to continue; critical bugs known and schedulable  
- [ ] **NO-GO / iterate** — Join without finish, teacher ignores dashboard, and/or weak topics untrusted  

### One-paragraph rationale



### Scorecard reference

- Gates passed: ___ / 6  
- Completion rate: ___%  
- Teacher continues next week: Y / N / Unsure  
- Unresolved P0s: ___

---

## If GO → V1

Prioritize in this order (do not reorder casually):

1. Mobile student APK (Expo) for Android  
2. Phone OTP auth  
3. Offline SQLite sync  
4. Multi-subject expansion  
5. Cached Melak  

**Next doc:** [V1-mobile-and-auth.md](../milestones/V1-mobile-and-auth.md) (stub ready — expand when GO is confirmed).

**Do not jump to:** Ministry dashboard, paywall, CBT as a “save” if the classroom loop already works — keep V1 ordered as above.

---

## If NO-GO → top 3 loop fixes

Stay on web. Fix learning loop / content / UX **before** mobile or Melak.

Schedule in [post-mvp-backlog.md](../post-mvp-backlog.md):

| # | Fix (loop / content / UX) | Owner | Target date |
|---|---------------------------|-------|-------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

**Explicitly do not start:** Expo APK, phone OTP, Melak, CBT, Ministry, paywall until these three land.

---

## Stakeholder sign-off

| Name | Role | Ack date |
|------|------|----------|
| | | |
| | | |
