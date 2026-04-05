---
title: Production deployment
description: Production setup for the OpenQuok API, Temporal, and web—Railway or Vercel for the backend, usually Vercel for the frontend.
order: 1
lastUpdated: 2026-04-03
---

<script>
import { Badge, Callout, DocsExternalLink, Steps, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

# Production deployment

**Supabase** stays your database and auth. If you run **your own Temporal server** (instead of <DocsExternalLink href="https://temporal.io/cloud">Temporal Cloud</DocsExternalLink>), a common pattern is **one Railway project** created by importing a **local, gitignored** <Badge text="infra/docker-compose.railway.yaml" variant="path" /> on the canvas (drag-and-drop). Copy it from <Badge text="infra/docker-compose.railway.example.yaml" variant="path" />, add real secrets to inline <code>environment</code> (or maintain gitignored <Badge text="backend/.env.production.local" variant="envFile" /> and run <code>pnpm railway:sync-env</code> to merge into the compose file—default source; use <code>--from</code> for another path—see <Badge text="infra/railway/README.md" variant="path" />), then drag the YAML—**never commit** the non-example file. You get the **API, Temporal worker, Redis, and a single Temporal cluster** as services; put **only the web app** on <DocsExternalLink href="https://vercel.com">Vercel</DocsExternalLink>. The API reaches the Temporal frontend at **`temporal:7233`** on Railway’s private network. <Badge text="infra/docker-compose.full-stack.example.yaml" variant="path" /> is the **reference** for the same topology with local Docker (<code>env_file</code>, <code>restart</code>)—not the file you import into Railway. If you prefer **serverless** for the API, deploy the backend on **Vercel** and point <Badge text="TEMPORAL_ADDRESS" variant="envBackend" /> to Temporal Cloud or another reachable gRPC endpoint; the backend is **not** tied to Vercel.

<Callout type="note" title="Temporal and the API host">
<p><strong>Vercel</strong> does not run the Temporal server or Docker Compose. If the API is on Vercel, set <Badge text="TEMPORAL_ADDRESS" variant="envBackend" /> to <DocsExternalLink href="https://temporal.io/cloud">Temporal Cloud</DocsExternalLink> or another reachable gRPC endpoint. If the API is on <strong>Railway</strong> in the same project as the stack imported from <Badge text="infra/docker-compose.railway.yaml" variant="path" /> (same shape as the reference <Badge text="infra/docker-compose.full-stack.example.yaml" variant="path" />), <Badge text="TEMPORAL_ADDRESS" variant="envBackend" /><code>=temporal:7233</code> is enough on the shared network.</p>
</Callout>

## What you are deploying

| Piece | Typical host | Notes |
|-------|----------------|--------|
| Database & auth | <DocsExternalLink href="https://supabase.com">Supabase</DocsExternalLink> (cloud) | Keys in backend and web env. |
| **API + worker + Temporal + Redis** (optional bundle) | **Railway** (canvas Compose import + Git) | **Deploy:** <code>cp infra/docker-compose.railway.example.yaml infra/docker-compose.railway.yaml</code>, fill secrets in the copy (gitignored), or use <Badge text="backend/.env.production.local" variant="envFile" /> + <code>pnpm railway:sync-env</code> (default) to refresh <code>environment</code> in that YAML, then drag <Badge text="infra/docker-compose.railway.yaml" variant="path" />, connect the repo. **Template:** <Badge text="infra/docker-compose.railway.example.yaml" variant="path" />. **Reference:** <Badge text="infra/docker-compose.full-stack.example.yaml" variant="path" /> for local Docker (<code>worker</code> runs <code>node dist/temporal/worker.js</code>). Private DNS matches Compose service names (<code>redis</code>, <code>temporal</code>, …). |
| **API (serverless) + Temporal** | **Vercel** <Badge text="backend/" variant="path" /> + **Temporal Cloud** (or another reachable cluster) | Vercel does not run Temporal. The API still needs <Badge text="TEMPORAL_ADDRESS" variant="envBackend" />—usually <DocsExternalLink href="https://temporal.io/cloud">Temporal Cloud</DocsExternalLink> or a public/TLS gRPC endpoint. <Badge text="backend/vercel.json" variant="path" />; see <a href="/docs/Installation/vercel">Vercel</a>. |
| Web | **Vercel** <Badge text="web/" variant="path" /> (typical) | SvelteKit + Vercel adapter. |
| Workers (Temporal) | **In** the Railway / full-stack shape by default, or **separate** (scale-out) | The Railway compose template and <Badge text="infra/docker-compose.full-stack.example.yaml" variant="path" /> both define a <code>worker</code> next to <code>api</code>. Add replicas or split workers per <DocsExternalLink href="https://docs.temporal.io/production-deployment/worker-deployments">Temporal — Worker deployments</DocsExternalLink>. Task queue <code>main</code>; see <a href="/docs/Installation/temporal-workers-railway">Temporal, workers &amp; Railway</a>. |

Optional Redis for cache: managed Redis or the Redis service in the imported Railway compose (same as the reference full-stack file); set <Badge text="CACHE_PROVIDER" variant="envBackend" /><code>=redis</code> and <Badge text="REDIS_*" variant="envBackend" />.

## Managing secrets (beyond Compose `env_file`)

Plain **`env_file`** files are convenient for **local** and **small self-hosted** setups: they keep the same keys as <Badge text="GlobalConfig" variant="path" />, but the values live as **plaintext on disk** on the host. Anyone with shell access, backups, or a leaked backup can read them; images and some orchestrators also surface environment variables to operators. That is why many teams treat `env_file` as **not** the final answer for **production secrets at scale**—not because the Node process should avoid environment variables (it still reads <code>process.env</code>), but because **where the secret material is stored and who can read it** should be tighter.

**Stronger patterns** (pick what matches your host):

- **Platform secret stores** — <DocsExternalLink href="https://vercel.com/docs/environment-variables">Vercel</DocsExternalLink>, <DocsExternalLink href="https://docs.railway.app/guides/variables">Railway variables</DocsExternalLink>, Fly secrets, Render env groups: values are set in the **dashboard or API**, injected at deploy, **not** committed to git. This is the usual path for serverless and managed containers.
- **Cloud secrets managers** — AWS Secrets Manager / SSM Parameter Store, Google Secret Manager, Azure Key Vault: applications or the orchestrator **fetch** or **map** secrets into the runtime environment using IAM roles (no long-lived keys in the repo).
- **Kubernetes** — <DocsExternalLink href="https://kubernetes.io/docs/concepts/configuration/secret/">Secrets</DocsExternalLink>, often combined with <DocsExternalLink href="https://external-secrets.io/">External Secrets</DocsExternalLink> to sync from a vault or cloud API.
- **Dedicated secret tools** — Vault, or hosted products that sync to deploy targets and enforce rotation/audit (evaluate against your compliance needs).

**Practices that help everywhere:** never commit real secrets (only <code>*.example</code> files); keep <Badge text="infra/docker-compose.railway.yaml" variant="path" /> gitignored; treat <Badge text="backend/.env.production.local" variant="envFile" /> and <Badge text="infra/api.full-stack.env" variant="path" /> (if used) as local-only secrets; separate **staging** and **production** credentials; rotate keys when people leave or after incidents; use **CI/CD OIDC** to deploy without static cloud keys in the pipeline where your provider supports it.

The backend does **not** require a special code path: if your platform or entrypoint exports the same variable names as <Badge text="GlobalConfig" variant="path" /> before <code>node dist/app.js</code> runs, behavior matches local development—only the **delivery** of those values changes.

<Steps>

### Prerequisites

- Supabase project and keys (see <a href="/docs/configuration-backend">Backend configuration</a>).
- A host for the **backend**: <DocsExternalLink href="https://railway.app">Railway</DocsExternalLink> (Docker-capable) and/or <DocsExternalLink href="https://vercel.com">Vercel</DocsExternalLink> (web almost always; API if you choose).
- This repository connected to your hosting (Git).
- Domains (optional): DNS for apex and <code>www</code>.

### Deploy the backend (and Temporal)

Choose **one** layout; the backend step is where Temporal connectivity is configured.

**A — Railway: API + Temporal + Redis in one project (recommended when you run Temporal yourself)**

1. **Canvas import** — create an **empty** Railway project. From the repo:

```bash
cp infra/docker-compose.railway.example.yaml infra/docker-compose.railway.yaml
```

Edit <Badge text="infra/docker-compose.railway.yaml" variant="path" /> with real <code>environment</code> values (file is **gitignored**), **or** maintain gitignored <Badge text="backend/.env.production.local" variant="envFile" /> and run <code>pnpm railway:sync-env</code> from the repo root to merge it into the <code>api</code> and <code>worker</code> blocks by default (<code>--from</code> overrides the source path; default worker mode updates only keys already present in the YAML—see <Badge text="infra/railway/README.md" variant="path" />). Drag **that** compose file onto the [project canvas](https://docs.railway.com/deploy/dockerfiles#docker-compose) and connect this **GitHub** monorepo to the **api** and **worker** build services. <Badge text="infra/docker-compose.full-stack.example.yaml" variant="path" /> stays a **reference** for local Docker only (it uses <code>env_file</code> and <code>restart</code>, which Railway’s importer rejects). Details: <Badge text="infra/railway/README.md" variant="path" />.

2. **Variables on api and worker** — if anything is still placeholder after import, use the dashboard (**Variables** / **Raw Editor**) with <Badge text="infra/api.full-stack.env.example" variant="path" /> as the key list. Railway usually **merges** dashboard variables over Compose. For local full-stack Docker, you can still use <code>infra/api.full-stack.env</code> (gitignored):

```bash
cp infra/api.full-stack.env.example infra/api.full-stack.env
# or: cp backend/.env.production.local infra/api.full-stack.env
```

**Redis / Temporal on the private network:** with the bundled Redis and Temporal services, use <Badge text="REDIS_HOST" variant="envBackend" /><code>=redis</code>, <Badge text="REDIS_PORT" variant="envBackend" /><code>=6379</code>, <Badge text="TEMPORAL_ADDRESS" variant="envBackend" /><code>=temporal:7233</code>, <Badge text="CACHE_PROVIDER" variant="envBackend" /><code>=redis</code> unless you switched to managed Redis or Temporal Cloud. Managed Redis elsewhere uses vendor hostnames—see <Badge text="backend/.env.production.local" variant="envFile" /> patterns when the API runs **outside** this stack.

3. **Deploy** — after the canvas is wired, **Git pushes** to the linked branch typically trigger **per-service** builds. No separate “upload compose” step on each code change.

**CLI alternative (one service at a time)** — from the **repository root** (where root <Badge text="package.json" variant="path" /> lives), not only <Badge text="infra/" variant="path" />:

```bash
railway login
railway init    # new Railway project
# or, for an existing project:
railway link
```

Then <code>pnpm railway:deploy:backend-compose:prod</code> (or <code>pnpm railway:deploy:backend-compose</code> for the default environment) runs <code>railway up .</code> for the **currently linked** service only—useful for quick uploads, not a substitute for wiring the whole canvas. The monorepo build is <code>docker build -f backend/Dockerfile .</code> from the repo root. <Badge text="infra/docker-compose.railway.yaml" variant="path" /> <code>build:</code> defines that for canvas import; root <Badge text="railway.json" variant="path" /> matches it so <code>railway up</code> does not fail with <strong>prefix not found</strong> (common without that file). Default <code>startCommand</code> in <code>railway.json</code> is the <strong>API</strong>; the <strong>worker</strong> service still needs <code>node dist/temporal/worker.js</code> (dashboard or <Badge text="infra/railway/worker.json" variant="path" />). Set <Badge text="RAILWAY_DOCKERFILE_PATH" variant="envRuntime" /><code>=backend/Dockerfile</code> on a service if the UI does not pick it up.

<Callout type="note" title="CLI: “prefix not found” after Indexed / Compressed">
<p><strong>npm warnings</strong> about <code>npm-globalconfig</code> / <code>verify-deps-before-run</code> when using <code>npx</code> are usually harmless (pnpm-related env keys npm does not recognize).</p>
<p><strong>“prefix not found”</strong> often appears when root <Badge text="railway.json" variant="path" /> is missing (CLI cannot resolve <Badge text="backend/Dockerfile" variant="path" /> in the archive), when the linked service is <strong>image-only</strong> (e.g. Redis/Postgres) instead of <strong>api</strong>/<strong>worker</strong>, or on monorepo path quirks. Try: <code>railway upgrade</code>, <code>railway up . --verbose</code>, keep <code>railway.json</code> at the repo root, <Badge text="RAILWAY_DOCKERFILE_PATH" variant="envRuntime" /><code>=backend/Dockerfile</code>, and <code>railway service</code> → <strong>api</strong> or <strong>worker</strong>. Prefer <strong>Git push</strong> after Compose import for the full stack.</p>
</Callout>

When your Railway project matches the compose **shape** from <Badge text="infra/docker-compose.railway.example.yaml" variant="path" /> (your local <Badge text="infra/docker-compose.railway.yaml" variant="path" /> copy), you get **API + worker + Redis + Temporal**—the <code>worker</code> service runs <code>node dist/temporal/worker.js</code>. For scaling and versioning beyond a single replica, see <DocsExternalLink href="https://docs.temporal.io/production-deployment/worker-deployments">Temporal — Worker deployments</DocsExternalLink> and **Workers** (section 5) below.

<Callout type="warning" title="Railway backend stack ≠ Temporal production hardening">
<p>Canvas import plus Git, or <code>pnpm railway:deploy:backend-compose:prod</code> for a linked service, <strong>deploys</strong> the backend stack you configured (API + worker + Redis + Temporal when using the Railway compose file)—not the web app—but does <strong>not</strong> add mTLS, Temporal authorization, or Web UI authentication by itself.</p>
<pre class="border-base-300 bg-base-300/35 text-base-content my-3 overflow-x-auto rounded-lg border p-3 font-mono text-[0.8125rem] leading-relaxed"><code>pnpm railway:deploy:backend-compose:prod</code></pre>
<p>The bundled Temporal services are still <strong>dev-oriented</strong> (see <Badge text="infra/temporal/README.md" variant="path" />, section <strong>Security (self-hosted)</strong>). For real production traffic: keep Temporal on <strong>private</strong> networking (do not publish gRPC/UI to the public internet), store secrets in Railway’s variable system (not git), and either <strong>harden</strong> self-hosted Temporal per <DocsExternalLink href="https://docs.temporal.io/self-hosted-guide/security">Temporal — Security</DocsExternalLink> / <DocsExternalLink href="https://docs.temporal.io/self-hosted-guide/production-checklist">Production checklist</DocsExternalLink> or use <DocsExternalLink href="https://temporal.io/cloud">Temporal Cloud</DocsExternalLink> and a slimmer Railway deploy (step 4 below).</p>
</Callout>

4. **Alternatively**, <DocsExternalLink href="https://temporal.io/cloud">Temporal Cloud</DocsExternalLink> with **only the API** on Railway: set <Badge text="TEMPORAL_ADDRESS" variant="envBackend" /> to Cloud’s endpoint and deploy that service from the Railway dashboard or CLI—you do **not** import the full-stack Railway compose for this slimmer layout.

**B — Vercel: serverless API + Temporal outside Vercel**

The backend **requires** a Temporal cluster for workflows. Vercel does **not** run Temporal, so you **must** pair the API with Temporal elsewhere—typically <DocsExternalLink href="https://temporal.io/cloud">Temporal Cloud</DocsExternalLink>, or another cluster whose gRPC endpoint is reachable from serverless (often **TLS**). You are not choosing “API without Temporal”; you are choosing **where Temporal runs** while the API stays on Vercel.

1. **Temporal first:** create or use a Temporal namespace (Cloud or your own) and note the gRPC address, namespace, and any TLS settings your worker/API will need.
2. Create a Vercel project with **Root Directory** <Badge text="backend" variant="path" /> (see <a href="/docs/Installation/vercel">Vercel</a> for build warnings and CLI).
3. Set production env (mirror <Badge text="backend/.env.production.local" variant="envFile" />): Supabase, <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />, <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" />, <Badge text="TEMPORAL_ADDRESS" variant="envBackend" /> (Temporal Cloud or your cluster’s endpoint), <Badge text="TEMPORAL_NAMESPACE" variant="envBackend" /> if needed, optional Redis, etc.
4. **Deploy** — from the repository root:

```bash
pnpm vercel:deploy:backend:prod
```

Do **not** run the Vercel build locally inside <Badge text="backend/" variant="path" /> — it can delete sources.

**Railway API + Temporal Cloud (no self-hosted stack on Railway):** use **A** step 4—only the API on Railway with <Badge text="TEMPORAL_ADDRESS" variant="envBackend" /> pointing at Cloud is valid if you skip the canvas-imported API + worker + Redis + Temporal bundle.

###  Deploy the web app (usually Vercel)

1. Create a Vercel project with **Root Directory** <Badge text="web" variant="path" />.
2. Set **Production** env (match <Badge text="web/.env.production.local" variant="envFile" />): <Badge text="VITE_API_BASE_URL" variant="envWeb" /> → your **backend** origin, <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" />, Supabase <Badge text="VITE_*" variant="envWeb" /> keys, etc.
3. **Deploy** — from the repository root:

```bash
pnpm vercel:deploy:web:prod
```

###  CORS, OAuth, and webhooks

- Put apex and <code>www</code> in <Badge text="ALLOWED_FRONTEND_ORIGINS" variant="envCors" /> on the backend if you use both.
- OAuth redirect URIs → production **frontend** URL.
- Stripe webhooks to **backend** URL.

Details: <a href="/docs/Installation/vercel">Vercel</a> (CORS callout).

###  Custom domains (optional)

Add domains in each project, fix DNS, then keep <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" />, <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />, and <Badge text="VITE_*" variant="envWeb" /> aligned.

### Workers (orchestrator, if applicable)

The **Temporal worker** runs workflows (e.g. refresh) on task queue <code>main</code>. It is a **different process** from the API (<code>node dist/app.js</code>), not a sidecar inside the API container.

**Railway (canvas)** — the template <Badge text="infra/docker-compose.railway.example.yaml" variant="path" /> (and your gitignored <Badge text="infra/docker-compose.railway.yaml" variant="path" /> copy) defines <code>api</code> and <code>worker</code> with the same backend image; <code>worker</code> runs <code>node dist/temporal/worker.js</code>. After import, **Git** redeploys services as needed; you do not run a second deploy command only for the worker.

**Reference (local Docker)** — <Badge text="infra/docker-compose.full-stack.example.yaml" variant="path" /> is the same topology with <code>env_file</code> on both services.

**CLI (optional)** — from the repository root, <code>pnpm railway:deploy:backend-compose:prod</code> uploads **one** linked service (see step A above). It does **not** replace canvas wiring for the full stack unless you have already created equivalent services manually.

**Beyond one replica** — versioning, scaling, and splitting workers across platforms follow Temporal’s guidance: <DocsExternalLink href="https://docs.temporal.io/production-deployment/worker-deployments">Temporal — Worker deployments</DocsExternalLink> (Worker Versioning, Kubernetes controller, etc.).

**Without Docker Compose** (VM, systemd, an extra container on Fly/ECS) — build the backend, then run the worker from the **repository root**:

```bash
pnpm --filter ./backend build
pnpm start:prod:worker
```

(<code>start:prod:worker</code> is a root alias for <code>pnpm --filter ./backend worker:start</code>.)

**Extra worker replica (Docker)** — <strong>optional</strong>. With the canvas-imported stack, the <code>worker</code> service already runs one worker process; you do <strong>not</strong> need this <code>docker run</code> for a normal Railway deploy. Use the snippet below only for an <strong>additional</strong> worker container (extra capacity, another host, or experiments)—same image as the API, override command:

```bash
docker run \
  --env-file infra/api.full-stack.env \
  <your-registry>/openquok-backend:<tag> \
  node dist/temporal/worker.js
```

Platform layout and Railway notes: <a href="/docs/Installation/temporal-workers-railway">Temporal, workers &amp; Railway</a>.

### Smoke-test

- Open the **web** URL and sign in (Supabase).
- Hit a backend route that uses Temporal and check logs (**Railway** or **Vercel** depending on where the API runs).

</Steps>

## Related detail pages

<CardGrid>
<LinkCard title="Temporal, workers & Railway" description="Task queue, orchestrator, Railway Temporal stack" href="/docs/Installation/temporal-workers-railway" />
<LinkCard title="Vercel" description="CLI prompts, build warnings, web-only steps" href="/docs/Installation/vercel" />
<LinkCard title="Docker & Compose" description="Local stack, full-stack compose example, API image" href="/docs/Installation/docker" />
<LinkCard title="Backend configuration" description="Env reference and Supabase" href="/docs/configuration-backend" />
<LinkCard title="Web configuration" description="Vite and SvelteKit env" href="/docs/configuration-web" />
</CardGrid>
