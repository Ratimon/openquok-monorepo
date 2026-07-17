---
title: Self-host - Docker Compose
description: Self-host OpenQuok with Docker Compose — env setup, Supabase, and bring-up of API, web, Redis, and BullMQ workers.
order: 5
lastUpdated: 2026-07-17
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The canonical **self-host** path builds images from this monorepo and runs API, web, Redis, and BullMQ workers via Compose under <Badge text="infra/self-host/" variant="path" />. Use it when <strong>you</strong> want OpenQuok on your own computer or private network — not the hosted product at openquok.com.

<Callout type="note" title="Two Compose files">
<p><Badge text="infra/docker-compose.yml" variant="path" /> is for <strong>contributors</strong> developing the hosted OpenQuok product: local Redis and optional CLI-auth Postgres only (API/web still via <code>pnpm</code>). The full app stack for operators is <Badge text="infra/self-host/docker-compose.yml" variant="path" />. See <a href="/docs/installation/system-requirements">System requirements</a> and <a href="/docs/configuration-backend/docker">Docker (local services)</a>.</p>
</Callout>

Self-host defaults skip outbound email and Stripe billing so you can sign up and enter the app without a verify inbox or First Billing paywall. Details: <a href="/docs/configuration-backend/resend">email</a> and <a href="/docs/configuration-backend/stripe">Stripe</a>.

## Environment variables

Copy the example file, then edit <Badge text="infra/self-host/.env" variant="path" />. Compose loads it into the <strong>API and workers</strong> (and agent when using the <code>cli</code> profile) via <Badge text="env_file" variant="param" />; the web service does <strong>not</strong> load the full file. You can also export the same names in the shell before <code>docker compose</code>.

```bash
# From repo root
cp infra/self-host/.env.example infra/self-host/.env
```

### Required: Supabase

Fill these before first start (hosted project or local <code>supabase start</code>). Apply OpenQuok migrations to that project — see <a href="/docs/configuration-backend/database">Database & migrations</a> and <a href="/docs/configuration-backend/supabase">Supabase</a>.

| Variable | Role |
| --- | --- |
| <Badge text="PUBLIC_SUPABASE_URL" variant="envBackend" /> | API / Auth URL |
| <Badge text="PUBLIC_SUPABASE_PUBLISHABLE_KEY" variant="envBackend" /> | Publishable key |
| <Badge text="SUPABASE_SECRET_KEY" variant="envBackend" /> | Secret key (server only) |
| <Badge text="VITE_PUBLIC_SUPABASE_URL" variant="envWeb" /> | Same URL for the web **build** |
| <Badge text="VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY" variant="envWeb" /> | Same publishable key for the web **build** |

### Optional: Social provider apps

Leave these empty until you connect a channel. Fill only the pairs for networks you use, then recreate the API (and workers) so they pick up the new env. Per-provider setup (redirect URIs, app dashboards): <a href="/docs/social-integration">Social integration</a>.

| Variable | Channel |
| --- | --- |
| <Badge text="FACEBOOK_APP_ID" variant="envBackend" /> / <Badge text="FACEBOOK_APP_SECRET" variant="envBackend" /> | Facebook Page |
| <Badge text="INSTAGRAM_APP_ID" variant="envBackend" /> / <Badge text="INSTAGRAM_APP_SECRET" variant="envBackend" /> | Instagram |
| <Badge text="THREADS_APP_ID" variant="envBackend" /> / <Badge text="THREADS_APP_SECRET" variant="envBackend" /> | Meta Threads |
| <Badge text="YOUTUBE_CLIENT_ID" variant="envBackend" /> / <Badge text="YOUTUBE_CLIENT_SECRET" variant="envBackend" /> | YouTube |
| <Badge text="TIKTOK_CLIENT_ID" variant="envBackend" /> / <Badge text="TIKTOK_CLIENT_SECRET" variant="envBackend" /> | TikTok |
| <Badge text="LINKEDIN_CLIENT_ID" variant="envBackend" /> / <Badge text="LINKEDIN_CLIENT_SECRET" variant="envBackend" /> | LinkedIn / LinkedIn Page |
| <Badge text="X_API_KEY" variant="envBackend" /> / <Badge text="X_API_SECRET" variant="envBackend" /> | X |

<CardGrid>
<LinkCard title="Social integration" description="Per-channel OAuth apps, redirect URIs, and env setup guides" href="/docs/social-integration" />
</CardGrid>

### Self-host friendly defaults

