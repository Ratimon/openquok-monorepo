---
title: Backend orchestrator workflows
description: How OpenQuok uses Flowcraft for long-running in-process integration refresh timing.
order: 3
lastUpdated: 2026-04-06
---

<script>
import { Callout, DocsExternalLink } from '$lib/ui/components/docs/mdx/index.js';
</script>

# Backend orchestrator workflows

Social integrations that expose <code>refreshCron</code> need a **supervisor** that waits until the stored access token is close to expiry, then calls the provider refresh path and updates the database. By default the API runs this supervisor **in the same Node process** using the <DocsExternalLink href="https://flowcraft.js.org/">flowcraft</DocsExternalLink> package. You can instead enqueue the same blueprint on **BullMQ** so a separate worker process executes it (<DocsExternalLink href="https://flowcraft.js.org/guide/distributed-execution">distributed execution</DocsExternalLink>, <DocsExternalLink href="https://flowcraft.js.org/guide/adapters/bullmq">BullMQ adapter</DocsExternalLink>).

## Where the code lives

- Blueprint and tick logic: <code>backend/orchestrator/flows/refreshTokenWorkflow.ts</code>
- Activity-style steps (timeout + retries on failure): <code>backend/orchestrator/activities/integrationRefreshActivities.ts</code>
- Barrel exports: <code>backend/orchestrator/index.ts</code>
- OAuth completion starts the supervisor from <code>RefreshIntegrationService.startRefreshWorkflow</code> (fire-and-forget).

## Activity-style resilience

Loads and token refresh run through helpers that mirror common durable-activity settings: **10 minutes** max per attempt, **3** attempts, **2 minutes** initial delay between attempts, backoff coefficient **1** (fixed delay). Retries apply when the step **throws** or hits the timeout; a normal `false` from refresh (provider failure handled inside the service) is **not** retried.

## Behavior (one iteration)

Each loop iteration:

1. Loads the integration by organization and id; stops if it is missing, soft-deleted, mid–OAuth step, or marked <code>refresh_needed</code>.
2. Computes milliseconds until <code>token_expiration</code>; stops if there is no expiry or the token is already expired.
3. Sleeps for that duration (chunked so individual timers stay within the 32-bit <code>setTimeout</code> limit).
4. Reloads the row and re-applies the same guards.
5. Runs <code>refresh</code> (provider token exchange + upsert). Stops if refresh fails.

The graph uses Flowcraft’s <DocsExternalLink href="https://flowcraft.js.org/guide/loops">loop construct</DocsExternalLink>: a <code>begin</code> node enters the loop controller; the body is a single <code>tick</code> node that performs the steps above. Continuation is driven by the workflow key <code>loopShouldContinue</code> (the loop controller evaluates conditions against flat serialized state, not a nested <code>context.*</code> path).

## Limits vs an external workflow engine

The default **in-process** transport **does not survive API restarts**: if the API redeploys during a sleep, the supervisor for that integration is gone until the next OAuth connect or manual trigger.

With <code>INTEGRATION_REFRESH_TRANSPORT=bullmq</code>, run state and the job queue live in **Redis**, and you run <code>pnpm worker:integration-refresh-bullmq</code> alongside the API. That improves durability across API deploys, but each <code>tick</code> still performs a long in-node sleep while a worker job is active (see Flowcraft pause/sleep guidance). Tune BullMQ concurrency and monitor queue depth accordingly.

Managed Redis (for example <DocsExternalLink href="https://redis.io/">Redis</DocsExternalLink> Cloud) works the same as for cache: set <code>REDIS_*</code> and optionally <code>REDIS_BULLMQ_DB</code>; see <a href="/docs/configuration-backend/redis/">Redis cache</a>.

## Configuration

Controlled in <code>GlobalConfig.ts</code>: <code>config.bullmq.integrationRefresh</code> (enable flag + transport) and <code>config.bullmq.queueName</code> (queue name when transport is <code>bullmq</code>).

- **Jest**: disabled by default (presence of <code>JEST_WORKER_ID</code>) so tests do not block on a long sleep. Set <code>ENABLE_INTEGRATION_REFRESH_ORCHESTRATOR=true</code> to run the supervisor in a test.
- **Elsewhere**: unset uses the default above; set <code>ENABLE_INTEGRATION_REFRESH_ORCHESTRATOR=false</code> to turn it off, or <code>true</code> to force it on.
- **Transport**: <code>INTEGRATION_REFRESH_TRANSPORT=in_process</code> (default) or <code>bullmq</code>. For BullMQ, set <code>INTEGRATION_REFRESH_BULLMQ_QUEUE</code> to override <code>config.bullmq.queueName</code>, configure Redis, and run the worker script from <code>backend/package.json</code>.

See commented keys in <code>backend/.env.development.example</code>.

## BullMQ reconciliation (Flowcraft adapter)

The <DocsExternalLink href="https://flowcraft.js.org/guide/adapters/bullmq#reconciliation">BullMQ adapter guide</DocsExternalLink> describes <code>createBullMQReconciler</code>: it scans Redis keys that hold workflow state, treats runs idle longer than a threshold as **stalled**, and **re-enqueues** the appropriate next jobs so a worker can continue. That is aimed at production reliability when jobs or workers disappear between steps.

<Callout type="note" title="Applicability here">
<strong>Relevant</strong> when you use <code>INTEGRATION_REFRESH_TRANSPORT=bullmq</code>: it is the documented way to recover runs that got stuck in Redis without an active BullMQ job. OpenQuok does <strong>not</strong> ship a cron or process that calls the reconciler yet; adding one (same Redis + adapter instance shape as the worker) would be a follow-up if you need that guarantee in production.
</Callout>

The refresh-token blueprint is a tight loop with long in-node sleeps; reconciliation mainly helps when state exists in Redis but **no worker is driving the next <code>executeNode</code> job**—not when a single job is still running for hours on one worker.

## BullMQ webhook endpoints (Flowcraft adapter)

The same <DocsExternalLink href="https://flowcraft.js.org/guide/adapters/bullmq#webhook-endpoints">guide</DocsExternalLink> describes wiring **HTTP routes** so external systems can POST payloads that resume workflows using Flowcraft **webhook** nodes (<code>Flow.createWebhook()</code> / wait-for-callback style graphs).

<Callout type="note" title="Applicability here">
The integration refresh workflow is only <code>begin</code> → loop <code>tick</code> → <code>finished</code>; it does <strong>not</strong> use webhook nodes, so <strong>this feature does not apply</strong> to the current refresh supervisor. It would matter only if you add another blueprint that pauses on a webhook.

Also, the <code>@flowcraft/bullmq-adapter</code> version used in this repo currently implements <code>registerWebhookEndpoint</code> by <strong>throwing</strong> (“not implemented”), so the guide’s webhook flow is <strong>not usable</strong> with the stock adapter here until upstream adds it or you provide a custom integration.
</Callout>

## Further reading

- <DocsExternalLink href="https://flowcraft.js.org/guide/fluent">Fluent API</DocsExternalLink>
- <DocsExternalLink href="https://flowcraft.js.org/guide/pausing">Pausing and sleep nodes</DocsExternalLink> (this workflow uses an imperative delay inside <code>tick</code> because the wait length comes from the database at runtime)
- <DocsExternalLink href="https://flowcraft.js.org/guide/adapters/bullmq">Runtime adapter: BullMQ</DocsExternalLink> (reconciliation, webhooks, worker/client setup)
