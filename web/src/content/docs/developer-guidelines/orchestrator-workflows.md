---
title: Backend orchestrator workflows
description: How OpenQuok uses Flowcraft for integration refresh, notification email, and scheduled social posts—in-process or on BullMQ workers.
order: 3
lastUpdated: 2026-04-24
---

<script>
import { Badge, Callout, DocsExternalLink } from '$lib/ui/components/docs/mdx/index.js';
</script>

# Backend orchestrator workflows

**Integration refresh:** Social integrations that expose <code>refreshCron</code> need a **supervisor** that waits until the stored access token is close to expiry, then calls the provider refresh path and updates the database. By default the API can run this supervisor **in the same Node process** using the <DocsExternalLink href="https://flowcraft.js.org/">flowcraft</DocsExternalLink> package. You can instead enqueue the same blueprint on **BullMQ** so a separate worker process executes it (<DocsExternalLink href="https://flowcraft.js.org/guide/distributed-execution">distributed execution</DocsExternalLink>, <DocsExternalLink href="https://flowcraft.js.org/guide/adapters/bullmq">BullMQ adapter</DocsExternalLink>).

**Notification email** and **scheduled social** posting use the same model: <code>orchestratorFlows</code> defaults plus optional <Badge text="ORCHESTRATOR_*" variant="envBackend" /> transport overrides, with dedicated Flowcraft blueprints and workers when you choose <code>transport: "bullmq"</code>.

## Where the code lives

### Integration refresh (OAuth token supervisor)

- Blueprint and tick logic: <code>orchestrator/flows/refreshTokenWorkflow.ts</code>
- Activity-style steps (timeout + retries on failure): <code>orchestrator/activities/integrationRefreshActivities.ts</code>
- OAuth completion starts the supervisor from <code>RefreshIntegrationService.startRefreshWorkflow</code> (fire-and-forget).

### Notification email

- Blueprint: <code>orchestrator/blueprints/notificationEmailBlueprint.ts</code> (plain send + digest flush paths).

### Scheduled social posts (calendar)

- Enqueue and in-process / BullMQ entry: <code>orchestrator/flows/scheduledSocialPostWorkflow.ts</code> (blueprint <code>scheduled-social-post</code>, one publish pass per org/post group)
- Node implementation: <code>orchestrator/nodes/scheduledSocialPostNodes.ts</code>; publish path: <code>orchestrator/activities/scheduledSocialPostExecution.ts</code>
- If the worker is down, optional **rescan** re-lists <code>QUEUE</code> posts that should have published and re-enqueues: <code>orchestrator/flows/missingScheduledPostReconciliation.ts</code> (interval from <code>orchestratorFlows.scheduledSocialPost.missingPostRescanIntervalMs</code>)

### Shared

- Barrel exports: <code>orchestrator/index.ts</code>
- Per-flow transport, queue names, and feature flags: <code>backend/config/orchestratorFlows.ts</code> (defaults in TypeScript). Optional runtime overrides (without editing that file): <Badge text="ORCHESTRATOR_INTEGRATION_REFRESH_TRANSPORT" variant="envBackend" />, <Badge text="ORCHESTRATOR_NOTIFICATION_EMAIL_TRANSPORT" variant="envBackend" />, and <Badge text="ORCHESTRATOR_SCHEDULED_SOCIAL_POST_TRANSPORT" variant="envBackend" /> — each <code>in_process</code> or <code>bullmq</code> — merged in <code>backend/config/GlobalConfig.ts</code>.

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

With <code>transport: bullmq</code> in <code>backend/config/orchestratorFlows.ts</code>, run state and the job queue live in **Redis**, and you run a **worker process** for each flow you enable:

- **Integration refresh** — <code>pnpm orchestrator:dev:worker:integration-refresh-bullmq</code> locally (or <code>pnpm worker:integration-refresh-bullmq</code> under <code>backend/</code>); **production** <code>pnpm railway:orchestrator:start:integration-refresh</code> after <code>pnpm railway:orchestrator:build</code>, on an always-on host such as <a href="/docs/Installation/railway">Railway</a>.
- **Notification email** (when that transport is <code>bullmq</code>) — <code>pnpm railway:orchestrator:start:notification-email</code> in production; local <code>pnpm orchestrator:dev:worker:notification-email-bullmq</code>.
- **Scheduled social posts** (when that transport is <code>bullmq</code>) — <code>pnpm railway:orchestrator:start:scheduled-social-post</code> in production (Railway); local <code>pnpm orchestrator:dev:worker:scheduled-social-post-bullmq</code>.