```bash
EMAIL_ENABLED=false
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
DISABLE_REGISTRATION=false
NOT_SECURED=true
```

- <Badge text="EMAIL_ENABLED" variant="envBackend" /> <code>=false</code> — no outbound mail; signup auto-verified.
- Empty <Badge text="STRIPE_PUBLISHABLE_KEY" variant="envBackend" /> — <code>billingEnabled=false</code>; no First Billing paywall.
- <Badge text="NOT_SECURED" variant="envBackend" /> <code>=true</code> for plain HTTP on localhost; set <code>false</code> behind an HTTPS reverse proxy. With <code>true</code>, API rate limiting is <strong>off by default</strong> so the web container’s SSR proxy does not exhaust a shared per-IP limit (see <Badge text="RATE_LIMIT_ENABLED" variant="envBackend" /> in <Badge text="infra/self-host/.env.example" variant="path" />).

Also set <Badge text="SECURITY_SECRET" variant="envBackend" /> (for example <code>openssl rand -hex 32</code>) and align public URLs:

```bash
FRONTEND_DOMAIN_URL=http://localhost:4007
BACKEND_DOMAIN_URL=http://localhost:3000
VITE_FRONTEND_DOMAIN_URL=http://localhost:4007
VITE_API_BASE_URL=
```

Leave <Badge text="VITE_API_BASE_URL" variant="envWeb" /> <strong>empty</strong> for this Compose stack. The web container proxies same-origin <code>/api</code> and <code>/uploads</code> to the <code>api</code> service (<Badge text="OPENQUOK_API_PROXY_TARGET" variant="envRuntime" /> in Compose). Setting <code>http://localhost:3000</code> breaks server-side rendering inside the web container.

<Callout type="note" title="Supabase on the host">
<p>When API and workers run in Docker but Supabase runs on the host (<code>supabase start</code>), use the API URL from <code>supabase status</code> (typically port <code>54321</code>, not Postgres <code>5432</code>) and reach the host from containers via <code>http://host.docker.internal:54321</code> for <Badge text="PUBLIC_SUPABASE_URL" variant="envBackend" /> and matching <Badge text="VITE_PUBLIC_SUPABASE_*" variant="envWeb" />.</p>
</Callout>
Redis and storage defaults point at Compose service DNS and the uploads volume (<Badge text="REDIS_HOST=redis" variant="envBackend" />, <Badge text="STORAGE_PROVIDER=local" variant="envBackend" />, <Badge text="UPLOAD_DIRECTORY=/uploads" variant="envBackend" />).

<Callout type="warning" title="Changing env after build">
<p><Badge text="VITE_*" variant="envWeb" /> values are baked into the web image at <strong>build</strong> time. After changing them, rebuild the web service. Other vars usually need a recreate: <code>docker compose -f infra/self-host/docker-compose.yml up -d --force-recreate</code>.</p>
</Callout>

## Install and start

<Steps>

### Meet system requirements

Confirm Docker / Compose, disk, and a Supabase project per <a href="/docs/installation/system-requirements">System requirements</a>.

### Configure <code>.env</code>

Copy <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/infra/self-host/.env.example"><Badge text="infra/self-host/.env.example" variant="path" /></DocsExternalLink> to <Badge text="infra/self-host/.env" variant="path" />, fill Supabase keys (and matching <Badge text="VITE_*" variant="envWeb" />), and set <Badge text="SECURITY_SECRET" variant="envBackend" />.

### Bring the stack up

From the **repository root**:

```bash
docker compose -f infra/self-host/docker-compose.yml up --build
```

Detach with <code>-d</code> when you want background containers. The <code>web</code> service waits until <code>api</code> passes its <code>/health</code> check so SSR does not call the API before it is listening.

### Open the UI

- Web: <Badge text="http://localhost:4007" variant="default" />
- API: <Badge text="http://localhost:3000" variant="default" />

Sign up with email/password; with the defaults above you should enter the app without email verification or a billing paywall.

### Optional: CLI device-flow profile

Postgres + agent server for <code>openquok auth:login</code> device flow:

```bash
docker compose -f infra/self-host/docker-compose.yml --profile cli up --build
```

Register an OAuth app (Settings → Developers → Apps) with redirect <Badge text="http://localhost:3111/device/callback" variant="default" />, and fill the <code>OPENQUOK_OAUTH_*</code> / <Badge text="CLI_AUTH_SERVER_URL" variant="envBackend" /> fields documented in the example env. See <a href="/docs/configuration-agent">Configuration - Agent</a> and <a href="/docs/admin/oauth-server">Admin — OAuth Server</a>.

