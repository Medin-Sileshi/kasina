# Kasina (ካሲና) — Full Vision & Milestone Plan
## From Ministry Demo to National Education Infrastructure
*August 2026 — Living Document*

> **Status as of Aug 2026**
>
> **Live:** [kasina.et](https://kasina.et) · [api.kasina.et](https://api.kasina.et) — Grade 12 Math classroom loop (quiz, teacher dashboard, textbook reader, invite-code auth).
>
> **Vision M1 (Ministry demo, 11 Sep 2026):** Melak offline tutor (default), optional cloud AI, CBT exam mode, seeded demo class — see [status.md](./status.md).
>
> **Naming:** Vision milestones **M0–M6** (this doc) ≠ classroom build milestones **C0–C5** in [docs/mvp](../mvp/README.md) (already shipped).

---

## The End State (Year 5 Vision)

By 2031, Kasina is not an app. It is the operating system for Ethiopian secondary education.

Every one of Ethiopia's 5 million secondary school students has a Kasina profile. Every teacher in every Grade 7–12 school uses the analytics dashboard. The Ministry of Education runs its national examination performance monitoring through Kasina's data pipeline. The platform speaks six Ethiopian languages. It runs offline in schools with no electricity via solar-powered server kits. It has predicted — with 80%+ accuracy — the individual examination score of every student who sat the ESSLCE for the past two years.

And beneath all of it, Kasina has built the largest database of verified student financial behaviour in Ethiopia — the foundation on which Qobo's credit scoring engine is built.

This document maps every milestone between where we are today (MVP, August 2026) and that end state.

---

## Platform Architecture Overview

### Five Surfaces

```
1. Student Mobile App      ← React Native / Expo (Android + iOS)
   Daily driver. Offline-first. The product most students touch every day.

2. Student Web App         ← Next.js 15
   CBT simulator, textbook reader, Melak chat. School computer labs.

3. Teacher Web Dashboard   ← Next.js 15
   Class analytics, assignment management, student monitoring.

4. School Desktop App      ← Electron (wrapping web app)
   Deployed on school computers. Fully offline. Windows-first.

5. School Server           ← Raspberry Pi / Node.js local server
   Serves all content over local Wi-Fi in zero-connectivity schools.
   No internet required whatsoever.
```

### Three Portals

```
1. Student Portal           /app          → learning, practice, Melak
2. Teacher Portal           /teacher      → classes, analytics, assignments
3. Ministry / Admin Portal  /ministry     → national dashboard, policy insights
```

### Supported Platforms by Milestone

| Surface | M1 MVP | M2 Core | M3 Expand | M4 Intel | M5 Eco | M6 Full |
|---|---|---|---|---|---|---|
| Android app | Partial | ✓ | ✓ | ✓ | ✓ | ✓ |
| iOS app | — | — | ✓ | ✓ | ✓ | ✓ |
| Web app | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Desktop (Electron) | — | — | ✓ | ✓ | ✓ | ✓ |
| School server | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| Progressive Web App | — | — | — | ✓ | ✓ | ✓ |

---

## Milestone Map

```
M0  Foundation          Aug 2026       Monorepo, schema, auth, API skeleton
M1  Ministry MVP        Sep 2026       Demo-ready product, Grade 12 Maths, 3 schools
M2  Core Product        Dec 2026       All Grade 12 subjects, mobile app, school pilot
M3  Platform            Apr 2027       Grades 7–12, all subjects, 3 languages, 50 schools
M4  Intelligence        Oct 2027       Adaptive AI, exam prediction, teacher AI assistant
M5  Ecosystem           Apr 2028       Tutoring, scholarships, university guidance, API
M6  National Scale      2029           500+ schools, Ministry integration, Qobo bridge
```

---

## M0 — Foundation
### August 2026 | Status: In Progress

The scaffolding. No user-facing features yet. Everything built here is built once and never rebuilt.

### Goals
- Monorepo running cleanly with all apps and packages wired
- Database schema finalised and deployed in Supabase
- Authentication working end-to-end (phone OTP via Africa's Talking)
- Core API routes returning real data
- Design system implemented in Tailwind

### Technical Deliverables
- `packages/types` — all shared TypeScript interfaces
- `packages/db/schema.sql` — complete PostgreSQL schema
- `packages/question-bank` — JSON import pipeline working
- `apps/server` — Hono on Cloudflare Workers, all routes stubbed
- `apps/web` — Next.js 15, all pages stubbed, Tailwind + design tokens
- `apps/mobile` — Expo SDK 52, Expo Router, offline SQLite wired
- Auth: POST /auth/otp/send + /verify + JWT middleware
- Supabase: all tables, indexes, and views from schema
- Cloudflare Workers: dev environment + wrangler.toml

### Definition of Done
Every app boots. The API returns real data from the database. A test user can sign up via OTP.

---

## M1 — Ministry MVP
### September 11, 2026 | Hard Deadline

The product that gets shown to the Ethiopian Ministry of Education and school officials at the start of the 2019 Ethiopian Calendar school year. Must be polished, functional, and demonstrable in a 20-minute meeting.

### Goals
- Full onboarding flow working (phone OTP → profile → home)
- Grade 12 Mathematics: 150 validated questions, all chapters
- Complete quiz flow: question → answer → reveal → results → review
- CBT simulator working with real Mathematics questions and KaTeX
- Melak AI answering questions in Amharic (Claude API)
- Teacher dashboard showing class analytics for demo class (42 students)
- All known bugs from design review fixed
- Deployed to production (Vercel + Cloudflare Workers)

### Content Requirements
| Subject | Grade | Questions | Languages |
|---|---|---|---|
| Mathematics | 12 | 150 | English + Amharic |

### Screen Checklist
- [x] Welcome / onboarding (4 steps)
- [x] Home screen
- [ ] Subject screen
- [ ] Quiz screen (question + answer + reveal)
- [ ] Results screen
- [ ] Review screen (wrong answers)
- [x] Melak AI chat
- [x] CBT simulator (wire to real data + fix KaTeX)
- [x] Study plan
- [x] Settings / profile
- [x] Teacher dashboard (wire to real API)

### Business Milestones
- Ministry of Education formal meeting booked
- 3 Addis Ababa pilot schools identified by name
- MoE proposal delivered and under review
- NEAEA data access request filed
- First school administrator account created

### Team at M1
- Medin (CEO, product, relationships)
- Lead Developer (hired month 1)

---

## M2 — Core Product
### December 2026

The product that the pilot schools actually use every day. Expanded to all Grade 12 subjects, a working mobile app, and the school server for offline deployment.

### Goals
- All Grade 12 subjects live (both Natural Science and Social Science streams)
- Grade 10 subjects live (EGSLCE preparation)
- Mobile app (Android) in Google Play Store
- School server deployed in all 3 pilot schools
- Real student data from pilot informing product decisions
- Textbook library for Grade 11–12 embedded and linked to questions
- Freemium paywall live (Telebirr integration)

### Content Requirements
| Subject | Grade | Questions | Languages |
|---|---|---|---|
| Mathematics | 10, 12 | 300 | EN + AM |
| Physics | 10, 11, 12 | 200 | EN + AM |
| Chemistry | 10, 11, 12 | 200 | EN + AM |
| Biology | 10, 11, 12 | 180 | EN + AM |
| English | 10, 12 | 200 | EN |
| History | 10, 11, 12 | 160 | EN + AM |
| Geography | 10, 11, 12 | 160 | EN + AM |
| Economics | 11, 12 | 160 | EN + AM |
| Civics & Ethics | 10, 12 | 120 | EN + AM |
| **Total** | | **~1,680** | |

### New Features
**Student:**
- Full subject selection (all subjects for their grade/stream)
- Grade 10 content and EGSLCE simulator
- Textbook reader (Grade 11–12): embedded PDF viewer linked to questions
- "Read in textbook" from any wrong answer
- Bookmarks and personal notes on questions
- Offline mode: full quiz flow works with no internet
- Daily reminder notifications (Android push)
- Session history (last 20 sessions visible)

**Teacher:**
- Assignment creation: choose subject, unit, question count, deadline
- Assignment submission tracking (who completed, average score)
- Student detail page: full history, weak topics, predicted trajectory
- Class join via code (students join teacher's class)
- Batch export: class performance report as PDF

**Admin (School Level) — NEW:**
- School profile page (name, region, teacher count, student count)
- School code generation for student enrollment
- Teacher account management
- School-wide performance overview

**School Server:**
- Raspberry Pi image: insert SD card, power on — fully operational
- Serves all content (questions, textbooks, AI cached responses) over local Wi-Fi
- Students connect via school Wi-Fi, no internet needed
- Syncs to cloud when administrator connects USB internet dongle
- Admin panel: see all student activity from school Wi-Fi

**Platform:**
- Android app published on Google Play
- Telebirr payment integration (Premium: 200 ETB/month, 1,500 ETB/year)
- School bulk subscription (Ministry or NGO pays for a school license)

### Technical Additions
- `expo-notifications` for push notifications (Android)
- `react-native-pdf` for in-app PDF textbook viewer
- Telebirr merchant API integration (apply for access in Month 1)
- Background sync: SQLite → Supabase when online
- Service Worker (web): cache questions and textbooks for offline access
- School server: Node.js + SQLite, Raspberry Pi 4 OS image

### Business Milestones
- 3 pilot schools fully deployed and using Kasina daily
- First paying student subscriptions (target: 200 students at 200 ETB/month)
- MoE pilot MOU signed (not just under review)
- NGO grant application filed (UNICEF, World Bank)
- First school licensing agreement (MoE funds one school)
- Pilot outcome data: 3 months of real student engagement

### Team at M2
- Medin (CEO)
- Lead Developer
- Junior Developer (joining M1)
- Field Operations Manager (Sidama/Addis)
- 3 Subject Matter Experts (part-time)

---

## M3 — Platform Expansion
### April 2027

Kasina becomes a complete Grades 7–12 platform covering all subjects, all levels, and three Ethiopian languages. Scale from 3 schools to 50.

### Goals
- Grades 7–12 content complete across all subjects
- Afaan Oromo language: Melak + question explanations
- Tigrinya language: Melak + question explanations
- iOS app in App Store
- Desktop app (Electron + Windows installer) for school computer labs
- 50 schools in pilot programme (Addis Ababa + 2 regional cities)
- Adaptive study plan algorithm running for all users
- Predicted exam score visible for every Grade 12 student

### Content Requirements (additions to M2)
| Subject | Grade | Questions Added | Notes |
|---|---|---|---|
| All subjects | 7, 8, 9 | ~600 | Junior secondary complete |
| Mathematics | 11 | 120 | Gap from M2 |
| All subjects | 11 | ~400 | Preparatory year 1 |
| All textbooks | 7–10 | — | Remaining grades digitised |
| **Additional total** | | **~1,120** | **Cumulative: ~2,800** |

### New Features
**Student:**
- Adaptive study plan: AI-generated weekly plan based on performance history
  - Identifies 3 weak topics per week from past sessions
  - Assigns targeted practice per day with time estimates
  - Updates every Sunday evening automatically
- Predicted exam score: `predicted_score = Σ(topic_accuracy × exam_weight)`
  - Shown on home screen: "On track for approximately 410/600 on ESSLCE"
  - Updates after every practice session
  - Powered by 6+ months of per-topic accuracy data
- Study streaks: daily streak, weekly streak, monthly record
- Leaderboard (opt-in): top students in your school by weekly questions answered
- Study groups: create a private group with classmates, shared practice sessions
- Audio explanations (Amharic): tap any explanation to hear it read aloud
  - Uses TTS via Ethio Telecom partnership (or on-device TTS)
- Note-taking: highlight textbook sections, add personal notes, exportable

**Teacher:**
- AI lesson planner: based on class heatmap, Kasina suggests this week's lesson focus
  - "Your class is weakest in Derivatives. Suggested lesson: Power Rule applications."
  - Provides a structured 45-minute lesson outline
- Question bank browser: teacher can hand-pick questions for assignments
- Rubric builder: teacher defines criteria for open-ended questions (future)
- Parent report: one-tap PDF report per student formatted for parent communication
- Teacher-to-student messaging (in-app announcements)

**Admin (School Level):**
- Multi-class management (create Grade 10A, 10B, 11 Natural Science, etc.)
- Year-over-year school performance trends
- Exam prediction for the school ("Predicted school pass rate: 61%")
- Teacher activity monitoring (last login, assignments created)
- Resource utilisation (which subjects students use most)

**Ministry Dashboard — NEW (read-only access for pilot):**
- National map: school pins coloured by average performance
- Regional breakdown: Addis Ababa, Oromia, SNNPR, Amhara, Tigray performance
- Subject heatmap: which subjects are failing most at national level
- Week-over-week engagement trends across all pilot schools
- Download national performance report (CSV/PDF)

**Platform:**
- iOS app published on Apple App Store
- Desktop app: `kasina-setup.exe` (Windows) + `.dmg` (Mac)
  - Bundled content: full question bank + textbooks pre-loaded (3.5GB)
  - School admin installs once; students log in with their accounts
- Progressive Web App (PWA): students can "install" the web app from a browser

**Infrastructure:**
- CDN: Cloudflare R2 for textbook PDFs and audio files
- Regional edge caching: questions and textbooks cached at Cloudflare edge nodes closest to Ethiopia
- Background content updates: new questions automatically pushed to devices overnight
- Delta sync: only download new content (not full re-download)

### Language Expansion
| Language | Melak explanations | Question translations | UI |
|---|---|---|---|
| English | M1 | M1 | M1 |
| Amharic (አማርኛ) | M1 | M2 | M2 |
| Afaan Oromo | M3 | M3 | M3 |
| Tigrinya (ትግርኛ) | M3 | M3 | M4 |
| Somali (Af-Soomaali) | M5 | M5 | M5 |
| Sidama | M5 | — | — |

### Business Milestones
- 50 schools enrolled (MoE pilot expanded)
- 2,000+ active paying students (freemium conversion)
- First NGO grant received (UNICEF or World Bank: $80,000–150,000)
- MoE national licensing agreement signed ($50,000+/year)
- Pilot outcome report published: pre/post mock exam score comparison
- Seed round raised: $300,000 (TLcom, Verod-Kepple, Renew Capital, or similar)
- First staff hires from seed funding

### Team at M3
- Medin (CEO)
- Lead Developer
- Junior Developer ×2
- Curriculum Director (full-time, ex-MoE)
- Field Operations Manager (Addis + Regional)
- Subject Matter Experts ×4 (part-time)
- Compliance & Data Analyst
- Business Development Manager (school and NGO relationships)

---

## M4 — Intelligence Layer
### October 2027

Kasina stops being a question bank with an AI and becomes a genuinely intelligent learning system. The platform now understands each student's learning trajectory well enough to predict outcomes and personalise at scale.

### Goals
- AI generates new practice questions (never seen before, validated)
- Predicted exam scores accurate to ±8 percentage points for Grade 12 students
- Teacher AI assistant can draft lesson plans and assessments from a prompt
- Ministry dashboard receives weekly automated performance briefs
- 150+ schools in active use

### New Features

**Intelligent Question Generation:**
Melak can now generate entirely new practice questions for any topic, at any difficulty level, that have never appeared in past exams. Generated questions are:
- Validated against the national curriculum by subject experts before release
- Flagged as "AI-generated" vs. "past exam question"
- Used to expand the question bank beyond the finite set of past exam papers
- Infinitely scalable: a student who has answered every past Mathematics question now has an endless fresh supply

**Predictive Exam Score Engine:**
```
Inputs:
  - Per-topic accuracy over last 3 months (weighted recent sessions more)
  - Per-topic frequency in past ESSLCE exams (from historical data)
  - Time remaining until next ESSLCE sitting
  - Engagement rate (how consistently student practices)
  - Peer comparison (where student sits relative to their school cohort)

Output:
  - Predicted ESSLCE total score (out of 600)
  - Per-subject predicted score
  - Confidence interval
  - "To reach [target score], focus on: [top 3 topics]"

Accuracy target: ±8 percentage points on 70% of predictions
```

**Teacher AI Assistant (Melak for Teachers):**
Teachers can now ask Melak to help them teach, not just students ask Melak to help them learn.

- "Melak, my class is failing Derivatives. Give me a 45-minute lesson plan."
  → Structured lesson outline with worked examples and class activities
- "Melak, create 10 practice questions on Kinematics at medium difficulty."
  → 10 validated questions, ready to assign as homework
- "Melak, write a progress report for student Abebe Bikila."
  → Draft report card narrative based on Abebe's actual data
- "Melak, what should I cover this week to improve Section 12A's predicted pass rate?"
  → Data-driven recommendation from class heatmap

**National Learning Map (Ministry):**
A real-time visualisation of where Ethiopian students are failing, at topic level, across every connected school.

- Topic-level failure rates by region (which regions struggle with which topics)
- Curriculum gap analysis (topics that consistently fail across all regions → curriculum issue)
- Exam paper difficulty forecasting (based on student performance on individual questions)
- Teacher effectiveness signal (schools with similar demographics but different outcomes)
- Year-over-year topic trend (is performance on Derivatives improving nationally?)

**Automated Performance Briefs:**
Every Monday, the Ministry portal receives:
- A 1-page automated PDF: national engagement stats, top 5 failing topics, most improved schools
- A data export (CSV) for further analysis
- An anomaly alert: "Organic Chemistry failure rate increased 12% this week in Oromia"

**Deep Analytics Upgrade:**
- Heatmap at question level (not just topic): which individual questions most students fail
- Answer pattern analysis: "78% of students who get this wrong choose option C — likely misconception X"
- Time analysis: how long students spend per question (identifies rushed vs. stuck patterns)
- Session quality score: tracks whether students are genuinely engaging or clicking through

### Technical Additions
- Fine-tuning pipeline: Anthropic API with Ethiopian curriculum context
- Question validation workflow: AI generates → subject expert reviews → publishes
- Prediction model: simple regression trained on pilot school data (not complex ML yet)
- Automated report generation: cron job every Monday, email PDF to Ministry contacts
- Analytics event pipeline: every student action logged to Supabase analytics schema
- Question-level analytics: separate `question_analytics` table tracking per-question stats

### Business Milestones
- 150+ schools in active use
- 10,000+ monthly active students
- MoE contract renewed and expanded (national rollout begins)
- Second NGO grant cycle (outcome data justifies renewal)
- Series A preparation begins
- First international EdTech conference presentation (BETT Africa, WISE)
- Academic paper co-authored with Addis Ababa University education faculty

### Team at M4
Add to M3 team:
- Data Scientist / ML Engineer (prediction model, analytics pipeline)
- Second Curriculum Director (content quality + AI question validation)
- School Success Manager (onboarding and retention for 150+ schools)
- Marketing & Communications Manager

---

## M5 — Ecosystem Integration
### April 2028

Kasina expands beyond exam preparation into a complete learning ecosystem — tutoring, scholarships, university guidance, and an open API.

### Goals
- Live peer and professional tutoring available inside the app
- Scholarship matching: connect top-performing students to opportunities
- University and career guidance integrated
- Kasina API: allow approved third-party content providers to publish to the platform
- 300+ schools, 50,000+ monthly active students
- Somali and Sidama language support
- TVET (Technical and Vocational Education) pilot

### New Features

**Live Tutoring Marketplace:**
Students who need more than AI can connect with human tutors.

- Peer tutors: top-performing students (verified by Kasina score) offer sessions to peers
  - Schedule 30 or 60-minute sessions via in-app calendar
  - Video call embedded (Jitsi or Daily.co SDK, no third-party app needed)
  - Payment: Telebirr (tutor earns 150–300 ETB per session, Kasina takes 20%)
- Professional tutors: verified teachers listed as available for private sessions
  - Kasina verifies credentials (teaching licence, subject expertise)
  - Profile shows: subjects, price, average student rating, session count
- Subject matching: student asks for help with "Derivatives" → Kasina shows available tutors for that exact topic

**Scholarship Engine:**
- Partner database: Ethiopian scholarship opportunities from government, NGOs, diaspora foundations, international organisations
- Eligibility matching: student's grade, scores, region, gender, subject stream matched to scholarship criteria
- Application assistant: Melak helps write scholarship application essays
- Notification: "You may be eligible for the ABC Foundation Engineering Scholarship. Deadline: March 15."
- Application tracker: track submitted applications and deadlines

**University & Career Guidance:**
- Ethiopian university database: all public universities, entry score requirements per faculty
- "What can I study with my predicted score?": personalised recommendation
- Career pathway explorer: subject stream → possible careers → required degrees → university options
- Ethiopian diaspora mentorship matching (opt-in): students matched with Ethiopian professionals abroad
- Gap year and TVET alternatives for students who do not reach university cutoff

**Kasina Open API (Beta):**
Approved third-party publishers can submit content to appear on the platform:
- Educational publishers: submit textbook supplements, practice sets
- NGOs: submit curated content for specific programmes
- Content revenue sharing: publishers earn per student who engages with their content
- API documentation at developers.kasina.et
- Content review: all third-party content reviewed by Kasina editorial team before publishing

**TVET Pilot:**
Partner with TVET institutions to create Kasina modules for technical and vocational streams:
- Automotive Technology, Construction, IT, Hospitality
- Same question bank + AI tutor model, different curriculum
- Pilot with 5 TVET institutions

### Business Milestones
- Series A raised: $2M–3M
- 300+ schools, 50,000+ monthly active students
- Revenue: $500,000+ ARR
- Tutoring marketplace: first 100 certified tutors, 500+ sessions completed
- Kasina API: 5 approved third-party content partners
- First TVET pilot school live
- Government recognition as official EdTech partner
- International interest: Eritrea, South Sudan, Djibouti education ministries in conversation

### Team at M5
Add to M4 team:
- CTO (upgrade from Lead Developer or external hire)
- Head of Partnerships (tutoring marketplace, API, NGO)
- Community Manager (study groups, peer learning)
- Finance Manager
- Legal Counsel (contracts, API terms, scholarship partnerships)

---

## M6 — National Infrastructure & Qobo Bridge
### 2029

Kasina is national infrastructure. The Ministry of Education's digital backbone for secondary education. And beneath the platform, 3+ years of student financial behavioural data is ready to power Qobo's credit scoring engine.

### Goals
- 500+ schools in active use nationwide
- Every region of Ethiopia represented
- National examination outcome prediction with demonstrated accuracy
- First direct integration with NEAEA examination data pipeline
- Ministry white-label option: "Powered by Kasina"
- Qobo data bridge: first B2B data sale to Ethiopian microfinance institution

### New Features

**NEAEA Integration:**
- Direct API connection to National Educational Assessment and Examination Agency
- Kasina receives real ESSLCE question papers 48 hours after each examination sitting
- Kasina performance predictions cross-validated against actual results each year
- NEAEA receives Kasina engagement data as input for curriculum quality review
- Joint publication: Kasina + NEAEA annual learning outcomes report

**School Server Generation 2:**
- Solar-powered server kit: Raspberry Pi + 20W solar panel + battery pack
  - Deploys in schools with no electricity
  - Runs 16+ hours per day on a full charge
  - Pre-loaded with full content library (12GB SD card)
  - 50-device simultaneous connection via Wi-Fi hotspot
- Partner: Ethiopian solar tech companies for production + distribution
- Ministry distribution: school server kits included in government school equipment allocations

**Ministry White-Label:**
Regional Education Bureaus can brand the platform under their own name:
- Custom app name and logo (e.g., "Oromia Learning" for Oromia Regional Education Bureau)
- All content and AI remain Kasina; only surface branding changes
- Analytics remain in Kasina national dashboard with regional access controls
- License fee: regional bureau pays per-school or per-student annual fee

**National Curriculum Integration:**
- Kasina content review incorporated into MoE curriculum revision cycle
- Known textbook errors (documented by Kasina subject experts) formally reported to Ministry
- Kasina question bank used by NEAEA as one input to new examination paper design
- Kasina data informs national curriculum resource allocation ("Grade 10 Chemistry failing nationally → curriculum intervention needed")

**Qobo Data Bridge:**

This is the most strategically important milestone in the entire roadmap.

By the end of 2028/2029, Kasina will have built:
- 500,000+ verified student profiles (name, Kebele, school, grade, stream)
- 3+ years of engagement history per student (session frequency, performance trajectory)
- Financial behaviour proxy data:
  - Subscription payment history (who pays consistently, who churns)
  - Premium feature usage patterns
  - Scholarship application engagement (signals financial need + ambition)
  - Family payment behaviour (parent subscriptions, sibling accounts)
- Academic achievement data:
  - ESSLCE actual score (for students who gave permission to share results)
  - Performance trajectory over 2–3 years of practice
  - Subject mastery levels at graduation

This dataset represents the most comprehensive educational financial behaviour profile for Ethiopian youth ever assembled. It is the foundation of Qobo's AI credit scoring for the next generation of Ethiopian borrowers.

**First Qobo Integration:**
- Pilot B2B data sale to 1–2 Ethiopian Microfinance Institutions (MFIs)
- Product: "Kasina Student Credit Score" — a creditworthiness signal for 18–25 year olds
  - Inputs: subscription payment history, academic trajectory, scholarship engagement
  - Output: score from 0–100 indicating credit reliability for small education loans
- Use case: MFI offers micro-loans to university students (tuition, laptop, housing)
- Legal framework: explicit student consent, FDRE data protection compliance
- Revenue: per-score API fee charged to MFI

### Business Milestones
- 500+ schools
- 100,000+ monthly active students
- Revenue: $1.5M+ ARR
- Qobo credit scoring pilot: first B2B agreement signed
- Series B preparation begins
- International expansion: first school outside Ethiopia (Eritrea or South Sudan)
- Academic recognition: first peer-reviewed paper on Kasina's impact on ESSLCE pass rates

---

## Full Feature Matrix

### Student Features

| Feature | M1 | M2 | M3 | M4 | M5 | M6 |
|---|---|---|---|---|---|---|
| Phone OTP signup | ✓ | | | | | |
| Grade + stream profile | ✓ | | | | | |
| Home screen with countdown | ✓ | | | | | |
| Practice quiz (Mathematics) | ✓ | | | | | |
| Answer reveal + explanation | ✓ | | | | | |
| Results screen | ✓ | | | | | |
| Review wrong answers | ✓ | | | | | |
| CBT simulator | ✓ | | | | | |
| Melak AI (English + Amharic) | ✓ | | | | | |
| All Grade 12 subjects | | ✓ | | | | |
| Grade 10 subjects (EGSLCE) | | ✓ | | | | |
| Textbook reader (Gr 11–12) | | ✓ | | | | |
| Textbook ↔ question linking | | ✓ | | | | |
| Offline mode (full) | | ✓ | | | | |
| Push notifications | | ✓ | | | | |
| Bookmarks | | ✓ | | | | |
| Session history | | ✓ | | | | |
| Freemium paywall (Telebirr) | | ✓ | | | | |
| All grades (7–12) | | | ✓ | | | |
| All subjects complete | | | ✓ | | | |
| Textbook reader (all grades) | | | ✓ | | | |
| Afaan Oromo language | | | ✓ | | | |
| Tigrinya language | | | ✓ | | | |
| Adaptive study plan | | | ✓ | | | |
| Predicted exam score | | | ✓ | | | |
| Study streaks + leaderboard | | | ✓ | | | |
| Study groups | | | ✓ | | | |
| Audio explanations (TTS) | | | ✓ | | | |
| AI-generated questions | | | | ✓ | | |
| Accurate score prediction | | | | ✓ | | |
| Live tutoring (peer) | | | | | ✓ | |
| Live tutoring (professional) | | | | | ✓ | |
| Scholarship matching | | | | | ✓ | |
| University guidance | | | | | ✓ | |
| Somali + Sidama language | | | | | ✓ | |
| TVET content | | | | | ✓ | |
| NEAEA result integration | | | | | | ✓ |
| Qobo credit score profile | | | | | | ✓ |

### Teacher Features

| Feature | M1 | M2 | M3 | M4 | M5 | M6 |
|---|---|---|---|---|---|---|
| Class creation | ✓ | | | | | |
| Student enrollment (code) | ✓ | | | | | |
| Class performance dashboard | ✓ | | | | | |
| Topic heatmap | ✓ | | | | | |
| At-risk student alerts | ✓ | | | | | |
| Recent session table | ✓ | | | | | |
| Assignment creation | | ✓ | | | | |
| Assignment tracking | | ✓ | | | | |
| Student detail page | | ✓ | | | | |
| Parent report (PDF) | | ✓ | | | | |
| AI lesson planner | | | | ✓ | | |
| AI question generator | | | | ✓ | | |
| AI progress report writer | | | | ✓ | | |
| Teacher-to-student messaging | | | ✓ | | | |
| Multi-class management | | | ✓ | | | |

### Ministry / Admin Features

| Feature | M1 | M2 | M3 | M4 | M5 | M6 |
|---|---|---|---|---|---|---|
| School management | | ✓ | | | | |
| Teacher management | | ✓ | | | | |
| Pilot school overview | ✓ | | | | | |
| Regional performance map | | | ✓ | | | |
| National subject heatmap | | | ✓ | | | |
| Automated weekly report | | | | ✓ | | |
| Anomaly alerts | | | | ✓ | | |
| NEAEA data pipeline | | | | | | ✓ |
| White-label regional option | | | | | | ✓ |
| Curriculum gap analysis | | | | ✓ | | |

---

## Content Roadmap

### Question Bank Growth

| Milestone | Questions Added | Cumulative | Languages |
|---|---|---|---|
| M1 (Sep 2026) | 150 | 150 | EN + AM |
| M2 (Dec 2026) | 1,530 | 1,680 | EN + AM |
| M3 (Apr 2027) | 1,120 | 2,800 | EN + AM + OR |
| M4 (Oct 2027) | 800 | 3,600 | + TI |
| M5 (Apr 2028) | 600 + AI-gen | 4,200+ | + SO |
| M6 (2029) | Ongoing AI-gen | 6,000+ | All languages |

### Textbook Digitisation Schedule

| Grade Range | Milestone | Subjects |
|---|---|---|
| Grade 11–12 | M2 | All (Natural Science + Social Science) |
| Grade 9–10 | M3 | All |
| Grade 7–8 | M3 | All |

---

## Revenue Model by Milestone

| Stream | M1 | M2 | M3 | M4 | M5 | M6 |
|---|---|---|---|---|---|---|
| MoE B2G licensing | — | $50K | $150K | $300K | $500K | $800K |
| NGO / development grants | — | $30K | $120K | $200K | $300K | $400K |
| Student premium (Telebirr) | — | $5K | $40K | $120K | $300K | $600K |
| School direct licensing | — | — | $20K | $60K | $120K | $200K |
| Tutoring marketplace (20% fee) | — | — | — | — | $80K | $200K |
| Third-party API / content | — | — | — | — | $30K | $100K |
| Qobo data licensing | — | — | — | — | — | $150K |
| **Total ARR** | **—** | **$85K** | **$330K** | **$680K** | **$1.33M** | **$2.45M** |

---

## Team Growth Plan

| Role | M1 | M2 | M3 | M4 | M5 | M6 |
|---|---|---|---|---|---|---|
| CEO (Medin) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Lead Developer | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Junior Developer | | ✓ | ✓×2 | ✓×3 | ✓×4 | ✓×5 |
| Curriculum Director | | | ✓ | ✓×2 | ✓×2 | ✓×2 |
| Subject Matter Experts | | ✓×3 | ✓×4 | ✓×5 | ✓×6 | ✓×8 |
| Field Ops Manager | ✓ | ✓ | ✓×2 | ✓×3 | ✓×4 | ✓×5 |
| Compliance / Data Analyst | | | ✓ | ✓ | ✓ | ✓ |
| Business Development | | | ✓ | ✓ | ✓×2 | ✓×2 |
| Data Scientist | | | | ✓ | ✓ | ✓×2 |
| School Success Manager | | | ✓ | ✓×2 | ✓×3 | ✓×5 |
| CTO (upgrade) | | | | ✓ | ✓ | ✓ |
| Head of Partnerships | | | | | ✓ | ✓ |
| Finance Manager | | | | | ✓ | ✓ |
| Legal Counsel | | | | | ✓ | ✓ |
| **Total headcount** | **3** | **7** | **14** | **22** | **32** | **42** |

---

## Technology Roadmap

### Infrastructure Evolution

| Layer | M1–M2 | M3–M4 | M5–M6 |
|---|---|---|---|
| Backend | Hono / Cloudflare Workers | + dedicated Worker routes per feature | Multi-region Workers |
| Database | Supabase (single region) | Supabase (replicas) | Supabase (multi-region) |
| Storage | Cloudflare R2 | R2 + CDN edge caching | R2 + regional mirrors |
| AI | Claude API (standard) | Claude API + cached fine-tuned context | Fine-tuned Kasina model |
| Mobile | Expo Go (dev) → EAS build | EAS build + OTA updates | Full native where needed |
| Offline | SQLite + manual sync | SQLite + background sync + delta updates | Full offline-first with conflict resolution |
| Analytics | Supabase queries | Dedicated analytics schema + materialized views | ClickHouse or BigQuery |
| School server | Raspberry Pi 4 + WiFi router | Gen 2 (solar + improved hardware) | Ministry-distributed kits |

### AI Evolution

| Capability | M1 | M2 | M3 | M4 | M5 | M6 |
|---|---|---|---|---|---|---|
| Melak: answer questions | ✓ | | | | | |
| Melak: Amharic responses | ✓ | | | | | |
| Melak: offline cached responses | | ✓ | | | | |
| Melak: Afaan Oromo | | | ✓ | | | |
| Adaptive study plan (rule-based) | | | ✓ | | | |
| Exam score prediction (regression) | | | ✓ | | | |
| AI question generation | | | | ✓ | | |
| Teacher AI assistant | | | | ✓ | | |
| Accurate prediction (±8 pts) | | | | ✓ | | |
| Fine-tuned Kasina model | | | | | ✓ | |
| Curriculum gap AI analysis | | | | | ✓ | |
| Qobo credit scoring integration | | | | | | ✓ |

---

## Risk Register

| Risk | Probability | Impact | Milestone affected | Mitigation |
|---|---|---|---|---|
| MoE partnership delays | Medium | High | M2, M3 | Build direct-to-student freemium as independent revenue; don't depend on MoE for survival |
| Key developer leaves | Medium | High | All | Document all architecture; cross-train; competitive salary + equity |
| Telebirr API approval slow | High | Medium | M2 | Apply in Month 1; manual bank transfer as fallback; CBE Birr alternative |
| Content quality issues | Medium | Medium | M2+ | Subject expert review for every question; student error reporting feature |
| Internet reliability in schools | High | Medium | M2 | School server is the primary mitigation; offline-first is non-negotiable |
| Competing government system | Low | High | M3+ | ECTA/ECTMS is coffee traceability (Origo); MoE EdTech has no competing platform in development |
| AI costs exceed revenue | Medium | Medium | M2–M3 | Aggressive offline caching; Melak rate limits on free tier; 20 questions/day free cap |
| Android device fragmentation | Medium | Low | M2 | Test on Android 8.0+ (covers 95%+ of Ethiopian market); progressive enhancement |
| Data privacy regulatory risk | Low | High | M4+ | FDRE data protection compliance from day 1; no individual student data sold without consent |

---

## The Bridge to Qobo

By the end of M6 (2029), Kasina will have accumulated the following data on Ethiopian youth:

**Volume:**
- 500,000+ verified student profiles (name, Kebele, school, grade)
- 3+ years of engagement data per student
- 50M+ practice session data points
- 500,000+ subscription payment records (Telebirr transaction history)

**What this enables for Qobo (Phase 3):**
1. **Youth credit scores:** A student's subscription payment consistency, academic trajectory, and scholarship engagement are strong proxies for financial reliability — for a demographic that banks have never been able to score before.
2. **Education loan underwriting:** Micro-loans for university tuition, laptops, and housing. Kasina data tells Qobo who is likely to repay.
3. **Parental financial profiles:** Parents paying for school subscriptions have demonstrated digital payment capability and financial discipline — valuable for Qobo's remittance and savings products.
4. **Diaspora connection:** Students with family abroad (a proxy signal in the data) are Qobo's remittance product's first customers.

**The Qobo investor pitch made possible by Kasina:**
> *"We have 500,000 verified profiles of Ethiopian youth, with 3 years of financial behaviour data. We are not building a credit scoring model from scratch. We are deploying it on top of the largest verified dataset of Ethiopian young adults ever assembled."*

---

## Milestone Summary

| Milestone | Date | Schools | Students (MAU) | Revenue (ARR) | Headcount |
|---|---|---|---|---|---|
| M0 Foundation | Aug 2026 | — | — | — | 2 |
| M1 Ministry MVP | Sep 2026 | 3 | 200 | — | 3 |
| M2 Core Product | Dec 2026 | 10 | 1,000 | $85K | 7 |
| M3 Platform Expansion | Apr 2027 | 50 | 8,000 | $330K | 14 |
| M4 Intelligence Layer | Oct 2027 | 150 | 25,000 | $680K | 22 |
| M5 Ecosystem | Apr 2028 | 300 | 50,000 | $1.33M | 32 |
| M6 National Scale | 2029 | 500+ | 100,000+ | $2.45M | 42 |

---

*KASINA (ካሲና) EdTech Solutions · Full Vision Document · August 2026*
*This is a living document. Updated at the completion of each milestone.*
