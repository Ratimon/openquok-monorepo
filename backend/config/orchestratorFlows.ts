/**
 * Flowcraft long-running orchestration: transport, queue names, and enable defaults.
 * Add new flows here as sibling entries instead of growing `.env.development.example` per flow.
 *
 * **Runtime transport override (optional):** `config/GlobalConfig.ts` reads env after these defaults:
 * - `ORCHESTRATOR_INTEGRATION_REFRESH_TRANSPORT` — `in_process` | `bullmq` (empty = use `integrationRefresh.transport` below).
 * - `ORCHESTRATOR_NOTIFICATION_EMAIL_TRANSPORT` — `in_process` | `bullmq` (empty = use `notificationEmail.transport` below).
 * Invalid values log a warning and keep the default from this file. Use this to flip BullMQ vs in-process
 * without editing TypeScript (local dev, CI matrix, or orchestrator Jest when set before `GlobalConfig` loads).
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
 *
 * ## Notification email (`notificationEmail`)
 *
 * - **Transport**: `notificationEmail.transport` is `in_process` (send from the API process) or `bullmq`.
 *   For `bullmq`, run `pnpm worker:notification-email-bullmq` and set `transport` to `bullmq` here or via
 *   `ORCHESTRATOR_NOTIFICATION_EMAIL_TRANSPORT`.
 * - **Digest**: when `NotificationService.inAppNotification` is called with `digest: true`, entries are
 *   stored in Redis and the worker flushes them on `notificationEmail.digestFlushIntervalMs`.
 */
export type OrchestrationTransport = "in_process" | "bullmq";

export const orchestratorFlows = {
    /** OAuth-connected integrations with refreshCron: supervisor after OAuth completes. */
    integrationRefresh: {
        /** Passed through to `config.bullmq.integrationRefresh.enabled` when not under Jest. */
        enabled: true,
        /**
         * Suggested long-running worker service name (e.g. on Railway) for this flow.
         * Keep distinct per worker type so logs/metrics and deployments are unambiguous.
         */
        workerServiceName: "openquok-worker-integration-refresh",
        queueName: "integration-refresh",
        transport: "in_process" as OrchestrationTransport,
    },
    /**
     * Org notification emails: immediate sends enqueue `sendPlain` jobs; digest appends to Redis and the
     * notification-email worker flushes on a fixed interval.
     */
    notificationEmail: {
        /**
         * Suggested long-running worker service name (e.g. on Railway) for this flow.
         * Keep distinct per worker type so logs/metrics and deployments are unambiguous.
         */
        workerServiceName: "openquok-worker-notification-email",
        queueName: "notification-email",
        transport: "in_process" as OrchestrationTransport,
        /** How often the worker drains digest Redis lists (ms). */
        digestFlushIntervalMs: 300_000,
        /**
         * Minimum milliseconds between successful send-plain acquisitions (all BullMQ workers).
         * Uses Redis; set to `0` to disable. Aligns with queue-style spacing for outbound mail.
         */
        sendPlainMinIntervalMs: 700,
    },
} as const;
