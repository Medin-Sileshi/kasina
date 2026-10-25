# Kasina — path forward & milestones (K0–K7)

**Status:** Planning document. Describes where the product is going, not what is shipped today (see [architecture.md](./architecture.md) for "as implemented").
**Owner:** Medin Sileshi · **Last updated:** 2026-10-25
**Dates:** Deliberately relative (weeks from kickoff). Fill in calendar dates once funding and school agreements are confirmed.

> **Naming:** K0–K7 are the milestones on the *new path*. They are separate from the classroom-MVP milestones **C0–C5** (`docs/mvp`) and the company roadmap **M0–M6** (`docs/vision`). C0–C5 are done or closing; K0 onward builds on them.

---

## 1. What changed in direction

| Topic | Before | New path |
|-------|--------|----------|
| Positioning | "Offline-first" platform | **Online, low-bandwidth** platform. Built for poor connections, not for working without any. |
| Offline layer | PWA + IndexedDB + on-device Melak fallback as a headline feature | Keep the PWA shell and caching as **resilience** (school-level caching, queued questions sent when a connection returns). Stop promising offline operation. On-device small-model inference is **dropped**: low-end Android devices (RAM, no NPU, thermal limits) make it unreliable. |
| Tutor | Melak, demo LLM via LM Studio tunnel | **Adey AI**, an open ~9B model **self-hosted on Kasina servers**, curriculum-grounded, model-agnostic. |
| Organization | Not-for-profit with a possible paid private-school arm | **Pure not-for-profit.** No revenue-generating private arm in scope. |
| Audience wording | Grade 12 Math / Grade 11–12 | **Secondary school** students and teachers, Grades 11–12 first, all subjects in phases, then 9–10. |
| Budget | Hosting folded into pilot ask | Pilot delivery budget **ETB 3,200,000**; ongoing hosting and infrastructure are tracked and funded **separately**. |
| Success definition | Pilot activity | **Measured learning gains** against baseline and comparison schools; ESSLCE results are one supporting measure. |
| Compliance | Policy statement | GDPR-principle alignment, EU AI Act preparation, Ethiopian data law, DPIA **before launch**. No compliance claims before legal review. |

Unchanged: the **closed classroom loop** (teacher assigns → student practices with feedback → weak topics visible to both) remains the product core. Everything below amplifies it.

---

## 2. Milestone overview

| ID | Milestone | Duration | Gate to exit |
|----|-----------|----------|--------------|
| **K0** | Alignment & baseline | 2–3 wks | Docs and naming reconciled; open decisions closed |
| **K1** | Online-first hardening | 3–4 wks | Low-bandwidth behaviour verified on real devices and networks |
| **K2** | Adey AI | 6–8 wks | Model chosen on evaluation evidence; self-hosted in production |
| **K3** | Content expansion | Ongoing, 3 phases | Each subject meets coverage + review bar before assignment to a class |
| **K4** | Data protection & safeguarding | 4–6 wks (parallel) | DPIA done, agreements signed, legal review complete |
| **K5** | Pilot readiness | 4–6 wks | Partners signed, schools onboarded, baseline collected, targets published |
| **K6** | Pilot run | 12–18 months | Quarterly checkpoints and final evaluation |
| **K7** | Post-pilot expansion | After K6 | Grade 9–10, more schools, Amharic fine-tuning |

```
K0 ──► K1 ──► K2 ─────────────┐
 │      └───► K3 (phase 1) ───┼──► K5 ──► K6 ──► K7
 └──► K4 (parallel) ──────────┘
```

K4 runs alongside K1–K3 but **blocks K5**: no real students are onboarded before it exits.

---

## K0 — Alignment & baseline

**Goal:** One consistent story across product, docs and funder materials.

- [ ] Rename Melak → **Adey AI** in UI copy, docs, route names (keep `/melak` redirecting), package names (`@kasina/melak-core` → decide rename or alias) and handouts.
- [ ] Update external messaging: online-first, not-for-profit, secondary schools, hosting budget separate.
- [ ] Reconcile stale docs (see §5).
- [ ] Close the open decisions in §6 or assign an owner and date to each.
- [ ] Confirm contact email `medin@kasina.com` on the marketing site, privacy page and support docs.

