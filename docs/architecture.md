# Kasina architecture overview

Ethiopian secondary-school EdTech: practice quizzes, teacher assignments, offline-first **Melak** tutoring, and CBT exam-style sessions — designed to work when connectivity is weak or absent.

**Live:** [kasina.et](https://kasina.et) (web) · [api.kasina.et](https://api.kasina.et) (API)

---

## System topology

```
┌─────────────────┐   sync when online    ┌──────────────────────┐
│  apps/web (PWA) │ ────────────────────► │  apps/server (Hono)  │
│  Next.js 16     │                       │  Cloudflare Workers  │
│  kasina.et      │                       │  api.kasina.et       │
└────────┬────────┘                       └──────────┬───────────┘
         │                                           │
         │  IndexedDB (QB, sessions, queue)          │ Better Auth (phone OTP)
         │  @kasina/melak-core (on-device)            │ Supabase Postgres
         │  Service worker (app shell)               │ R2 textbooks
         ▼                                           │
   Offline play + Melak                              ├── SMS gateway (device SIM)
                                                     └── Melak VPS LLM (optional enhance)
```

| Surface | Stack | Host / notes |
|---------|--------|--------------|
| Web (pilot offline) | Next.js PWA + SW + IndexedDB | `kasina.et` — **this** is the pilot offline delivery path |
| API | Hono on Workers | `api.kasina.et` |
| DB | Postgres | Supabase (+ Hyperdrive) |
| Textbooks | Markdown in R2 | `kasina-textbooks` |
| Melak on-device | `@kasina/melak-core` | Always available; default path |
| Melak enhanced | Self-hosted small LLM (VPS) or demo bridge (`MELAK_CLOUD_ENDPOINT` → LM Studio via tunnel) | Used only when online; falls back to on-device on failure |
| OTP SMS | Device-based SMS gateway (single SIM in pilot) | Not Africa’s Talking / reseller by default |
| `apps/mobile` | Expo stub | **Post-pilot** — do not demo as current offline path |
| `apps/desktop` | Electron | Loads web URL / static build — **not** the pilot offline story unless it wraps the same PWA build |

---

## Offline-first product loop

1. At school hub / first login (online): install PWA, sync question-bank + textbooks into IndexedDB.
2. Offline: start/play/complete practice or CBT entirely from local data; answers queue locally.
3. On reconnect: sync worker flushes sessions to `POST /sessions/sync`. Late assignment submissions are **accepted** and flagged `sync_status = late` for teachers.
4. Melak: on-device rules first; optional “enhanced” answer via VPS when online (visible in UI).

---

## Auth & government-schools gate

- **Phone OTP** is the primary credential (email optional).
- New student/teacher accounts land **`pending`** until an **admin** approves them.
- Signup requires selecting a **`schools`** row (`school_type`, `verified`) so admins can enforce **government schools only** for the pilot.
- Teacher onboarding uses **per-school invite codes**, not a single shared secret.
- Admin dashboard: approve/reject/revoke, overview by school, activity feed, audit trail.

---

## Melak (accurate description)

**Melak is an on-device tutor by default**, powered by deterministic curriculum rules in `@kasina/melak-core`. When the device has internet, responses can be **enhanced by a self-hosted AI model on Kasina’s own VPS**. It is **not** Claude-powered and should not be marketed as an unqualified “cloud AI tutor.”

---

## Monorepo layout

| Path | Role |
|------|------|
| `apps/web` | Marketing + student + teacher + admin UI (PWA) |
| `apps/server` | Hono API |
| `apps/mobile` | Expo stub (post-pilot) |
| `apps/desktop` | Electron shell (not pilot offline) |
| `packages/db` | Migrations + seed |
| `packages/question-bank` | Grade 12 Math questions (see [content-status.md](./content-status.md)) |
| `packages/melak-core` | Rule-based on-device Melak |
| `packages/types` | Shared types |

---

## Recurring costs (not DAP-fundable)

DAP excludes routine running costs. Separate these from one-time pilot deliverables (training, content, student data/SIM packs):

| Item | Notes |
|------|--------|
| Vercel / Cloudflare Pages | Web hosting |
| Cloudflare Workers | API |
| Supabase | Postgres |
| R2 | Textbook storage |
| Melak VPS | Self-hosted LLM enhancement |
| OTP SMS device + SIM | Carrier SMS rates; gateway phone hardware |

See also [ops/sms-gateway.md](./ops/sms-gateway.md).

---

## Related docs

- [Content coverage status](./content-status.md)
- [Data & child protection](./data-and-child-protection.md)
- [SMS gateway ops](./ops/sms-gateway.md)
- Deploy: [mvp/deploy-kasina-et.md](./mvp/deploy-kasina-et.md)
