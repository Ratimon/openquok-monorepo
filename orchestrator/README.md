# Orchestrator (workers and flows)

This folder holds Flowcraft blueprints, BullMQ adapters, and **long-running worker entrypoints**. When `config/orchestratorFlows.ts` uses `transport: "bullmq"`, the API only **enqueues** work; these processes **execute** it.

## Worker processes

| Script (local) | Role |
|----------------|------|
| `pnpm worker:integration-refresh-bullmq` (from repo root: `pnpm --filter openquok-orchestrator worker:integration-refresh-bullmq`, or `pnpm worker:integration-refresh-bullmq` via the `backend` package script) | Flowcraft + `@flowcraft/bullmq-adapter` on `config.bullmq.integrationRefresh.queueName` (default `integration-refresh`). |
| `pnpm worker:housekeeping-bullmq` (alias `worker:notification-email-bullmq`) | `BullMQAdapter` + Flowcraft (`blueprints/notificationEmailBlueprint.ts`, `nodes/notificationEmailNodes.ts`) on `config.bullmq.notificationEmail.queueName`. Blueprints: `notification-send-plain` (one mail per run) and `notification-digest-flush` (drain digest Redis lists). HTML under `backend/emails/`; digest list keys and org delivery in `TransactionalNotificationEmailService`. Digest flush is re-enqueued on an interval from the worker process (new `runId` each tick). Also runs `DirectorySeoService.runWeeklyRefresh()` on `config.directorySeo.weeklyRefreshIntervalMs` when enabled. |
| `pnpm worker:scheduled-social-post-bullmq` | Flowcraft + BullMQ on `config.bullmq.scheduledSocialPost.queueName` (default `scheduled-social-post`). Runs the `scheduled-social-post` blueprint at `publish_date` and publishes to each social channel. Starts the [Flowcraft BullMQ reconciler](https://flowcraft.js.org/guide/adapters/bullmq#reconciliation) (shared config under `config.bullmq.flowcraft`) and, when `missingPostRescanIntervalMs` is a positive number, a timer that rescans the DB for queue rows that should have published but did not (re-enqueue with delay 0). |

All expect **Redis** at `REDIS_*` (and optional `REDIS_BULLMQ_DB`), matching the API and `GlobalConfig`.

### Environment variables (minimal surface)

`GlobalConfig` still builds the full config object when a worker starts, but **you only need to inject the values the worker code path reads**. Prefer a **small secret set per worker** in production instead of copying the entire API `.env`.

**Shared by all workers**

| Variable | Notes |
|----------|--------|
| `NODE_ENV` | Use `production` in deployed workers. |
| `PUBLIC_SUPABASE_URL` | Required for repository / service clients. |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | New publishable key (`sb_publishable_…`). Required; legacy `anon` JWT is not accepted. See [Upcoming changes to Supabase API Keys](https://github.com/orgs/supabase/discussions/29260). |
| `SUPABASE_SECRET_KEY` | New secret key (`sb_secret_…`). Server-side only. Required in production for tables used by refresh, notifications, and scheduled posts. Legacy `service_role` JWT is not accepted. |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`, `REDIS_BULLMQ_DB` | Match the API’s queue/cache Redis; defaults exist for local Redis. |
| `BULLMQ_WORKER_LOCK_DURATION_MS` | Optional. Flowcraft jobs use this as BullMQ `lockDuration` (default **600000** ms = 10 min). The upstream `@flowcraft/bullmq-adapter` did not set this; BullMQ’s **30s** default can cause `Error: could not renew lock for job …` when a node runs longer (OAuth refresh, slow HTTP). |
| `ORCHESTRATOR_WORKER_HEALTH_PORT` | Optional. HTTP port for `GET /health` and `GET /health/status` (Redis PING + queue depth). Explicit value wins; on Railway (`RAILWAY_ENVIRONMENT` set) unset uses injected **`PORT`**; locally defaults to **`3091`** so API **`PORT=3000`** in `.env` is not reused. `pnpm dev:worker:*` also sets **`3091`**. Set **`0`** to disable. |
| `SENTRY_DSN`, `SENTRY_ENABLED` | Optional. Same as the API; workers initialize Sentry on boot and report uncaught errors. Tag: `openquok.worker`. |

**Integration refresh worker only**

| Variable | Notes |
|----------|--------|
| Provider OAuth / app secrets (e.g. `THREADS_APP_ID`, `THREADS_APP_SECRET`, …) | Only for integrations you actually refresh; refresh fails for a provider if its secrets are missing when that job runs. |

**Housekeeping worker only** (notification email + Directory SEO weekly refresh)

| Variable | Notes |
|----------|--------|
| `EMAIL_ENABLED` | Set `true` to send; otherwise sending paths stay off. |
| `RESEND_SECRET_KEY` | Production SMTP via Resend when set. |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Dev / SES paths when not using Resend. |
| `SITE_NAME`, `SENDER_EMAIL_ADDRESS` | Identity in mail (defaults exist). |
| `DATAFORSEO_API_KEY` | Base64 `login:password` for Directory SEO domain rating refresh. |
| `DIRECTORY_SEO_ENABLED`, `DIRECTORY_SEO_CACHE_TTL_HOURS`, `DIRECTORY_SEO_WEEKLY_REFRESH_ENABLED`, `DIRECTORY_SEO_WEEKLY_REFRESH_INTERVAL_MS` | Weekly stale-domain sweep (default interval 7 days). |

**Scheduled social post worker only**

| Variable | Notes |
|----------|--------|
| Provider / channel credentials | Same model as the API: whatever integrations and OAuth secrets you need to publish the channels you use (e.g. Threads). Missing secrets surface as failed publishes for that path. |

**Optional**

| Variable | Notes |
|----------|--------|
| `ORCHESTRATOR_INTEGRATION_REFRESH_TRANSPORT`, `ORCHESTRATOR_NOTIFICATION_EMAIL_TRANSPORT`, `ORCHESTRATOR_SCHEDULED_SOCIAL_POST_TRANSPORT` | Mainly for the **API** (how enqueues are sent); set `=bullmq` in worker env so config matches production intent. Workers consume queues when running. |

Env files are loaded from the **`backend` package directory** (resolved from the installed `backend` module), not from the worker process `cwd`, so you can keep using `backend/.env.production.local`.

## Unit tests (orchestrator package)

| Command | What it runs |
|---------|----------------|
| `pnpm test:unit` | All `*.unit.test.ts` in this package. |
| `pnpm test:unit:refresh-token-workflow:in-process` | `flows/refreshTokenWorkflow.unit.test.ts` (in-process; default Jest clears `ORCHESTRATOR_*_TRANSPORT` so local `.env` does not force BullMQ). |
| `pnpm test:unit:refresh-token-workflow:bullmq` | `*.bullmq.unit.test.ts` for integration refresh, via `jest.bullmq.config.js` (env not cleared). |
| `pnpm test:unit:notification-email-workflow` | `flows/notificationEmailWorkflow.unit.test.ts` |
| `pnpm test:unit:scheduled-social-post-workflow` | `flows/scheduledSocialPostWorkflow.unit.test.ts` (in-process Flowcraft and BullMQ enqueue paths, without a second Jest config). |
| `pnpm test:unit:missing-scheduled-post-reconciliation` | `flows/missingScheduledPostReconciliation.unit.test.ts` |
| `pnpm test:unit` (includes) | `worker/workerHealthServer.unit.test.ts` |

## Production deployment (separate from serverless API)

HTTP hosts (for example Vercel) are a poor fit for these scripts: they are **intentionally long-lived** (`adapter.start()` / `Worker` loop until SIGTERM). Deploy them as **persistent services** (always-on containers), not serverless functions. Railway describes that model under [Services → persistent services](https://docs.railway.com/services#persistent-services).

### Railway (monorepo)

Use **one** Railway service **per** worker, all from the **same Git repo**. Configure the [monorepo root](https://docs.railway.com/deployments/monorepo) so install/build run from the repository root (or set a root directory and adjust paths).

**Build command** (repo root; produces `backend/dist`, `orchestrator/dist`, `common/dist`):

```bash
pnpm install && pnpm railway:orchestrator:build
```

(`railway:orchestrator:build` is an alias for `pnpm orchestrator:build:deps`.)

**Infrastructure as Code** — build, start, health check, region (`us-west2`), and replica limits live in [`.railway/railway.ts`](../.railway/railway.ts). Apply with `railway config plan` / `railway config apply` (see [`.railway/README.md`](../.railway/README.md)). Do not add repo-root `railway.toml` (deprecated Config as Code).

**Railpack** — each `orchestrator/railpack.*.json` appends `pnpm railway:orchestrator:build`, copies `*/dist` into the runtime image ([`.dockerignore`](../.dockerignore) excludes `**/dist`), includes mise shims so **`pnpm`** works at start, and sets `startCommand` to the matching `pnpm railway:orchestrator:start:*` script.

| Worker | Start (IaC + Railpack) |
|--------|--------|
| Integration refresh | `pnpm railway:orchestrator:start:integration-refresh` |
| Housekeeping | `pnpm railway:orchestrator:start:housekeeping` |
| Scheduled social post | `pnpm railway:orchestrator:start:scheduled-social-post` |

Equivalent from **`orchestrator/`** after deps are built:

```bash
pnpm start:worker:integration-refresh-bullmq
pnpm start:worker:housekeeping-bullmq
pnpm start:worker:scheduled-social-post-bullmq
```

Set **`NODE_ENV=production`** in Railway [Variables](https://docs.railway.com/variables) (or rely on Railway’s default) and add Redis / Supabase / worker env from the table above. Disable scale-to-zero (or equivalent) if your plan would stop the process during long integration-refresh sleeps.

### Railway CLI (deploy a worker service)

This matches the **separate worker service** pattern in Railway’s guide [Deploy an AI Agent with Async Workers](https://docs.railway.com/guides/ai-agent-workers): API elsewhere (e.g. Vercel), **Redis** (and your DB) in the project, and **always-on workers** that pull from the queue—here, BullMQ instead of a custom Redis list.

1. Install the CLI globally ([installation](https://docs.railway.com/develop/cli#installation)); the repo also lists `@railway/cli` as a devDependency if you prefer `pnpm exec railway …`.
2. `railway login` — authenticate.
3. In the Railway dashboard: create a project, add **Redis**, and expose the same connection details to the worker as **`REDIS_*`** (see the env table above—must match the API). Create an **empty** or Git-linked **worker** service for each process (integration refresh, notification email, scheduled social post, as needed).
4. From the **monorepo root**, link the CLI to the **target worker service**: `railway link` (pick project + service). For another worker, run `railway service` to point at the other service, or `railway unlink` then link again (see [Railway CLI](https://docs.railway.com/develop/cli)).
5. **Deploy** with `pnpm railway:deploy:<worker>` or `railway up` after linking the correct service.
6. Set **`RAILPACK_CONFIG_FILE`** to the matching `orchestrator/railpack.*.json` (setup scripts do this). Keep **build/start/limits** in sync via `.railway/railway.ts` (`railway config apply`).
7. Stream logs: `railway logs`.

**Run a worker locally with Railway-injected env** (after `railway link`, from monorepo root after `pnpm install`):  
`railway run pnpm railway:orchestrator:start:integration-refresh`, `railway run pnpm railway:orchestrator:start:housekeeping`, or `railway run pnpm railway:orchestrator:start:scheduled-social-post`.

### Other hosts

1. **Fly.io Machines**: one app (or one process group) per worker, **min machines = 1** for workers that must stay up when idle (important for integration refresh, which may sleep until token expiry).
2. Any container host: same **`pnpm railway:orchestrator:start:*`** (or `node orchestrator/dist/worker/...`) after the same build graph.

Local scripts use `tsx` and `NODE_ENV=development`; production uses **`node`** on **`orchestrator/dist/`** with the **minimal** env set for that worker (see the table above), not necessarily every API variable.

## Operational notes

- **Health checks** — Each worker serves `GET /health` and `GET /health/status` (200 when Redis is reachable; 500 otherwise). Point uptime monitors at your worker URL (on Railway, use the service’s public URL and the injected `PORT`). Response includes `worker`, `queueName`, `uptimeSeconds`, and BullMQ job counts when configured.
- **Sentry** — Workers load `backend/connections/sentry` on startup. Set `SENTRY_DSN` on worker services to capture uncaught exceptions and unhandled rejections (tagged `openquok.worker`).
- **Flowcraft BullMQ reconciler** (stalled / dropped jobs) runs in **each** `*BullMqWorker` with shared thresholds from `config.bullmq.flowcraft` (see [Flowcraft docs](https://flowcraft.js.org/guide/adapters/bullmq#reconciliation)).
- **Integration refresh** ticks can **sleep until access-token expiry** (see `nodes/refreshTokenNodes.ts` and `sleepChunked.ts`). Validate BullMQ **lock / stalled** settings if jobs run longer than default worker visibility windows.
- **Notification digest** flush interval: `orchestratorFlows.notificationEmail.digestFlushIntervalMs` (passed through `config.bullmq.notificationEmail`).
- **Scheduled social post** missing-row rescan: `orchestratorFlows.scheduledSocialPost.missingPostRescanIntervalMs` (0 disables the interval in the worker; first run still fires once on startup when the interval is enabled).

## Configuration source of truth

- `backend/config/orchestratorFlows.ts` — queue names, `in_process` vs `bullmq`, feature enablement, scheduled-post rescan interval.
- `backend/config/GlobalConfig.ts` — env-backed wiring exposed as `config.bullmq`.