**Exit:** a new reader can open `docs/` and get the same answer to "what is Kasina and what does it do today?" from every file.

---

## K1 — Online-first hardening

**Goal:** Works well on poor, intermittent connections without claiming to work offline.

- [ ] Re-scope the service worker and IndexedDB role: cache app shell, lesson and practice material; queue answers and tutor questions; flush on reconnect. Remove "offline-first" wording from UI and docs.
- [ ] **School-level caching** design and spike (what is cached at school or device level, how content versions sync).
- [ ] Queue visibility for users: "saved, will send when you're online" states.
- [ ] Adey conversation model: add `chat_id` so unrelated topics stop bleeding into the LLM context (known limitation in the architecture doc).
- [ ] Reinstate or decide on a daily tutor budget; keep per-minute rate limit.
- [ ] Park `apps/mobile` (Expo) and `apps/desktop` (Electron) formally; mark them "not on path" in the monorepo README.
- [ ] Device and network test: update the QA matrix with throttled 2G/3G profiles and real school Wi-Fi.

**Exit:** critical path (join → assignment → answer → results → teacher sees Done) completes on every row of the QA matrix, including throttled networks, with no data loss on dropped connections.

---

## K2 — Adey AI

**Goal:** A tutor Kasina controls, that is good in Amharic and follows the national curriculum.

- [ ] **Evaluation set:** real Grade 11–12 questions in Amharic across all pilot subjects, with expected explanations. Define pass criteria **before** running candidates.
- [ ] Compare the ~9B open candidate against alternatives; record cost per student, latency, and Amharic quality.
- [ ] **Curriculum grounding:** retrieve from national textbooks and the curriculum map so answers follow what students are taught.
- [ ] **Self-hosted production inference** on a VPS/GPU, replacing the demo laptop + tunnel. Keep the OpenAI-compatible interface so the model stays swappable (model-agnostic by design).
- [ ] Behaviour rules: always tell students they are talking to an AI; Adey supports the teacher and never replaces them; no automated decisions about students.
- [ ] Fallback behaviour when the model is slow or down (clear message plus queued question, not a silent downgrade).
- [ ] No training on student data without a clear, lawful basis (enforced in logging and retention config).

**Exit:** evaluation report meets the pre-set bar; production inference runs on Kasina infrastructure; hosting cost per month documented for the separate ops budget.

---

## K3 — Content expansion

**Goal:** Cover the pilot's subjects honestly, in dated phases. Today only **Grade 12 Mathematics** has a live question bank.

| Phase | Scope | Notes |
|-------|-------|-------|
| 1 | Grade 11 Mathematics | Closes the gap for a Grade 11–12 cohort |
| 2 | Highest-demand national-exam subjects (e.g. Physics, Chemistry, English) | Textbook assets already exist for several; question banks do not |
| 3 | Remaining Grade 11–12 subjects, deeper Amharic item coverage | Amharic `stemAm` / `explanationAm` today is a partial sample |

Per subject:
- [ ] Curriculum map (like `curriculum-map-grade12-math.md`) before writing items.
- [ ] Tagged by unit and topic; ≥10 items per assignable topic.
- [ ] Teacher or academic reviewer sign-off.
- [ ] Amharic review pass.

**Rule:** a subject is not offered to pilot classes until it passes the per-subject checklist. Budget line: content localization ≈ 31% of the pilot ask (ETB 1,000,000).

**Exit (per phase):** coverage published in [content-status.md](./content-status.md); external wording matches it exactly.

---

## K4 — Data protection & safeguarding

**Goal:** Ready to hold learning data from minors.

- [ ] **DPIA** completed and filed before any real student onboarding.
- [ ] Legal review of the Ethiopian personal data protection law and GDPR-principle alignment; no compliance claim in public materials until this is done.
- [ ] Hosting location chosen with data-transfer rules in mind; **processing agreements** with every hosting provider (Vercel, Cloudflare, Supabase, VPS).
- [ ] Reconcile the data policy with the product: the policy says students do not need email, the current student handout asks for email + password. Decide the student identity model (phone OTP vs email) and align both.
- [ ] Consent flow: school and guardian involvement for minors; plain-language notice for students.
- [ ] Retention periods implemented (24-month M&E retention, 90-day rejected signups, ≤30-day logs, 30-day deletion target) with a tested deletion procedure.
- [ ] Adey transparency and teacher-oversight documentation (education is a higher-risk area under the EU AI Act): record risks, testing and oversight measures.
- [ ] Safeguarding escalation path agreed with each partner school.

