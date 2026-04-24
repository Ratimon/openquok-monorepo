/**
 * Flowcraft long-running orchestration: transport, queue names, and enable defaults.
 * Add new flows here as sibling entries instead of growing `.env.development.example` per flow.
 *
 * **Runtime transport override (optional):** `config/GlobalConfig.ts` reads env after these defaults:
 * - `ORCHESTRATOR_INTEGRATION_REFRESH_TRANSPORT` — `in_process` | `bullmq` (empty = use `integrationRefresh.transport` below).
 * - `ORCHESTRATOR_NOTIFICATION_EMAIL_TRANSPORT` — `in_process` | `bullmq` (empty = use `notificationEmail.transport` below).
 * - `ORCHESTRATOR_SCHEDULED_SOCIAL_POST_TRANSPORT` — `in_process` | `bullmq` (empty = use `scheduledSocialPost.transport` below).
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
 *
 * ## Scheduled social post (`scheduledSocialPost`)
 *
 * - **Transport**: set to `bullmq` and run `pnpm worker:scheduled-social-post-bullmq` so API-enqueued jobs
 *   run at the publish time (BullMQ `delay`) and the worker calls provider `post` .
 * - `in_process` is only for tests (pass workflow dependencies) or same-process smoke runs; it does not replace
 *   long BullMQ delay for real schedules.
 * - **Missing posts rescan** (`missingPostRescanIntervalMs`)
 *   periodic DB scan for `QUEUE` rows in the publish window and re-enqueue Flowcraft runs (BullMQ did not get a job).
 *
 * ## Flowcraft BullMQ reconciler (all workers)
 *
 * - **`reconcilerIntervalMs` / `reconcilerStalledThresholdSeconds`**: [Redis-side reconciliation](https://flowcraft.js.org/guide/adapters/bullmq#reconciliation) for
 *   stalled workflow runs. Set `reconcilerIntervalMs` to `0` to disable.
 */
export type OrchestrationTransport = "in_process" | "bullmq";

export const flowcraftBullmqDefaults = {
    /** `createBullMQReconciler` — idle time before a run is considered stalled (see Flowcraft docs). */
    reconcilerStalledThresholdSeconds: 300,
    /** How often each BullMQ worker runs the reconciler; `0` = off. */
    reconcilerIntervalMs: 3_600_000,
} as const;

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
        transport: "bullmq" as OrchestrationTransport,
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
        transport: "bullmq" as OrchestrationTransport,
        /** How often the worker drains digest Redis lists (ms). */
        digestFlushIntervalMs: 300_000,
        /**
         * Minimum milliseconds between successful send-plain acquisitions (all BullMQ workers).
         * Uses Redis; set to `0` to disable. Aligns with queue-style spacing for outbound mail.
         */
        sendPlainMinIntervalMs: 700,
    },
    /**
     * Calendar scheduled posts: BullMQ `executeNode` run at `publish_date` (delay from enqueue), worker publishes to each channel.
     */
    scheduledSocialPost: {
        workerServiceName: "openquok-worker-scheduled-social-post",
        queueName: "scheduled-social-post",
        transport: "bullmq" as OrchestrationTransport,
        /** When false, `PostsService` does not enqueue the worker (local tests use Jest to avoid Redis). */
        enabled: true,
        /**
         * Re-scan `posts` for `QUEUE` rows whose slot passed but publish never ran (worker down, lost job).
         */
        missingPostRescanIntervalMs: 3_600_000,
    },
} as const;
