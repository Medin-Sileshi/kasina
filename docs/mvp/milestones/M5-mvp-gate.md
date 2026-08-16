# M5 — MVP Gate

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

**Then prioritize V1 (in order):**

1. Mobile student APK (Expo) for Android  
2. Phone OTP auth  
3. Offline SQLite sync  
4. Multi-subject expansion  
5. Cached Melak  

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
- [ ] If GO: V1 milestone doc stubbed  
- [ ] If NO-GO: top 3 loop fixes scheduled before any new surface  

---

## Reminder

MVP success is **not** “we built quiz screens.”

MVP success is:

> A teacher assigns → students practice with feedback → both act on weak topics — for a real class, for a week.
