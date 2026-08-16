# Pilot — Device QA matrix & offline expectations

## Offline / airplane mode

MVP **requires network**. There is no offline SQLite sync.

When offline or the API is unreachable, the web app shows:

> You appear to be offline… / Cannot reach the server…

Students should retry when Wi‑Fi returns. Do not ask them to “force refresh” as the first step — reconnect first.

## QA matrix (critical path)

Critical path = join → start assignment → answer → results → teacher sees Done.

| Device | Browser | Join | Quiz | Results | Teacher |
|--------|---------|------|------|---------|---------|
| Small Android phone | Chrome | ☐ | ☐ | ☐ | ☐ |
| Large Android phone | Chrome | ☐ | ☐ | ☐ | ☐ |
| Android tablet / large | Chrome | ☐ | ☐ | ☐ | ☐ |
| Desktop | Chrome or Firefox | ☐ | ☐ | ☐ | ☐ |

Checks per cell:

- Touch targets usable (≥44px primary actions)
- No horizontal scroll on quiz options
- Sticky quiz submit bar visible above home indicator
- Student cannot open `/teacher` (redirects to `/student`)

## Role / integrity smoke

- [ ] Student session cookie cannot list another teacher’s class by ID (403)
- [ ] Student cannot GET another student’s `/sessions/:id` (404)
- [ ] Join spam returns 429 after limit
- [ ] Answer spam returns 429 after limit

## Staging / production URL

Document the shareable URL here before pilot day:

```text
Web:  https://kasina.et
API:  https://api.kasina.et
Invite example: DEMO2026 (or class-specific code)
Support: support@kasina.et (or pilot WhatsApp/Telegram)
```

Deploy runbook: [deploy-kasina-et.md](./deploy-kasina-et.md) · Smoke: `pnpm smoke:prod` with `API_URL` / `WEB_URL` set.