---
title: Docker & Compose
description: Run Temporal, Redis, and optional containerized API workflows for OpenQuok local development and full-stack Compose deployment patterns.
order: 3
lastUpdated: 2026-04-03
---

<script>
import { Badge, Callout, DocsExternalLink, Steps, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

# Docker & Compose

OpenQuok’s primary app flow remains **pnpm on the host** (API + SvelteKit) with **Supabase** for auth and data. Docker Compose is used for **supporting services** (Temporal, Redis) and optionally for **running the API in a container** when you self-host. This matches the idea behind common compose-based stacks (Postgres/Redis/Temporal) without requiring a single monolithic app image for day-to-day development.

<Callout type="note" title="Why not one container for everything?">
The backend uses <Badge text="GlobalConfig" variant="path" /> and env-based configuration; Redis is integrated via <Badge text="RedisCacheProvider" variant="path" /> when <Badge text="CACHE_PROVIDER" variant="envBackend" /><code>=redis</code>. The web app is normally built with the Vercel adapter; running the frontend in Docker would mean adding <code>@sveltejs/adapter-node</code> (or similar) and a reverse proxy—out of scope for the default workflow documented here.
</Callout>

## Development: hybrid flow (recommended)

**On the host:** install dependencies, run Supabase locally or use a hosted project, then <code>pnpm backend:dev</code> and <code>pnpm web:dev</code>.

**In Docker:** start Temporal (and optionally Redis) so the API can use workflows and Redis-backed cache without installing Elasticsearch or Temporal binaries locally.

<Steps>

### Start infra (Temporal + Redis)

From the **repository root**:

```bash
pnpm infra:dev:up
```

This merges <Badge text="infra/temporal/docker-compose.yaml" variant="path" /> with a Redis service (<Badge text="infra/docker-compose.dev.yaml" variant="path" />). Temporal-only (no Redis) is still available as <code>pnpm infra:temporal:up</code>.

### Point the backend at services on localhost

With the default compose ports, set (or keep) in <Badge text="backend/.env.development.local" variant="envFile" />:

- <Badge text="TEMPORAL_ADDRESS" variant="envBackend" /><code>=localhost:7233</code> — gRPC frontend for the Temporal client.
- For Redis cache: <Badge text="CACHE_PROVIDER" variant="envBackend" /><code>=redis</code>, <Badge text="REDIS_HOST" variant="envBackend" /><code>=localhost</code>, <Badge text="REDIS_PORT" variant="envBackend" /><code>=6379</code> (or your <Badge text="REDIS_DEV_PORT" variant="envRuntime" /> override).

### Run the API and web

Use the same commands as <a href="/docs/Installation/development-environment">Development environment</a> (<code>pnpm backend:dev</code>, <code>pnpm web:dev</code>).

### Stop infra

```bash
pnpm infra:dev:down
```

</Steps>

**Temporal Web UI** defaults to <code>http://localhost:8080</code> (override with <Badge text="TEMPORAL_UI_PORT" variant="envRuntime" /> in <Badge text="infra/temporal/.env" variant="envFile" />).

## Production (Temporal + API + web)

Vercel does **not** run Docker Compose or a Temporal server. For **production** (backend on Railway or Vercel, web, CORS, workers), use <a href="/docs/Installation/production-deployment">Production deployment</a>. This page stays focused on **local Compose**, container images, and reference links.

## Production posture: Temporal and the public internet

<DocsExternalLink href="https://docs.temporal.io/self-hosted-guide/deployment">Temporal’s deployment guide</DocsExternalLink> states that self-hosted Temporal should be treated like a database: **do not expose the gRPC frontend to the public internet** without TLS and network controls. Typical patterns:

- **Split hosting:** App and API on your edge (e.g. Vercel) or DMZ; Temporal and workers on a **private network** (VPC, VPN, internal Kubernetes), reachable only from the API and workers.
- **Temporal Cloud:** Managed service so you do not run the Temporal data plane yourself.
- **Docker Compose on a private host:** Run the same stack as dev, but **bind or firewall** so port <code>7233</code> is not world-reachable; use SSH tunnel or private networking for operators.

The included Temporal stack binds <code>7233</code> (and the Web UI port) to <code>127.0.0.1</code> by default (<Badge text="TEMPORAL_BIND_HOST" variant="envRuntime" /> in <Badge text="infra/temporal/.env" variant="envFile" />). For internet-facing machines, **fork or edit** so Temporal stays on a private network or Cloud—do not set <code>TEMPORAL_BIND_HOST=0.0.0.0</code> without firewall rules.

## API container image (GHCR / registry)

The backend image is defined in <Badge text="backend/Dockerfile" variant="path" />. Build from the **monorepo root**:

```bash
pnpm docker:build:backend
```

Tag and push to your registry (example):

```bash
docker tag openquok-backend:local ghcr.io/<org>/openquok-backend:<git-sha>
docker push ghcr.io/<org>/openquok-backend:<git-sha>
```

Wire secrets (Supabase keys, <Badge text="JWT_SECRET" variant="envBackend" />, etc.) in your orchestrator or an env file—**do not** bake secrets into the image.

**Full-stack compose (API + worker + Redis + Temporal)** — **reference / local Docker:** create <Badge text="infra/api.full-stack.env" variant="path" /> (gitignored) from <Badge text="infra/api.full-stack.env.example" variant="path" />, <Badge text="backend/.env.production.local" variant="envFile" />, or <Badge text="backend/.env.development.example" variant="envFile" /> (see <a href="/docs/Installation/production-deployment">Production deployment</a>), adjust for Compose service names, then run Compose with <Badge text="infra/docker-compose.full-stack.example.yaml" variant="path" />. The <code>api</code> and <code>worker</code> services use the same <code>env_file</code> so configuration matches <Badge text="backend/.env.*" variant="envFile" /> / <Badge text="GlobalConfig" variant="path" />: same keys, but use Docker service names for brokers (<Badge text="REDIS_HOST" variant="envBackend" /><code>=redis</code>, <Badge text="TEMPORAL_ADDRESS" variant="envBackend" /><code>=temporal:7233</code>), not <code>localhost</code>. The worker runs <code>node dist/temporal/worker.js</code>.

**Railway** does **not** use this file on the canvas—copy <Badge text="infra/docker-compose.railway.example.yaml" variant="path" /> to gitignored <Badge text="infra/docker-compose.railway.yaml" variant="path" />, add secrets (or run <code>pnpm railway:sync-env</code> from <Badge text="backend/.env.production.local" variant="envFile" /> by default), drag the copy; see <a href="/docs/Installation/production-deployment">Production deployment</a>.

**Compose vs container env:** Docker’s <DocsExternalLink href="https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/">environment variables in Compose</DocsExternalLink> distinguish (1) a file used for <strong>substitution</strong> in the YAML (e.g. <code>{String.fromCharCode(36, 123, 65, 80, 73, 95, 80, 79, 82, 84, 58, 45, 51, 48, 48, 48, 125)}</code>)—set via <code>export</code>, a <code>--env-file</code> passed to <code>docker compose</code>, or a project <code>.env</code> file—and (2) <code>env_file</code> on a service, which injects variables into the container. Full-stack Compose typically uses gitignored <code>infra/api.full-stack.env</code> beside the reference YAML; Railway inline <code>environment</code> is often filled from the same keys as <Badge text="backend/.env.production.local" variant="envFile" /> via <code>pnpm railway:sync-env</code>. Use (1) only for compose-time values like the published host port if you change it.

## References

- <DocsExternalLink href="https://docs.temporal.io/production-deployment/worker-deployments">Temporal — Worker deployments</DocsExternalLink>
- <DocsExternalLink href="https://docs.temporal.io/self-hosted-guide/deployment">Temporal — Deploying a Temporal Service</DocsExternalLink>
- <DocsExternalLink href="https://docs.docker.com/compose/how-tos/multiple-compose-files/include/">Docker Compose — Include</DocsExternalLink> (how <Badge text="infra/docker-compose.dev.yaml" variant="path" /> pulls in the Temporal file)
- <DocsExternalLink href="https://docs.railway.app/guides/services">Railway — Services</DocsExternalLink> (running containerized workloads outside Vercel)

## Next steps

<CardGrid>
<LinkCard title="Temporal, workers & Railway" description="Task queue, orchestrator mapping, Railway stack" href="/docs/Installation/temporal-workers-railway" />
<LinkCard title="Production deployment" description="Backend (Railway or Vercel), web, Temporal" href="/docs/Installation/production-deployment" />
<LinkCard title="Development environment" description="pnpm commands for backend and web without Docker" href="/docs/Installation/development-environment" />
<LinkCard title="Vercel" description="CLI, build warnings, and domain details" href="/docs/Installation/vercel" />
<LinkCard title="Backend configuration" description="Env vars and Supabase" href="/docs/configuration-backend" />
</CardGrid>
