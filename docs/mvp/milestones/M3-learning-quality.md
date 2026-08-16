# M3 — Learning Quality

**Window:** Week 4–5  
**Depends on:** M2 exit criteria  
**Purpose:** Turn practice into **targeted learning** so national exam readiness is a byproduct of mastery — not random drilling.  
**Status:** Mostly done — weak-topic loop live; bank ≥150 with Sequences/Calculus depth + Amharic sample; textbook-backed review still recommended

---

## Goal

After wrong answers, the next action is always **targeted practice**. Students and teachers share a consistent weak-topic picture. Content depth reaches pilot-ready levels (~150 Math questions).

---

## Why this milestone exists

M1 = feedback on each question.  
M2 = teacher can assign.  
M3 = the loop **closes on curriculum topics**: weak areas drive the next session.

This is the difference between “doing questions” and “getting better at the exam.”

---

## Deliverables checklist

### Weak-topic algorithm

- [x] Define accuracy per `topic`: `correct / attempted` (minimum attempt threshold, e.g. ≥3)
- [x] Weak = accuracy < 70% (document threshold; tune later)
- [x] Compute for student (all their answers) and for class (aggregate)
- [x] Shared helper in server or `packages/` used by student + teacher APIs

### Student surfaces

- [x] Results CTA: **Practice weak topics →** starts a session filtered to bottom topics
- [x] Progress **Focus areas** tags: `Topic · xx%` → tap starts filtered practice
- [x] If no weak topics: success empty state (“No weak topics right now”)
- [x] Assignment completion status clearly todo / done on home

### Teacher surfaces

- [x] Class weak topics list matches student algorithm (same thresholds)
- [x] Optional: “Assign practice on [weak topic]” shortcut pre-filling create-assignment

### Content & i18n quality

- [x] Push validated Grade 12 Math bank toward **150** questions (now ≥170)
- [x] Coverage across major units (incl. Sequences and Series) — see [curriculum-map](../curriculum-map-grade12-math.md)
- [ ] Explanations reviewed for correctness (ongoing with MoE textbooks)
- [x] Amharic rendering: Noto Serif Ethiopic + `lang="am"` on Ethiopic strings
- [x] Sample `stemAm` / `explanationAm` set (~25 items)
- [ ] Fix known bug class: Ethiopic character rendering as wrong Latin glyphs (verify on device)

### Nice-to-have (only if ahead of schedule)

- [ ] Bookmark question  
- [ ] “Practice weak topics” respects class assignment context  

---

## Algorithm sketch (implement literally)

```text
For each topic in student's answers:
  accuracy[topic] = correct_count / total_count
Filter topics where total_count >= MIN_ATTEMPTS
Sort by accuracy ascending
Weak topics = those with accuracy < WEAK_THRESHOLD (0.7)

Practice-weak session:
  Pick N questions from lowest topics (round-robin across bottom 3)
```

Same aggregation for class: pool all member answers (or average per-student topic accuracy — pick one and document it; prefer pooled answers for MVP simplicity).

---

## API additions

- [ ] `GET /progress/weak-topics` — student  
- [ ] `GET /classes/:id/weak-topics` — teacher  
- [ ] `POST /sessions` — accept `mode: "weak_topics"` or `topicIds: []`  

---

## Exit criteria

All must be true:

- [ ] Completing a session with mistakes surfaces weak topics on Results + Progress  
- [ ] **Practice weak topics** starts a filtered session (not random)  
- [ ] Teacher class view shows overlapping weak topics for that class  
- [ ] Question bank ≥ **100** (stretch **150**) with unit/topic tags  
- [ ] Amharic sample questions render correctly  

**Demo script:** Intentionally fail Power Rule questions → see Power Rule as weak → tap Practice weak topics → get Power Rule items → teacher dashboard shows Power Rule weak for class.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Too few attempts → noisy weak topics | `MIN_ATTEMPTS`; hide until threshold |
| Content bottleneck | Parallel content track from M0; freeze UI features if bank < 80 |
| Scope creep into Melak | Keep Melak out; explanation text is enough for MVP |

---

## Out of scope for M3

- AI adaptive weekly calendar  
- Predicted ESSLCE score  
- Live Melak / textbook page jump  
- CBT simulator
