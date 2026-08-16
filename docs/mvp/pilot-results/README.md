# Pilot results — evidence pack

**Purpose:** Capture evidence for the [M5 MVP gate](../milestones/M5-mvp-gate.md). This folder is measurement + decision — not a feature backlog.

Fill templates during / after a **≥7-day** real-class pilot. Do not invent metrics.

---

## After go-live (do not skip)

1. Complete device QA cells in [pilot-qa-matrix.md](../pilot-qa-matrix.md) on Android Chrome.
2. Fill this pack during a **≥7-day** real class — [00-setup](./00-setup.md) → [05-decision](./05-decision.md).
3. Do **not** mark GO without scorecard + interviews.

Deploy: [deploy-kasina-et.md](../deploy-kasina-et.md). Smoke: `pnpm smoke:prod`.

---

## Preflight blockers (finish before Day 0)

These are M4 ops items. Pilot week cannot start until they are done.

| Check | Where | Done |
|-------|--------|------|
| Staging **Web** URL filled | [pilot-qa-matrix.md](../pilot-qa-matrix.md) — `https://kasina.et` | ☐ ops live |
| Staging **API** URL filled | [pilot-qa-matrix.md](../pilot-qa-matrix.md) — `https://api.kasina.et` | ☐ ops live |
| Support contact filled | [pilot-qa-matrix.md](../pilot-qa-matrix.md) + [pilot-teacher-guide.md](../pilot-teacher-guide.md) — `support@kasina.et` | ☐ confirm inbox |
| Device critical-path QA once | [pilot-qa-matrix.md](../pilot-qa-matrix.md) | ☐ |
| Teacher can follow one-pager alone | [pilot-teacher-guide.md](../pilot-teacher-guide.md) | ☐ |
| Class / invite ready (`pnpm db:reset-pilot` if needed) | [production-db.md](../production-db.md) | ☐ |
| Printable student handout ready | [pilot-student-handout.md](../pilot-student-handout.md) | ☐ |
| Deploy runbook followed | [deploy-kasina-et.md](../deploy-kasina-et.md) | ☐ |
| API smoke | `API_URL=https://api.kasina.et pnpm smoke:prod` | ☐ |

---

## Pack contents

| File | Fill when |
|------|-----------|
| [00-setup.md](./00-setup.md) | Day 0 |
| [01-scorecard.md](./01-scorecard.md) | Day 7+ |
| [02-metrics.md](./02-metrics.md) | Daily + Day 7 |
| [03-interviews.md](./03-interviews.md) | Day 7+ |
| [04-bugs.md](./04-bugs.md) | Ongoing |
| [05-decision.md](./05-decision.md) | After scorecard + interviews |
| [sql-tally.md](./sql-tally.md) | Reference (copy SQL into Supabase) |

---

## Pilot week rhythm

### Day 0

1. Teacher logs in ([teacher guide](../pilot-teacher-guide.md)).
2. Create class (or use seeded invite) → share invite code.
3. Create **≥1** Mathematics assignment (e.g. Power Rule · 10 Q).
4. Fill [00-setup.md](./00-setup.md).
5. Hand out [student handout](../pilot-student-handout.md).

### Daily

1. Monitor support channel.
2. Log any **P0** (outage / blocked assign–quiz–results) in [04-bugs.md](./04-bugs.md).
3. Optional: paste join/completion counts into [02-metrics.md](./02-metrics.md).

### Mid-week

1. Confirm ≥15 students joined (SQL or teacher roster).
2. One ops nudge to incomplete students — not a product change.

### Day 7+

1. Run queries in [sql-tally.md](./sql-tally.md) → paste into [02-metrics.md](./02-metrics.md).
2. Complete [01-scorecard.md](./01-scorecard.md).
3. Run interviews → [03-interviews.md](./03-interviews.md).
4. Write **GO** or **NO-GO** in [05-decision.md](./05-decision.md).
5. If GO: ensure [V1 stub](../milestones/V1-mobile-and-auth.md) is the next track.  
   If NO-GO: schedule top 3 fixes in [post-mvp-backlog.md](../post-mvp-backlog.md).

---

## Teacher signal (no SQL required)

Can the teacher name ≥1 weak topic from the dashboard alone?

- Open `/teacher` or `/teacher/classes/[id]/results`
- Weak topics / heatmap should show topics with ≥3 attempts and &lt;70% accuracy (M3 rules)

Record the answer in [01-scorecard.md](./01-scorecard.md).
