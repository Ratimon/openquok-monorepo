---
title: Backend orchestrator workflows
description: How OpenQuok uses Flowcraft for long-running in-process integration refresh timing.
order: 15
lastUpdated: 2026-04-05
---

<script>
import { DocsExternalLink } from '$lib/ui/components/docs/mdx/index.js';
</script>

# Backend orchestrator workflows

Social integrations that expose <code>refreshCron</code> need a **supervisor** that waits until the stored access token is close to expiry, then calls the provider refresh path and updates the database. The API runs this supervisor **in the same Node process** using the <DocsExternalLink href="https://flowcraft.js.org/">flowcraft</DocsExternalLink> package.

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

This pattern **does not survive process restarts**: if the API redeploys during a sleep, the supervisor for that integration is gone until the next OAuth connect or manual trigger. A dedicated workflow runtime would persist timers and replay; we document the trade-off so operators know what to expect.

## Configuration

Controlled under <code>config.integrations.integrationRefreshOrchestrator</code> in <code>GlobalConfig.ts</code>:

- **Jest**: disabled by default (presence of <code>JEST_WORKER_ID</code>) so tests do not block on a long sleep. Set <code>ENABLE_INTEGRATION_REFRESH_ORCHESTRATOR=true</code> to run the supervisor in a test.
- **Elsewhere**: unset uses the default above; set <code>ENABLE_INTEGRATION_REFRESH_ORCHESTRATOR=false</code> to turn it off, or <code>true</code> to force it on.

See commented keys in <code>backend/.env.development.example</code>.

## Further reading

- <DocsExternalLink href="https://flowcraft.js.org/guide/fluent">Fluent API</DocsExternalLink>
- <DocsExternalLink href="https://flowcraft.js.org/guide/pausing">Pausing and sleep nodes</DocsExternalLink> (this workflow uses an imperative delay inside <code>tick</code> because the wait length comes from the database at runtime)
