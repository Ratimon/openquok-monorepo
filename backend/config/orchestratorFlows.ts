/**
 * Flowcraft long-running orchestration: transport, queue names, and enable defaults.
 * Add new flows here as sibling entries instead of growing `.env.development.example` per flow.
 *
 * ## Integration token refresh (`integrationRefresh`)
 *
 * After OAuth, integrations with `refreshCron` can run a **supervisor** that sleeps until the access
 * token is near expiry, then refreshes and updates the database.
 *
 * - **Transport / queue**: `integrationRefresh.transport` (`in_process` | `bullmq`) and
 *   `integrationRefresh.queueName`. For `bullmq`, run `pnpm worker:integration-refresh-bullmq` and use
 *   the same Redis settings as cache (`REDIS_*`, optional `REDIS_BULLMQ_DB`).
 *
 * - **Enabled**: `integrationRefresh.enabled` is used when not running under Jest (`GlobalConfig.ts` maps it
 *   to `config.bullmq.integrationRefresh.enabled`). Under Jest (`JEST_WORKER_ID` set), the supervisor is
 *   always off so tests do not block on long sleeps. To exercise the supervisor in a test, mock `config` or
 *   adjust this file for that suite (e.g. with `jest.resetModules()`).
 */
export type OrchestrationTransport = "in_process" | "bullmq";

export const orchestratorFlows = {
    /** OAuth-connected integrations with refreshCron: supervisor after OAuth completes. */
    integrationRefresh: {
        /** Passed through to `config.bullmq.integrationRefresh.enabled` when not under Jest. */
        enabled: true,
        queueName: "integration-refresh",
        transport: "in_process" as OrchestrationTransport,
    },
} as const;
