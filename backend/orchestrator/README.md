# Orchestrator (workers and flows)

This folder holds Flowcraft blueprints, BullMQ adapters, and **long-running worker entrypoints**. When `config/orchestratorFlows.ts` uses `transport: "bullmq"`, the API only **enqueues** work; these processes **execute** it.

## Worker processes

| Script (local) | Role |
|----------------|------|
| `pnpm worker:integration-refresh-bullmq` | Flowcraft + `@flowcraft/bullmq-adapter` on `config.bullmq.queueName` (default `integration-refresh`). |
| `pnpm worker:notification-email-bullmq` | `BullMQAdapter` + Flowcraft (`blueprints/notificationEmailBlueprint.ts`, `nodes/notificationEmailNodes.ts`) on `config.bullmq.notificationEmail.queueName`. Blueprints: `notification-send-plain` (one mail per run) and `notification-digest-flush` (drain digest Redis lists). HTML under `emails/`; digest list keys and org delivery in `TransactionalNotificationEmailService`. Digest flush is re-enqueued on an interval from the worker process (new `runId` each tick). |

Both expect **Redis** at `REDIS_*` (and optional `REDIS_BULLMQ_DB`), matching the API and `GlobalConfig`.

## Production deployment (separate from serverless API)

HTTP hosts (for example Vercel) are a poor fit for these scripts: they are **intentionally long-lived** (`adapter.start()` / `Worker` loop until SIGTERM).

**Plan (to implement when ready):** deploy **two always-on services** from the same backend build, each with its own start command, sharing production env and Redis.

Suggested hosting (pick one vendor and stay consistent):

1. **Fly.io Machines** (recommended): two apps or two process groups, **min machines = 1** per worker so processes are not stopped while idle (important for integration refresh, which may sleep until token expiry).
2. **Railway**: two services, same repo, different start commands; avoid scale-to-zero if it stops the process during long waits.

**Production start commands** (after `pnpm build` from `backend/`):

```bash
node dist/orchestrator/worker/runIntegrationRefreshBullMqWorker.js
node dist/orchestrator/worker/runNotificationEmailBullMqWorker.js
```

Local scripts use `tsx` and `NODE_ENV=development`; production should use **`node`** on **`dist/`** and **`NODE_ENV=production`**, with the same secrets as the API (`SUPABASE_SERVICE_ROLE_KEY`, email flags, and so on).

## Operational notes

- **Integration refresh** ticks can **sleep until access-token expiry** (see `nodes/refreshTokenNodes.ts` and `sleepChunked.ts`). Validate BullMQ **lock / stalled** settings if jobs run longer than default worker visibility windows.
- **Notification digest** flush interval: `orchestratorFlows.notificationEmail.digestFlushIntervalMs` (passed through `config.bullmq.notificationEmail`).

## Configuration source of truth

- `backend/config/orchestratorFlows.ts` — queue names, `in_process` vs `bullmq`, integration enablement.
- `backend/config/GlobalConfig.ts` — env-backed wiring exposed as `config.bullmq`.
