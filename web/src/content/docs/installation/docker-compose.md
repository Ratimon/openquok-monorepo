---
title: Self-host - Docker Compose
description: Self-host OpenQuok with Docker Compose — env setup, Supabase, bring-up, and updates for API, web, Redis, and BullMQ workers.
order: 6
lastUpdated: 2026-09-25
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

You run OpenQuok on your computer or private network with Docker Compose. The stack lives under <Badge text="infra/self-host/" variant="path" />. It starts the API, web UI, Redis, and background workers.

<Callout type="tip">
<p>You can pull pre-built API and worker images instead of building them. You still need this repo for Compose files and <Badge text="infra/self-host/.env" variant="path" />. See <a href="/docs/installation/docker">Docker (pre-built images)</a>.</p>
</Callout>

<Callout type="note">
<p><Badge text="infra/docker-compose.yml" variant="path" /> is for repo developers (Redis only). Operators use <Badge text="infra/self-host/docker-compose.yml" variant="path" />.</p>
</Callout>

Self-host defaults turn off email and billing. You can sign up without inbox verification or a paywall. See <a href="/docs/configuration-backend/resend">email</a> and <a href="/docs/configuration-backend/stripe">Stripe</a>.

## Prepare your environment file

Copy the example file from the repo root:

```bash
cp infra/self-host/.env.example infra/self-host/.env
```

Compose loads <Badge text="infra/self-host/.env" variant="path" /> into the API and workers. The web service does not load the full file. <Badge text="VITE_*" variant="envWeb" /> values are set at **web image build** time.

### Supabase (required)

You need a Supabase project before the first start. Apply OpenQuok migrations to that project. See <a href="/docs/configuration-backend/database">Database & migrations</a> and <a href="/docs/configuration-backend/supabase">Supabase</a>.

| Variable | Role |
| --- | --- |
| <Badge text="PUBLIC_SUPABASE_URL" variant="envBackend" /> | API / Auth URL |
| <Badge text="PUBLIC_SUPABASE_PUBLISHABLE_KEY" variant="envBackend" /> | Publishable key |
| <Badge text="SUPABASE_SECRET_KEY" variant="envBackend" /> | Secret key (server only) |
| <Badge text="VITE_PUBLIC_SUPABASE_URL" variant="envWeb" /> | Same URL for the web build |
| <Badge text="VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY" variant="envWeb" /> | Same publishable key for the web build |

If Supabase runs on your host with <code>supabase start</code>, use <code>http://host.docker.internal:54321</code> for the API URL (port from <code>supabase status</code>, not Postgres <code>5432</code>).

### Local-friendly defaults

```bash
EMAIL_ENABLED=false
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
DISABLE_REGISTRATION=false
NOT_SECURED=true
FRONTEND_DOMAIN_URL=http://localhost:4007
BACKEND_DOMAIN_URL=http://localhost:3000
VITE_FRONTEND_DOMAIN_URL=http://localhost:4007
VITE_API_BASE_URL=
```

Set <Badge text="SECURITY_SECRET" variant="envBackend" /> (for example <code>openssl rand -hex 32</code>). Leave <Badge text="VITE_API_BASE_URL" variant="envWeb" /> **empty** so the web container proxies <code>/api</code> to the API service.

Use <Badge text="NOT_SECURED=true" variant="envBackend" /> for plain HTTP on localhost. Set <code>false</code> behind HTTPS. With <code>true</code>, API rate limiting is off by default (see <Badge text="RATE_LIMIT_ENABLED" variant="envBackend" /> in <Badge text="infra/self-host/.env.example" variant="path" />).

Redis and uploads use Compose defaults (<Badge text="REDIS_HOST=redis" variant="envBackend" />, <Badge text="STORAGE_PROVIDER=local" variant="envBackend" />).

### Social channels (optional)

Leave provider keys empty until you connect a channel. Fill only the networks you use. Then recreate API and workers. Setup guides: <a href="/docs/social-integration">Social integration</a>.

| Variable | Channel |
| --- | --- |
| <Badge text="FACEBOOK_APP_ID" variant="envBackend" /> / <Badge text="FACEBOOK_APP_SECRET" variant="envBackend" /> | Facebook Page |
| <Badge text="INSTAGRAM_APP_ID" variant="envBackend" /> / <Badge text="INSTAGRAM_APP_SECRET" variant="envBackend" /> | Instagram |
| <Badge text="THREADS_APP_ID" variant="envBackend" /> / <Badge text="THREADS_APP_SECRET" variant="envBackend" /> | Meta Threads |
| <Badge text="YOUTUBE_CLIENT_ID" variant="envBackend" /> / <Badge text="YOUTUBE_CLIENT_SECRET" variant="envBackend" /> | YouTube |
| <Badge text="TIKTOK_CLIENT_ID" variant="envBackend" /> / <Badge text="TIKTOK_CLIENT_SECRET" variant="envBackend" /> | TikTok |
| <Badge text="LINKEDIN_CLIENT_ID" variant="envBackend" /> / <Badge text="LINKEDIN_CLIENT_SECRET" variant="envBackend" /> | LinkedIn / LinkedIn Page |
| <Badge text="X_API_KEY" variant="envBackend" /> / <Badge text="X_API_SECRET" variant="envBackend" /> | X |

Dev.to uses a user API key in the dashboard. You do not add operator env vars for it. See <a href="/docs/social-integration/devto">Dev.to</a>.

For cutover windows, set <Badge text="MAINTENANCE_MODE" variant="envBackend" /> and recreate containers. See <a href="/docs/installation/maintenance-mode">Maintenance mode</a>.