### Stop the stack

```bash
# From repo root
docker compose -f infra/self-host/docker-compose.yml down
```

If you started with <code>--profile cli</code>, include the same profile so Compose tears down those services too:

```bash
docker compose -f infra/self-host/docker-compose.yml --profile cli down
```

</Steps>

## Services in the stack

| Compose service | Role |
| --- | --- |
| <code>redis</code> | Cache + BullMQ |
| <code>api</code> | Express backend |
| <code>web</code> | SvelteKit Node adapter |
| <code>worker-integration-refresh</code> | BullMQ worker |
| <code>worker-notification-email</code> | BullMQ worker |
| <code>worker-scheduled-social-post</code> | BullMQ worker |
| <code>postgres</code> / <code>agent-server</code> | Only with <code>--profile cli</code> |

Images build from the monorepo root (<code>context: ../..</code>). No registry is required for v1.

## Security and exposure

This stack is designed for **trusted local / private-network** operators, not a multi-tenant public SaaS edge. Keep that in mind before publishing ports to the internet.

| Topic | Default / behavior | Guidance |
| --- | --- | --- |
| Audience | Single operator machine | Prefer localhost; for LAN/VPN only after you understand the defaults below |
| <Badge text="NOT_SECURED" variant="envBackend" /> | <code>true</code> (HTTP cookies) | Set <code>false</code> behind HTTPS; never leave <code>true</code> on a public origin |
| Registration | <Badge text="DISABLE_REGISTRATION=false" variant="envBackend" /> | Open signup; with <Badge text="EMAIL_ENABLED=false" variant="envBackend" /> accounts skip email verify |
| Secrets file | <Badge text="infra/self-host/.env" variant="path" /> | Gitignored; never commit. Compose loads it into **API and workers** (and agent when using <code>cli</code>) |
| Web container | No full <code>env_file</code> | Only runtime vars + <Badge text="VITE_*" variant="envWeb" /> baked at **build**; do not pass <Badge text="SUPABASE_SECRET_KEY" variant="envBackend" /> into web |
| Published ports | Web, API (and optional agent / worker health) on the host | Bind to localhost or firewall if the host is multi-user / cloud VPS |
| Redis | No password; not published | Keep unpublished; do not point at a shared production Redis |
| CLI Postgres | Default <code>openquok</code> / <code>openquok</code>; profile <code>cli</code> only | Change credentials if the host is not solely yours |

<Callout type="danger">
<p>Do not treat Compose as a public cloud deploy.Published ports default to all host interfaces. Combined with <Badge text="NOT_SECURED=true" variant="envBackend" />, open registration, and secrets in <code>.env</code>, a cloud VM with no firewall is an easy compromise. Use a reverse proxy with TLS, restrict listen addresses or firewall rules, set <Badge text="NOT_SECURED=false" variant="envBackend" />, and rotate <Badge text="SECURITY_SECRET" variant="envBackend" /> / Supabase keys if they ever leaked.</p>
</Callout>

## Production notes

- Put a reverse proxy (TLS) in front of web and API when exposing beyond localhost; set <Badge text="NOT_SECURED" variant="envBackend" /> to <code>false</code> and update public URL vars to your HTTPS origins.
- SaaS-style deploys on Vercel / Railway remain documented under <a href="/docs/installation/production-deployment">Production deployment</a>; this page is the self-host Compose path.

## Related

<CardGrid>
<LinkCard title="System requirements" description="CPU, RAM, ports, and operator-provided Supabase" href="/docs/installation/system-requirements" />
<LinkCard title="Production deployment" description="Vercel / Railway SaaS path vs self-host Compose" href="/docs/installation/production-deployment" />
<LinkCard title="Docker (local services)" description="Contributor Redis via infra/docker-compose.yml" href="/docs/configuration-backend/docker" />
<LinkCard title="Email (Resend / local)" description="EMAIL_ENABLED=false self-host mode" href="/docs/configuration-backend/resend" />
<LinkCard title="Stripe billing" description="Empty publishable key disables billing" href="/docs/configuration-backend/stripe" />
<LinkCard title="Social integration" description="OAuth app credentials and redirect URIs for each channel" href="/docs/social-integration" />
<LinkCard title="Configuration - Worker" description="BullMQ workers and Redis queues" href="/docs/configuration-worker" />
</CardGrid>
