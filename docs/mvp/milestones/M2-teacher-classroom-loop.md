# M2 — Teacher Classroom Loop

**Window:** Week 3–4  
**Depends on:** M1 exit criteria  
**Purpose:** Make Kasina a classroom product — not only a practice app.  
**Status:** Done — assign, roster, class results, student assigned work in `apps/web` + API

---

## Goal

A teacher can create/manage a class, share an invite code, assign practice (by topic/unit or random set), and see per-student completion/scores plus class-level weak topics. Students see assigned work on their home screen.

---

## Why this milestone exists

M1 proves students can learn from feedback.  
M2 proves **teachers can intervene**. Without M2, Kasina collapses back into “practice questions only,” which does not reliably help students pass exams.

---

## User flows

### Teacher

```text
/teacher
  → My classes
      → Class detail (roster + invite code)
          → Create assignment
          → Class results / weak topics
```

### Student (additions)

```text
Home
  → “Assigned for you” list
      → Start assignment → existing Quiz flow (M1)
  → Self-practice (unchanged)
```

---

## Deliverables checklist

### Teacher home — `/teacher`

- [ ] List classes for logged-in teacher
- [ ] Create class (name, grade=12, subject=mathematics)
- [ ] Empty state: “Create your first class”

### Class detail — `/teacher/classes/:classId`

- [ ] Display **invite code** (copy button)
- [ ] Roster table: student display name, joined date, last activity
- [ ] Refresh roster when students join
- [ ] Guard: only owning teacher can view

### Assignments

- [ ] Create assignment form:
  - [ ] Title  
  - [ ] Mode: topic/unit filter **or** “N random questions”  
  - [ ] Question count (default 10)  
  - [ ] Optional due date  
- [ ] List assignments on class detail (title, due, completion count)
- [ ] Assignment detail: who completed / not completed; scores

### Class results

- [ ] Per-student: last session score, # sessions, completion of latest assignment
- [ ] Class weak topics aggregate (from member answers; refine in M3 if needed)
- [ ] Sort/filter: incomplete assignment first

### Student home updates

- [ ] Section **Assigned for you** with status: todo / done
- [ ] Tap assignment → starts session linked to `assignment_id`
- [ ] Self-practice entry still available
- [ ] Students cannot access `/teacher/*`

### API

- [ ] `POST /classes` — create class (generates invite code)
- [ ] `GET /classes` — teacher’s classes / student’s classes
- [ ] `GET /classes/:id` — detail + roster (authorized)
- [ ] `POST /classes/join` — already in M0; ensure idempotent
- [ ] `POST /assignments` — create for class
- [ ] `GET /assignments?classId=` — list
- [ ] `GET /assignments/:id` — detail + completion
- [ ] `POST /sessions` — accept optional `assignmentId`
- [ ] `GET /classes/:id/results` — aggregate for teacher dashboard

---

## Repo touchpoints

| Path | Work |
|------|------|
| `apps/web/src/app/teacher/...` | Teacher routes |
| `apps/web` student home | Assigned work section |
| `apps/server` | Classes + assignments + results endpoints |
| `packages/types` | Assignment DTOs, completion status |

---

## Exit criteria

All must be true:

- [ ] Teacher creates class and shares invite code  
- [ ] ≥2 students join and appear on roster  
- [ ] Teacher assigns **“Power Rule · 10 Q”** (or equivalent topic)  
- [ ] Students complete the assignment via home → quiz → results  
- [ ] Teacher sees who completed and who struggled on that topic  

**Demo script:** Teacher assigns topic → two student browsers complete → teacher results page shows scores + weak topic.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Assignment question selection buggy | Server-side selection only; store resolved `question_ids` on create |
| Students start assignment twice | One active session per assignment, or allow retry but mark latest |
| Teacher UI overbuilt | Table + form only — no charts (charts are V2) |

---

## Out of scope for M2

- Heatmaps, PDF export, school admin multi-class hierarchy  
- SMS invites, email blasts  
- Melak, CBT, textbooks  
- Perfect weak-topic UX (good enough aggregate OK; M3 deepens)