**Exit:** DPIA signed off, agreements in place, legal review complete, deletion drill passed.

---

## K5 — Pilot readiness

**Goal:** Schools, teachers and measurement are ready before students log in.

**Partnerships**
- [ ] Letters of support from the education offices of Kolfe Keranio, Nifas Silk-Lafto and Lemi Kura sub-cities.
- [ ] Pilot agreements with principals of the 6–8 pilot schools.
- [ ] Academic or teacher-training partner for curriculum and evaluation advice.
- [ ] Funding confirmed for the pilot (ETB 3,200,000 planning figure, re-check the USD rate at submission).

**Operations**
- [ ] School cascade run end to end on real pilot schools: public school request → Kasina approval → school admin rosters teachers → teachers activate → students activate.
- [ ] Teacher orientation delivered before each teacher's classes go live (assigning practice, reading weak-topic data, fitting into lesson plans). Budget: ≈ 19% (ETB 600,000).
- [ ] Student and school connectivity support plan (data bundles, school access). Budget: ≈ 19% (ETB 600,000).
- [ ] Support channel and printed materials ready; handouts and teacher guide updated for **Adey AI**, the current login flow and online-first behaviour.

**Measurement**
- [ ] Baseline: each school records student performance in pilot subjects and current exam pass rates.
- [ ] Comparison schools identified where possible.
- [ ] **Numeric targets set from baseline data and published before go-live.**
- [ ] Insert the official ESSLCE pass-rate figure and year (still a placeholder in the overview document).

**Exit:** go/no-go review with all four groups above complete.

---

## K6 — Pilot run (12–18 months)

**Goal:** Show whether Kasina works, not just report activity.

**Scale:** ~1,500–2,000 students, 6–8 schools.

| Wave | Where | Starts |
|------|-------|--------|
| 1 | Addis Ababa: Kolfe Keranio, Nifas Silk-Lafto, Lemi Kura | After K5 exit |
| 2 | Sebeta and Burayu | After wave 1 stabilises (criteria set in K5) |

**Checkpoints (quarterly):**
- Learning gains on curriculum-aligned assessments vs baseline and comparison schools.
- Student practice and progress; teacher use of weak-topic data; teacher feedback.
- Adey AI quality review on sampled conversations (with privacy controls) and incident log.
- Hosting and cost per student vs plan; budget burn against the ETB 3,200,000 lines (M&E ≈ 12.5%, community and print ≈ 6%, contingency ≈ 12.5%).
- ESSLCE results as **one supporting measure** among several.

**Rules:**
- Only critical blockers are fixed mid-pilot. Everything else goes to [post-mvp-backlog.md](./post-mvp-backlog.md).
- If a quarterly checkpoint fails its targets, write the decision and the top three fixes with owners and dates before adding features.

**Exit:** final evaluation report published; decision on K7.

---

## K7 — Post-pilot expansion

Only after K6 shows measurable gains.

- Grade 9–10 content, working toward full secondary coverage.
- More subjects and more schools; the school cascade is designed to keep central effort low (approving a school is the only step needing Kasina staff time).
- Amharic improvement through **fine-tuning on curriculum data** (with lawful basis confirmed).
- Stronger low-bandwidth support: school-level caching and content sync matured from K1.
- Revisit mobile only if pilot data shows web is the limiting factor. Connectivity should strengthen Kasina incrementally, never be a precondition.

---

## 3. Budget map (pilot delivery, ETB)

| Workstream | Milestones | ETB | Share |
|------------|------------|-----|-------|
| Content localization and curriculum alignment | K3 | 1,000,000 | 31.25% |
| Teacher training and orientation | K5 | 600,000 | 18.75% |
| Student and school connectivity | K5, K6 | 600,000 | 18.75% |
| Monitoring and evaluation | K5, K6 | 400,000 | 12.5% |
| Community engagement and printed materials | K5 | 200,000 | 6.25% |
| Contingency | all | 400,000 | 12.5% |
| **Total pilot delivery** | | **3,200,000** | **100%** |