<Callout type="warning" title="After you change env">
<p>Rebuild the <code>web</code> service when you change <Badge text="VITE_*" variant="envWeb" />. For other vars, recreate: <code>docker compose -f infra/self-host/docker-compose.yml up -d --force-recreate</code>.</p>
</Callout>

## Install and start

Run all commands from the **repository root**.

<Steps
	howToName="Start with Docker Compose"
	howToDescription="Self-host OpenQuok with Docker Compose."
>

### Check requirements

See <a href="/docs/installation/system-requirements">System requirements</a> for Docker, disk space, and Supabase.

### Edit <code>.env</code>

Copy <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/infra/self-host/.env.example"><Badge text="infra/self-host/.env.example" variant="path" /></DocsExternalLink> to <Badge text="infra/self-host/.env" variant="path" />. Fill Supabase keys and <Badge text="SECURITY_SECRET" variant="envBackend" />.

### Start the stack

**Option A — Build everything (default)**

```bash
docker compose -f infra/self-host/docker-compose.yml up --build
```

The first run can take **20–40 minutes** or more. Later starts are faster. Add <code>-d</code> to run in the background.

**Option B — Pull API and workers**

Set in <Badge text="infra/self-host/.env" variant="path" />:

```bash
OPENQUOK_IMAGE_REGISTRY=ghcr.io/ratimon
OPENQUOK_IMAGE_TAG=0.1.1
```

Then:

```bash
docker compose -f infra/self-host/docker-compose.yml -f infra/self-host/docker-compose.images.yml pull
docker compose -f infra/self-host/docker-compose.yml -f infra/self-host/docker-compose.images.yml up -d --build
```

Use the same two <code>-f</code> files for <code>down</code>, logs, and updates when you chose Option B.

### Open the app

- Web: <Badge text="http://localhost:4007" variant="default" />
- API: <Badge text="http://localhost:3000" variant="default" />

Change the web port with <Badge text="OPENQUOK_WEB_HOST_PORT" variant="envBackend" /> if <code>4007</code> is busy.

### Optional: CLI login profile

For <code>openquok auth:login</code> device flow:

```bash
docker compose -f infra/self-host/docker-compose.yml --profile cli up --build
```

Register an OAuth app with redirect <Badge text="http://localhost:3111/device/callback" variant="default" />. See <a href="/docs/configuration-agent">Configuration - Agent</a>.

### Stop the stack

Option A:

```bash
docker compose -f infra/self-host/docker-compose.yml down
```

Option B (both compose files):

```bash
docker compose -f infra/self-host/docker-compose.yml -f infra/self-host/docker-compose.images.yml down
```

Add <code>--profile cli</code> if you used the CLI profile.

</Steps>

## Start again

Reuse images when you did not change code or <Badge text="VITE_*" variant="envWeb" />:

```bash
docker compose -f infra/self-host/docker-compose.yml up -d --no-build
```

With Option B, add the second <code>-f infra/self-host/docker-compose.images.yml</code> file. Open <Badge text="http://localhost:4007" variant="default" /> when containers are up.

## Update

From the repo root:

```bash
git pull origin main
docker compose -f infra/self-host/docker-compose.yml up -d --build
```

For Option B, set a new <Badge text="OPENQUOK_IMAGE_TAG" variant="envBackend" />, then <code>pull</code> and <code>up -d --build</code> with both compose files.

If release notes mention database changes, run migrations on Supabase. Docker does not do that step. See <a href="/docs/configuration-backend/database">Database & migrations</a>.

## What runs in the stack

| Service | Role |
| --- | --- |
| <code>redis</code> | Cache and job queue |
| <code>api</code> | Backend API |
| <code>web</code> | Web UI |
| <code>worker-*</code> (three) | Background jobs |
| <code>postgres</code> / <code>agent-server</code> | Only with <code>--profile cli</code> |

## Troubleshooting

<Callout type="warning">
<p>If <code>up --build</code> fails on <code>registry-1.docker.io</code>, run <code>docker logout docker.io</code> and retry. For Option B, use <Badge text="OPENQUOK_IMAGE_REGISTRY=ghcr.io/ratimon" variant="envBackend" /> when GHCR packages are public.</p>
</Callout>

If orchestrator build fails with <strong>already exists</strong>, update the repo or use Option B <code>pull</code>.

## Security

This stack targets **your machine or a trusted private network**. It is not a hardened public SaaS edge.

| Topic | Guidance |
| --- | --- |
| HTTP | <Badge text="NOT_SECURED=true" variant="envBackend" /> on localhost only; use HTTPS and <code>false</code> on the public internet |
| Signup | Open by default; email verify is off when <Badge text="EMAIL_ENABLED=false" variant="envBackend" /> |
| Secrets | Never commit <Badge text="infra/self-host/.env" variant="path" /> |
| Ports | Web and API bind on the host; use a firewall on shared or cloud hosts |
| Redis | No password; not published to the host |

<Callout type="danger">
<p>Do not expose this stack to the internet without TLS, a firewall, and <Badge text="NOT_SECURED=false" variant="envBackend" />. Rotate secrets if they leak.</p>
</Callout>

For Vercel or Railway deploys, see <a href="/docs/installation/production-deployment">Production deployment</a>.

## Related

<CardGrid>
<LinkCard title="Docker (pre-built images)" description="Registry pulls, version pins, and web rebuild rules" href="/docs/installation/docker" />
<LinkCard title="System requirements" description="CPU, RAM, ports, and Supabase" href="/docs/installation/system-requirements" />
<LinkCard title="Maintenance mode" description="Write-freeze during cutover" href="/docs/installation/maintenance-mode" />
<LinkCard title="Social integration" description="OAuth apps and redirect URIs per channel" href="/docs/social-integration" />
<LinkCard title="Configuration - Worker" description="BullMQ workers and Redis" href="/docs/configuration-worker" />
</CardGrid>
