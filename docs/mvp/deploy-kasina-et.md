# Deploy kasina.et (Cloudflare-first)

Target topology for the MVP:

| Surface | Host | URL |
|---------|------|-----|
| Web | Cloudflare Pages (preferred) or Vercel interim | `https://kasina.et` |
| API | Cloudflare Workers | `https://api.kasina.et` |
| DB | Supabase Postgres | (project URL) |

You do **not** need a purchased SSL certificate. Point the domain’s DNS to Cloudflare and enable the proxy (orange cloud) → Universal SSL.

Ethio telecom remains the registrar; Cloudflare becomes the DNS authority (or secondary DNS if you only CNAME through CF — nameserver delegation is the usual path).

---

## 1. Cloudflare DNS

1. Add site `kasina.et` in Cloudflare.
2. At Ethio telecom, set the Cloudflare nameservers they assign.
3. DNS records (example):

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `api` | `kasina-server.<your-subdomain>.workers.dev` **or** Workers custom domain | DNS only → then attach custom domain in Workers |
| CNAME / A | `@` / `www` | Pages or Vercel target | Proxied (orange) |

4. SSL/TLS mode: **Full (strict)** once origins support HTTPS.

---

## 2. Supabase (production)

1. Create or select the production project.
2. Run [`packages/db/migrations/002_mvp_core.sql`](../../packages/db/migrations/002_mvp_core.sql) in the SQL editor.
3. Copy:
   - Project URL → `SUPABASE_URL`
   - Service role key → `SUPABASE_SERVICE_ROLE_KEY`
   - Connection string → `DATABASE_URL`
4. Prefer the **direct** host (`db.<project>.supabase.co:5432`) for Better Auth on Workers/Node if the pooler drops idle connections. Session-mode pooler works with `max: 1` and retries already in the server.

---

## 3. Deploy API (Workers)

```bash
cd apps/server

# One-time login
npx wrangler login

# Secrets (production values)
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put DATABASE_URL
npx wrangler secret put BETTER_AUTH_SECRET   # long random string
npx wrangler secret put BETTER_AUTH_URL      # https://api.kasina.et
npx wrangler secret put APP_URL              # https://kasina.et

pnpm deploy
```

Attach custom domain `api.kasina.et` in the Cloudflare dashboard (Workers → kasina-server → Custom Domains), or set `routes` in `wrangler.jsonc` after the zone is on Cloudflare.

Verify:

```bash
curl -sS https://api.kasina.et/health
# {"ok":true,"db":true}
```

---

## 4. Deploy web (Vercel interim)

Import **https://github.com/Medin-Sileshi/kasina**.

**Project settings (required for this monorepo):**

| Setting | Value |
|---------|--------|
| Framework Preset | Next.js |
| **Root Directory** | `apps/web` |
| Install Command | `cd ../.. && pnpm install --frozen-lockfile` |
| Build Command | `cd ../.. && pnpm --filter web build` (or leave default from `apps/web/vercel.json`) |
| Output | Next.js default (do not set static export) |

**Environment variables:**

```text
NEXT_PUBLIC_API_URL=https://api.kasina.et
NEXT_PUBLIC_APP_URL=https://kasina.et
```

(Until the API Worker is live, local/dev API won’t work from production — pages still render; auth/API calls will fail until `api.kasina.et` is deployed.)

**Domains:** Add `kasina.et` and `www.kasina.et` in Vercel → Domains, then match DNS in Cloudflare.

If you see **FUNCTION_INVOCATION_FAILED / 500**: open Vercel → Deployment → **Logs** (Runtime). Most often Root Directory was left as repo root, or pnpm didn’t install workspace packages (`@kasina/types`).

### Option B — Cloudflare Pages

Same env vars. Prefer OpenNext / `@cloudflare/next-on-pages` adapter for Next 16; until then Vercel interim is fine.

### Same-origin rewrite (if cookies fail on Android)

Set `API_PROXY_TARGET=https://api.kasina.et` and leave `NEXT_PUBLIC_API_URL` empty so the browser only talks to `kasina.et` (see [`apps/web/next.config.ts`](../../apps/web/next.config.ts)).

---

## 5. Seed production data

With production Supabase credentials exported:

```bash
export SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...

# After a teacher account exists (sign up at https://kasina.et/teacher/signup):
pnpm db:seed
# Optional clean slate for pilot week:
pnpm db:reset-pilot
```

Demo invite after seed: **DEMO2026** (if using `teacher@kasina.local` or the configured seed teacher).

See also [production-db.md](./production-db.md).

---

## 6. Smoke test

```bash
pnpm smoke:prod
# or:
API_URL=https://api.kasina.et WEB_URL=https://kasina.et ./scripts/smoke-prod.sh
```

Critical path: health → teacher login → class/overview → student join → session → results.

---

## 7. Later: VPS

When moving off Pages/Vercel:

1. Run Next behind nginx/Caddy on the VPS.
2. Keep Workers for API **or** run `tsx`/`node` API on the VPS with the same env.
3. Point Cloudflare A/AAAA records at the VPS; keep orange-cloud SSL.

No product-loop changes required.