**Separate, ongoing (not in the ask):** Vercel, Cloudflare Workers/Hyperdrive/R2, Supabase, Adey AI VPS/GPU, SMS OTP phone + SIM. Track monthly from K2 onward.

---

## 4. Risks to watch

| Risk | Milestone | Mitigation |
|------|-----------|------------|
| Amharic quality of the 9B model is not good enough | K2 | Pre-set evaluation bar; model-agnostic interface; alternative candidates; fine-tune later |
| Content for non-Math subjects slips and cohorts need it | K3, K5 | Dated workstreams; do not assign unreviewed subjects; say publicly what is live |
| School connectivity worse than assumed | K1, K5 | Queueing and caching; connectivity budget line; test on real school networks first |
| Compliance claims made before review | K4 | Legal review gates all public compliance wording |
| Self-hosted inference cost or reliability | K2, K6 | Monthly cost tracking; fallback behaviour; capacity test before wave 2 |
| Teacher adoption | K5, K6 | Orientation before go-live; teacher stays in control; weak-topic view that saves prep time |
| Funding delay | K5 | K0–K4 do not depend on the grant; K5 exit depends on it |

---

## 5. Docs that conflict with this path

Found while reading the current `docs/` set. Update or mark as superseded in K0.

| File | Conflict |
|------|----------|
| `architecture.md` | Offline-first/PWA described as the pilot story; "Melak" naming; Melak fallback is on-device rule engine; Section 8 title and Section 16 wording |
| `content-status.md` | Lists "Offline Android Melak app" as post-pilot; external wording should reflect secondary-school phrasing and the K3 phases |
| `data-and-child-protection.md` | Says school eligibility is "government schools" and students need no email; handouts require email. Needs Adey AI naming, DPIA and GDPR/EU AI Act alignment, hosting-agreement language |
| `mvp/README.md` | Says OTP and offline are deferred; code now ships OTP and offline sync. Header still describes the Melak/offline plan; says "Out of C0–C5" without noting the new path |
| `mvp/non-goals.md` | OTP, Melak, CBT, textbook reader are listed as non-goals but are built. Mark as historical |
| `mvp/deploy-kasina-et.md` and `mvp/production-db.md` | Apply only migration `002`; production needs `002`–`007`. Cloudflare Pages vs Vercel is not settled |
| `mvp/curriculum-map-grade12-math.md` | Math only; becomes a template for each K3 subject |
| `mvp/pilot-qa-matrix.md` | States "MVP requires network, no offline"; update with throttled-network rows and Adey checks |
| `mvp/pilot-student-handout.md` and `mvp/pilot-teacher-guide.md` | Email + password flow vs phone OTP and school cascade; add Adey AI |
| `mvp/post-mvp-backlog.md` | P1–P5 (OTP, offline SQLite, APK, Melak, CBT) are partly built or dropped; P2 and P3 should be removed or re-labelled "parked" |
| `README.md` (docs index) | Add a link to this file; note C0–C5 vs K0–K7 |

---

## 6. Open decisions

| # | Decision | Needed by |
|---|----------|-----------|
| 1 | Student identity model: phone OTP, email + password, or both | **Decided (sprint):** keep **both** — cascade phone OTP + `/join` email+password |
| 2 | Rename scope for `@kasina/melak-core` and API routes (alias vs rename) | K0 |
| 3 | Final model choice and hosting provider/location for Adey AI | K2 |
| 4 | Web hosting: stay on Vercel or move to Cloudflare Pages | K1 |
| 5 | Order of subjects after Grade 11 Math (based on pilot schools' needs) | K3 phase 2 |
| 6 | Wave 2 trigger criteria (Sebeta and Burayu) | K5 |
| 7 | Legal structure and registration status of the not-for-profit | K4 |
| 8 | Whether to keep the 3,200,000 pilot total or reallocate the removed hosting line | Before grant submission |

---

## 7. Definition of success for the path

The path works if, at the end of K6:

1. Pilot students show **learning gains** over baseline against comparison schools on curriculum-aligned assessments.
2. Teachers can say, unprompted, who needs help on which topic, and use that to change their next lesson.
3. Adey AI is used as a first point of help and teachers report it does not replace them.
4. No data-protection or safeguarding incident went unhandled.
5. Cost per student stayed within the planning range, with hosting tracked separately.
