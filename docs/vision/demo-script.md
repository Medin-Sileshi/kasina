# Ministry demo script (~20 minutes)

**Audience:** Ministry of Education stakeholders  
**Date target:** 11 September 2026  
**Environment:** Production — [kasina.et](https://kasina.et) · invite code `DEMO2026`

---

## Before the meeting (5 min setup)

1. Teacher account logged in on laptop (`teacher@kasina.local` or your pilot teacher).
2. Student account logged in on phone or second browser tab (any demo student, or live signup with `DEMO2026`).
3. Confirm API health: `https://api.kasina.et/health` → `{ ok: true }`.
4. Confirm `ANTHROPIC_API_KEY` is set on the Worker for Melak.
5. Run seed if dashboards look empty: `pnpm --filter @kasina/db seed` (requires Supabase env vars).

---

## Act 1 — The classroom is real (4 min)

**Teacher laptop → `/teacher/classes`**

- Open **Ministry Demo School — Grade 12 Math** (invite `DEMO2026`).
- Show **~40 students** on roster with varied last scores — not an empty dashboard.
- Point out **weak topics** heatmap: “Teachers see where the class struggles without handholding.”

**Talking point:** This is a live closed loop — assign → practice → weak topics → intervention. Built over 6 weeks; not a mockup.

---

## Act 2 — Student practice (4 min)

**Student device → `/student` or `/subjects/mathematics`**

1. Start a short **practice session** (3 questions is enough live).
2. Answer one correctly — show **instant explanation**.
3. Answer one wrong — show **review** with correct option + explanation.
4. Mention **Amharic** on stems/explanations where available.

**Talking point:** Curriculum-tagged Grade 12 Math bank (~178 items), aligned to textbook units.

---

## Act 3 — Melak tutor (4 min)

**Student device → `/melak`** (or “Ask Melak” from wrong-answer review)

1. **Turn off wifi** briefly — show Melak still responds (offline tutor).
2. Ask: *“Why is the product rule used here?”* (English) or a short Amharic calculus question.
3. From review, open **Ask Melak** — show grounded explanation from cached question.
4. Be honest: *“Offline Melak is lightweight and on-device. Optional cloud tutor needs wifi.”*

**Fallback:** Offline mode always works — no API key required for demo.

---

## Act 4 — CBT exam mode (4 min)

**Student device → `/cbt`**

1. Start **CBT practice** (20 questions, 40-minute timer).
2. Show **no per-question reveal** during exam.
3. **Flag** one question, jump via question grid.
4. **Submit all** → results page → weak topics still update.

**Talking point:** CBT is exam chrome on the same question bank — not a separate product rewrite.

---

## Act 5 — Teacher closes the loop (3 min)

**Teacher laptop**

- Return to class overview after student submitted CBT/practice.
- Show **at-risk** or lowest scores if time.
- Open **textbook reader** (`/read/mathematics`) — MoE Grade 12 Math on R2.

**Close:** “We are piloting Grade 12 Math classrooms nationally next — not claiming full Gr 7–12 rollout today.”

---

## Explicitly do not demo

- Phone OTP, Telebirr, Play Store APK, Raspberry Pi school server, `/ministry` portal, Qobo.

---

## Backup plan

- Record a **3-minute screen capture** of Acts 2–4 before the meeting.
- If Wi‑Fi fails in the room, use backup video + teacher dashboard on cached load.

---

## After the meeting

- Capture feedback in `docs/mvp/pilot-results/`.
- Vision M2 backlog: [m2-backlog.md](./m2-backlog.md).
