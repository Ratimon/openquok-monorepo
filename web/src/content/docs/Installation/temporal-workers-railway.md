---
title: Temporal, workers & Railway
description: How the API uses Temporal versus a worker (orchestrator), the main task queue, and options to run Temporal on Railway.
order: 4
lastUpdated: 2026-04-06
---

<script>
import { Badge, Callout, DocsExternalLink, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

# Temporal, workers & Railway

## How the pieces map (API vs Temporal server vs worker)

Temporal splits into three ideas:

1. **Temporal service (cluster)** — persistence + matching + history + **frontend** (gRPC, usually port <code>7233</code>). This is what <Badge text="infra/temporal/docker-compose.yaml" variant="path" /> runs (with its own Postgres and Elasticsearch for visibility).
2. **Client** — your **backend API** uses <code>@temporalio/client</code> to **start** or **signal** workflows. It only needs <Badge text="TEMPORAL_ADDRESS" variant="envBackend" />, <Badge text="TEMPORAL_NAMESPACE" variant="envBackend" />, and the **task queue name** when calling <code>workflow.start</code>.
3. **Worker (orchestrator)** — a **long-running Node (or other) process** using <code>@temporalio/worker</code> that **polls a task queue** and **runs workflow and activity code**. In architecture diagrams this is often labeled **Orchestrator**; it is **not** the same as the HTTP API.

Rough data flow:

- **Browser → Frontend → Backend (HTTP)** — normal API.
- **Backend → Temporal frontend (gRPC)** — e.g. start <code>refreshTokenWorkflow</code> on a **task queue**.
- **Temporal service → Worker** — delivers tasks to whatever worker is subscribed to that queue.
- **Worker → Postgres / storage / third parties** — your business logic (tokens, files, etc.), same as any backend job runner.

The OpenQuok API today implements the **client** side (see <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/services/RefreshIntegrationService.ts"><Badge text="RefreshIntegrationService" variant="path" /></DocsExternalLink>). It starts <code>refreshTokenWorkflow</code> on task queue <code>main</code> with <code>workflowIdConflictPolicy: TERMINATE_EXISTING</code>. Workflow implementations and a **worker** entrypoint are not in this monorepo yet—until a worker polls <code>main</code>, started workflows will not make progress.

## Why compose files often show only <Badge text="TEMPORAL_ADDRESS" variant="envBackend" />

In many Docker Compose setups the **application** container gets <code>TEMPORAL_ADDRESS=temporal:7233</code> so the app can reach the Temporal **frontend**. **Namespace** and **default task queue** may be **hardcoded** in application config instead of env vars.

This repository exposes:

| Variable | Role |
|----------|------|
| <Badge text="TEMPORAL_ADDRESS" variant="envBackend" /> | gRPC host:port of the Temporal frontend (required for any client/worker). |
| <Badge text="TEMPORAL_NAMESPACE" variant="envBackend" /> | Namespace; must match server and worker (often <code>default</code> in dev). |
| Task queue <code>main</code> | Hardcoded in <Badge text="RefreshIntegrationService" variant="path" /> for refresh workflows; the **worker must poll <code>main</code>**. |

Compose files for the Temporal **server** usually only set <Badge text="TEMPORAL_ADDRESS" variant="envBackend" /> on the app container; queue names live in application code, not in server containers.

## Deploying Temporal on Railway

<Callout type="warning" title="API on Vercel + Temporal on Railway networking">
<p>If the **API** runs on <DocsExternalLink href="https://vercel.com">Vercel</DocsExternalLink>, serverless functions must reach <Badge text="TEMPORAL_ADDRESS" variant="envBackend" /> over the network. Railway <strong>private</strong> service DNS is only reachable inside the Railway project. For Vercel → self-hosted Temporal you typically need a <strong>TLS-terminated</strong> public endpoint (or <DocsExternalLink href="https://temporal.io/cloud">Temporal Cloud</DocsExternalLink>), not only an internal Railway hostname. If the **API** also runs on Railway in the <strong>same</strong> project, private networking to Temporal is realistic.</p>
</Callout>

<p><strong>Monorepo + Railway:</strong> Copy <Badge text="infra/docker-compose.railway.example.yaml" variant="path" /> to gitignored <Badge text="infra/docker-compose.railway.yaml" variant="path" />, fill secrets, drag that file on the canvas, then Git deploys—see <a href="/docs/Installation/production-deployment">Production deployment</a>. <Badge text="infra/docker-compose.full-stack.example.yaml" variant="path" /> is the <strong>reference</strong> for the same services with local <code>docker compose</code>. For <code>pnpm railway:deploy:backend-compose</code> / <code>railway up .</code> from the <strong>repository root</strong>, run <code>railway login</code>, <code>railway init</code>, and <code>railway link</code> there, not from <code>infra/</code> alone.</p>

Railway runs **one deployable unit per service** (Dockerfile or image). A full Temporal stack needs **PostgreSQL** (dedicated DB for Temporal, not your Supabase project), **Elasticsearch** (for visibility in the setup we ship), and **Temporal** (<code>temporalio/auto-setup</code>). That mirrors <Badge text="infra/temporal/docker-compose.yaml" variant="path" />.

**High-level approach:**

<ol class="list-decimal space-y-2 pl-5">
<li>Create a Railway <strong>project</strong> (for example <code>openquok-temporal</code>).</li>
<li>Add <strong>PostgreSQL</strong> (new database used only by Temporal).</li>
<li>Add a service from the official <DocsExternalLink href="https://hub.docker.com/_/elasticsearch">Elasticsearch</DocsExternalLink> image (for example tag <code>7.17.27</code>; single-node env vars match <Badge text="infra/temporal/docker-compose.yaml" variant="path" />). This service is memory-heavy—pick an adequate plan.</li>
<li>Add a service using image <code>temporalio/auto-setup:1.28.1</code> (or the version you standardize on). Set environment variables equivalent to <Badge text="infra/temporal/docker-compose.yaml" variant="path" /> (<code>DB</code>, <code>POSTGRES_SEEDS</code>, <code>POSTGRES_USER</code>/<code>POSTGRES_PWD</code>, <code>ENABLE_ES</code>, <code>ES_SEEDS</code>, <code>ES_VERSION=v7</code>, <code>DYNAMIC_CONFIG_FILE_PATH</code>, etc.). Point <code>POSTGRES_SEEDS</code> and <code>ES_SEEDS</code> at the **internal hostnames** Railway assigns to those services (<DocsExternalLink href="https://docs.railway.app/guides/variables#reference-variables">reference variables</DocsExternalLink> / private networking).</li>
<li>Optional: deploy <code>temporalio/ui</code> as another service for operators; it talks to the Temporal frontend on the internal network.</li>
<li>Expose the **Temporal frontend** port (<code>7233</code>) only as needed: prefer **private** connectivity to your API/worker; avoid a public gRPC endpoint without Temporal’s recommended security.</li>
<li>After deploy, verify **no** public Railway domain is attached to Temporal or the Web UI—see <a href="/docs/Installation/production-deployment">Production deployment</a> (section <strong>7. Verify Temporal is not public on Railway</strong>).</li>
</ol>

Mounting dynamic config: our repo uses <Badge text="infra/temporal/dynamicconfig/development-sql.yaml" variant="path" />. On Railway you either bake a tiny image that copies that file or use a volume/config mechanism Railway supports—see <DocsExternalLink href="https://docs.railway.app/guides/docker">Railway — Docker</DocsExternalLink>.

**Practical shortcuts:**

- **One-shot stack on Railway:** use gitignored <Badge text="infra/docker-compose.railway.yaml" variant="path" /> (from the <Badge text="infra/docker-compose.railway.example.yaml" variant="path" /> template); optional overrides in the dashboard. The manual steps above mirror the same pieces if you build the project without canvas import.
- **Fastest for production with Vercel API:** use <DocsExternalLink href="https://temporal.io/cloud">Temporal Cloud</DocsExternalLink> and set <Badge text="TEMPORAL_ADDRESS" variant="envBackend" /> (and TLS settings per their docs) on Vercel—no Elasticsearch/Postgres Temporal stack to operate.
- **API and Temporal both on Railway:** same-project private URLs for <Badge text="TEMPORAL_ADDRESS" variant="envBackend" /> are straightforward; follow <DocsExternalLink href="https://docs.railway.app/overview/best-practices">Railway best practices</DocsExternalLink> for databases and scaling.

## Worker (orchestrator) deployment

When you add a worker package:

- Run it as a **long-lived** process (Railway **service**, Fly machine, ECS task, systemd, etc.).
- Use the **same** <Badge text="TEMPORAL_ADDRESS" variant="envBackend" /> and <Badge text="TEMPORAL_NAMESPACE" variant="envBackend" /> as the API, and poll task queue <code>main</code> for refresh workflows (or whatever queues you add in code later).
- It does **not** replace the Temporal **server**; it connects **to** the server like the client does, but with the worker role.

## Related pages

<CardGrid>
<LinkCard title="Production deployment" description="Backend, web, and Temporal connectivity" href="/docs/Installation/production-deployment" />
<LinkCard title="Docker & Compose" description="Local Temporal stack and API image" href="/docs/Installation/docker" />
<LinkCard title="Backend configuration" description="Env reference" href="/docs/configuration-backend" />
</CardGrid>
