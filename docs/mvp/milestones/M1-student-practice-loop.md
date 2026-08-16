# M1 — Student Practice Loop

**Window:** Week 1–3  
**Depends on:** M0 exit criteria  
**Purpose:** Core learning path — the screens students use every day.  
**Status:** Implemented — ready for student demo

---

## Goal

A student can start a Grade 12 Mathematics practice session, answer questions with immediate feedback and explanations, finish with results + topic breakdown, review wrong answers, and see basic progress — all persisted to the API.

---

## User flow

```text
Home
  → Subject Screen (/subjects/mathematics)
      → Quiz Screen (/quiz/:sessionId)
          → Answer state (same route; options lock + explanation)
          → …repeat…
      → Results (/quiz/:sessionId/results)
          → Review (/quiz/:sessionId/review)
  → Progress (/progress)
```

Reference UX: Kasina webapp design spec (Answer Option 6 states, tokens, empty states).

---

## Deliverables checklist

### Subject screen — `/subjects/mathematics`

- [ ] Header: subject name, Grade 12, question count, overall accuracy pill (if data exists)
- [ ] Primary CTA: **Practice 10 random questions**
- [ ] Secondary: practice by year (if `year` tagged) — chips OK
- [ ] **By topic** accordion: unit/chapter → topics with accuracy + “Practice →”
- [ ] Back navigation to home / subjects

### Quiz screen — `/quiz/:sessionId`

- [ ] Sticky top bar: exit (X), subject · context, `n / total`
- [ ] Progress strip (4px) updating after each answered question
- [ ] Question card: meta, difficulty badge, stem (EN / Amharic with `lang="am"` + Ethiopic font)
- [ ] **KaTeX** for all math (inline + block); monospace fallback if KaTeX fails
- [ ] Optional image on question
- [ ] **Answer Option** component with states:
  1. Default  
  2. Hover (desktop)  
  3. Selected (pre-submit)  
  4. Correct (post-submit)  
  5. Wrong selected (post-submit + shake)  
  6. Correct but not selected (post-submit, dimmed)  
- [ ] Submit appears only after selection → becomes “Next Question →” / “See Results →”
- [ ] Optional timer if enabled in settings (can stub settings toggle)
- [ ] Exit confirmation modal (progress saved)
- [ ] Keyboard shortcuts (desktop): A/B/C/D, Enter, Escape

### Answer state (same quiz route)

- [ ] Options animate to correct/wrong; non-interactive after submit
- [ ] Explanation panel slides in (EN; Amharic if present)
- [ ] Result indicator: “Correct!” or “The correct answer is [X]”
- [ ] Optional: Bookmark + Ask Melak links **hidden or disabled** (Melak out of MVP) — Bookmark only if time

### Results screen — `/quiz/:sessionId/results`

- [ ] Hero score (% count-up), fraction correct, star rating bands
- [ ] Performance message by score band (≥80 / 60–79 / <60)
- [ ] Topic breakdown bars from session answers
- [ ] CTAs: practice weak topics (wire stub OK until M3), retry, back to subject

### Review screen — `/quiz/:sessionId/review`

- [ ] List of wrong answers only
- [ ] Tap → read-only modal with final option states + explanation open
- [ ] Perfect-score empty state

### Progress screen — `/progress`

- [ ] Stats: questions answered, average score, day streak (streak can be simple)
- [ ] By subject row (Math only active; others “Coming soon” if shown)
- [ ] Focus areas (weak topic tags) — algorithm can be basic; refined in M3
- [ ] Recent sessions table (last 5)

### Persistence & API

- [ ] `POST /sessions` — start session (random / topic / assignment later)
- [ ] `POST /sessions/:id/answers` — record each answer
- [ ] `POST /sessions/:id/complete` — finalize score
- [ ] `GET /sessions/:id` — results + answers for review
- [ ] `GET /progress` — aggregates for current student
- [ ] React Query (or equivalent) for fetch; Zustand only if needed for in-quiz UI state

### Empty & error states

- [ ] No questions available  
- [ ] Network error loading quiz  
- [ ] Session save failure  
- [ ] Zero sessions on progress  

---

## Repo touchpoints

| Path | Work |
|------|------|
| `apps/web/src/app/...` | Routes for subject, quiz, results, review, progress |
| `packages/ui` | `AnswerOption`, shared buttons, badges |
| `apps/server` | Sessions + answers endpoints |
| `packages/types` | Request/response DTOs if needed |

---

## Exit criteria

All must be true:

- [ ] Student completes a **10-question** session end-to-end  
- [ ] Wrong answers show explanation; results show topic breakdown  
- [ ] Review lists incorrect items  
- [ ] Progress reflects the completed session after refresh  
- [ ] Works on a phone-width viewport (basic; polish in M4)  

**Demo script:** Join as student → Practice 10 random → finish → show results → review one wrong → open Progress.

---

## Risks

| Risk | Mitigation |
|------|------------|
| KaTeX / Amharic layout bugs | Fix fonts early; test mixed EN+math questions |
| Scope creep into Melak/CBT | Keep links disabled; see non-goals |
| Quiz state loss on refresh | Persist answers immediately; restore session by id |

---

## Out of scope for M1

- Teacher assign UI, class roster, invite management (M2)  
- Polished weak-topic algorithm + “Practice weak topics” fully wired (M3)  
- Offline SQLite, mobile app
