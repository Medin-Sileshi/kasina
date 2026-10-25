# M5 — MVP Gate

> **Path update (2026-10-25):** This is a historical classroom-MVP milestone. Product direction has since changed: **online-first and low-bandwidth** (not offline-first), tutor renamed **Adey AI** (formerly Melak), pure not-for-profit, pilot scope = secondary schools in phases. Forward plan: [kasina-path-milestones.md](../../kasina-path-milestones.md). Statements below about deferred OTP, offline, Melak or CBT describe the state **at the time of this milestone**. This gate still applies to the **first real-class run**. The formal multi-school pilot is gated separately by K5 and measured in K6.

**Window:** End of Week 6 (+ 1 week observation)  
**Depends on:** M4 exit criteria  
**Purpose:** Decide, with evidence, whether the classroom loop works in a real class — then go/no-go for V1.  
**Status:** Not started — evidence pack templates ready; run after go-live week (do not invent metrics)

---

## Goal

Run **one real class** for at least one week. Measure learning-loop health (not vanity downloads). Record a clear go / no-go for post-MVP work.

---

## Pilot setup checklist

- [ ] 1 teacher (real school, not only friends)
- [ ] ≥15 students invited
- [ ] ≥1 Mathematics assignment created in week 1 of pilot
- [ ] Support channel (Telegram/WhatsApp) monitored daily
- [ ] Analytics or manual tally sheet for completions (DB queries OK)

---

## Success checklist (MVP done)

All primary gates should pass:

- [ ] **Duration:** Class active ≥ **7 days**
- [ ] **Adoption:** ≥15 students joined the class
- [ ] **Assignment:** ≥1 assignment completed by **majority** (≥50%) of joined students
- [ ] **Teacher signal:** Teacher can name ≥1 topic where students need help *from the dashboard*, without handholding
- [ ] **Student signal:** Students finish sessions without being walked through each screen
- [ ] **Stability:** No P0 outages during school-day usage windows

### Qualitative interview prompts

Ask the teacher:

1. What did you assign, and why?  
2. Who is struggling, and on what topic — how do you know?  
3. What would make you use this every week?  
4. What almost made you stop?

Ask 3 students:

1. Did explanations help?  
2. Did you practice weak topics after failing?  
3. What was confusing?

---

## Go / no-go for V1

### GO if

- Primary gates pass, and  
- Teacher wants to continue next week without bribes, and  
- Critical bugs are known and schedulable  

**Then prioritize the new path (in order):**

1. Online-first hardening: queued answers, caching, conversation IDs (K1)
2. Adey AI on self-hosted infrastructure, evaluated in Amharic (K2)
3. Content expansion: Grade 11 Mathematics, then other subjects (K3)
4. Data protection and safeguarding before real students are onboarded (K4)
5. Pilot readiness and the multi-school pilot (K5, K6)

_Superseded V1 order (kept for history):_ mobile APK (parked), phone OTP (shipped), offline SQLite (dropped), multi-subject (now K3), cached Melak (now Adey AI, K2).

### NO-GO / iterate if

- Students join but don’t finish assignments, or  
- Teacher ignores dashboard, or  
- Weak topics feel random / untrusted  

**Then:** stay on web; fix learning loop / content / UX before mobile or Melak.

### Explicitly do not jump to

- Ministry dashboard  
- Paywall  
- CBT as the “save” feature if classroom loop failed  

---

## Evidence pack to file

Create / fill [`docs/mvp/pilot-results/`](../pilot-results/) with:

- [ ] Dates + school/class anonymized ID — `00-setup.md`
- [ ] Join count, completion rates, top weak topics — `02-metrics.md` + `sql-tally.md`
- [ ] Teacher + student interview notes — `03-interviews.md`
- [ ] Bug list with severity — `04-bugs.md`
- [ ] Written **GO** or **NO-GO** + next milestone recommendation — `05-decision.md`

---

## Exit criteria

- [ ] Evidence pack complete  
- [ ] GO or NO-GO written and shared with stakeholders  
- [ ] If GO: next milestone doc stubbed (the V1 stub is superseded by `kasina-path-milestones.md`)  
- [ ] If NO-GO: top 3 loop fixes scheduled before any new surface  

---

## Reminder

MVP success is **not** “we built quiz screens.”

MVP success is:

> A teacher assigns → students practice with feedback → both act on weak topics — for a real class, for a week.