For integration refresh, that improves durability across API deploys, but each <code>tick</code> still performs a long in-node sleep while a worker job is active (see Flowcraft pause/sleep guidance). Tune BullMQ concurrency and monitor queue depth accordingly.

Managed Redis (for example <DocsExternalLink href="https://redis.io/">Redis</DocsExternalLink> Cloud) works the same as for cache: set <code>REDIS_*</code> and optionally <code>REDIS_BULLMQ_DB</code>; see <a href="/docs/configuration-backend/redis/">Redis cache</a>. Workers must use the **same** Redis as the API. Env and deployment: <a href="/docs/configuration-worker">Orchestrator workers</a>.

## Configuration

- **Transport, queue names, and feature flags**: <code>backend/config/orchestratorFlows.ts</code> (for example <code>integrationRefresh.enabled</code> and <code>scheduledSocialPost.missingPostRescanIntervalMs</code>). <code>GlobalConfig.ts</code> copies <code>integrationRefresh.enabled</code> into <code>config.bullmq.integrationRefresh.enabled</code> except under Jest, where it is always <code>false</code>; <code>scheduledSocialPost.enabled</code> is also forced <code>false</code> under Jest. Add future flows as sibling entries instead of per-flow keys in <code>backend/.env.development.example</code>.
- **Jest**: <code>JEST_WORKER_ID</code> forces the integration-refresh supervisor off regardless of <code>integrationRefresh.enabled</code>. To test the supervisor, mock <code>config</code> or reload modules with different <code>orchestratorFlows</code> settings.
- **Elsewhere**: toggle <code>integrationRefresh.enabled</code> and other flow flags in code for the deployment profile you want (or split config by environment in that file).

## Testing

- **Unit (integration refresh)**: <code>orchestrator/flows/refreshTokenWorkflow.unit.test.ts</code> drives <code>runRefreshTokenOrchestration</code> with mocked activities and chunked sleep so cases finish fast. It also demonstrates <DocsExternalLink href="https://flowcraft.js.org/guide/testing">Flowcraft testing utilities</DocsExternalLink>: <code>InMemoryEventLogger</code> (pass <code>eventBus</code> into the runner), <code>runWithTrace</code>, and <code>createStepper</code> from <code>flowcraft/testing</code>. <code>orchestrator/flows/refreshTokenWorkflow.bullmq.unit.test.ts</code> runs with <code>jest.bullmq.config.js</code> (env for <code>ORCHESTRATOR_INTEGRATION_REFRESH_TRANSPORT</code> is not reset). For replay/CLI-style inspection against persisted events, see <DocsExternalLink href="https://flowcraft.js.org/guide/time-travel">time-travel debugging</DocsExternalLink> and the <DocsExternalLink href="https://flowcraft.js.org/guide/cli">CLI tool</DocsExternalLink>—those need a persistent event store, not just unit mocks.
- **Unit (notification email)**: <code>orchestrator/flows/notificationEmailWorkflow.unit.test.ts</code>
- **Unit (scheduled social)**: <code>orchestrator/flows/scheduledSocialPostWorkflow.unit.test.ts</code> (in-process Flowcraft and mock enqueue for the BullMQ branch in one Jest run); <code>orchestrator/flows/missingScheduledPostReconciliation.unit.test.ts</code> for the DB rescan helper.
- **Conventions**: Repository guidance for workflow tests (Jest + <code>flowcraft/testing</code>, Faker, when to mock <code>config</code> vs call the runner directly) lives in the backend test-suites Cursor rule (<code>.cursor/rules/backend-test-suites.mdc</code>, section on orchestrator workflows).

## BullMQ reconciliation (Flowcraft adapter)

