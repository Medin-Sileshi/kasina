# Pilot — Device QA matrix & low-bandwidth expectations

## Network / weak connection

Kasina is **online-first**. There is no full offline product promise. IndexedDB may **queue** practice answers and flush on reconnect; the student shell should show pending queue state when applicable.

When the API is unreachable, the web app shows offline / cannot-reach-server messaging. Students should reconnect first — do not ask them to “force refresh” as the first step.

**Adey AI:** enhanced mode needs the model endpoint; basic fallback may still reply when the model is down.

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