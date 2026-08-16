# MVP Non-Goals

These are **explicitly out of MVP** to protect the ~6 week timeline. Do not pull them in mid-sprint without a written go/no-go tradeoff.

## Do not build in MVP

| Item | Why deferred |
|------|----------------|
| Expo / mobile student APK | Web-first ships the classroom loop faster; APK after pilot |
| CBT exam simulator | Assessment mode on top of mastery — V2 |
| Melak (cached or live AI) | Tutor layer after assign/practice/feedback works |
| Textbook PDF reader / deep-links | Amplifies wrong-answer → learn; needs linking table |
| Electron desktop wrapper | Not needed for classroom pilot |
| School-wide admin console | One teacher + one class is enough for MVP |
| Ministry / national analytics | B2G layer after product-market fit in classrooms |
| SMS phone OTP (Africa’s Talking) | Biggest auth schedule risk; invite codes for MVP |
| Adaptive weekly AI study plan | Needs reliable weak-topic data first (M3+) |
| Freemium / Telebirr paywall | Revenue after retention |
| Multi-subject catalog | Grade 12 Math only until loop is proven |
| Full offline-first SQLite | Connectivity required for assign/sync in MVP |

## What returns later

CBT, Melak, and textbooks return in **V1/V2 as amplifiers of the same classroom loop** — not replacements for it.

If a feature request does not strengthen:

> teacher assigns → student practices with feedback → weak topics visible to both

…it does not belong in MVP.