The <DocsExternalLink href="https://flowcraft.js.org/guide/adapters/bullmq#reconciliation">BullMQ adapter guide</DocsExternalLink> describes <code>createBullMQReconciler</code>: it scans Redis keys that hold workflow state, treats runs idle longer than a threshold as **stalled**, and **re-enqueues** the appropriate next jobs so a worker can continue. That is aimed at production reliability when jobs or workers disappear between steps.

<Callout type="note" title="What OpenQuok does">
Each <code>*BullMqWorker</code> in <code>orchestrator/worker/</code> starts a **timer** that runs the Flowcraft adapter reconciler on the **same** Redis <code>connection</code> as the long-lived <code>adapter</code> (see <code>orchestrator/worker/flowcraftBullMqReconciliationTimer.ts</code>). Intervals and stall thresholds come from <code>config.bullmq.flowcraft</code> in <code>backend/config/GlobalConfig.ts</code> (sourced from <code>orchestratorFlows</code> defaults). <strong>Integration refresh</strong> benefits when workflow state is in Redis but <strong>no</strong> BullMQ job is driving the next <code>executeNode</code>—not when one job is still running for hours on a single worker. <strong>Scheduled social</strong> and <strong>notification email</strong> workers use the same pattern for their queues.
</Callout>

## Clearing stale Flowcraft runs (Redis)

If you deploy a workflow change and see runs failing repeatedly with errors like:

- <code>Implementation for 'fn_…' not found</code>
- <code>Blueprint with ID '…' not found</code>

those are usually **stale workflow runs** persisted in Redis from an older build. The BullMQ reconciler will keep resuming them until you delete their run state keys.

OpenQuok provides a helper script that deletes Flowcraft run state for a specific <code>blueprintId</code>:

```bash
pnpm --filter openquok-orchestrator script:clear-flowcraft-runs scheduled-social-post
```

It loads dotenv the same way workers do (via <code>backend/config/loadBackendDotenv.cjs</code>), so it works with:

- <code>backend/.env.development.local</code> when <code>NODE_ENV=development</code>
- <code>backend/.env.production.local</code> when <code>NODE_ENV=production</code>
- injected environment variables in production hosts (Railway, Fly, etc.)

<Callout type="warning" title="Be careful">
This deletes Redis keys for the selected blueprint (<code>workflow:state:*</code>, <code>flowcraft:blueprint:*</code>, <code>workflow:status:*</code>). It is safe when you are cleaning up broken runs after a deploy, but you should not run it casually in production during normal operation.
</Callout>

## BullMQ webhook endpoints (Flowcraft adapter)

The same <DocsExternalLink href="https://flowcraft.js.org/guide/adapters/bullmq#webhook-endpoints">guide</DocsExternalLink> describes wiring **HTTP routes** so external systems can POST payloads that resume workflows using Flowcraft **webhook** nodes (<code>Flow.createWebhook()</code> / wait-for-callback style graphs).

<Callout type="note" title="Applicability here">
The integration refresh workflow is only <code>begin</code> → loop <code>tick</code> → <code>finished</code>; it does <strong>not</strong> use webhook nodes, so <strong>this feature does not apply</strong> to the current refresh supervisor. It would matter only if you add another blueprint that pauses on a webhook.

Also, the <code>@flowcraft/bullmq-adapter</code> version used in this repo currently implements <code>registerWebhookEndpoint</code> by <strong>throwing</strong> (“not implemented”), so the guide’s webhook flow is <strong>not usable</strong> with the stock adapter here until upstream adds it or you provide a custom integration.
</Callout>

## Further reading

- <a href="/docs/configuration-worker">Orchestrator workers</a> — env vars, production scripts, dotenv resolution
- <a href="/docs/Installation/railway">Railway Deployment</a> — persistent services, CLI, <code>railway.toml</code>
- <DocsExternalLink href="https://flowcraft.js.org/guide/fluent">Fluent API</DocsExternalLink>
- <DocsExternalLink href="https://flowcraft.js.org/guide/pausing">Pausing and sleep nodes</DocsExternalLink> (this workflow uses an imperative delay inside <code>tick</code> because the wait length comes from the database at runtime)
- <DocsExternalLink href="https://flowcraft.js.org/guide/adapters/bullmq">Runtime adapter: BullMQ</DocsExternalLink> (reconciliation, webhooks, worker/client setup)
