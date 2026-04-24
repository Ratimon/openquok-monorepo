/**
 * Ambient types for `import { … } from "openquok-orchestrator"`.
 * `tsconfig.json` maps this specifier here so `tsc` does not follow the workspace package into `../orchestrator`
 * (those sources import `backend/...`, which would resolve to `dist/` outputs and collide with compilation — TS5055).
 * Runtime still resolves the real package via `workspace:*` and `openquok-orchestrator` package exports.
 */
declare module "openquok-orchestrator" {
    export function runRefreshTokenOrchestration(
        input: { integrationId: string; organizationId: string },
        workflowDependencies: {
            integrationRepository: import("../repositories/IntegrationRepository.js").IntegrationRepository;
            runRefresh: (
                row: import("../repositories/IntegrationRepository.js").IntegrationRow
            ) => Promise<false | import("../integrations/social.integrations.interface.js").AuthTokenDetails>;
        },
        options?: unknown
    ): Promise<boolean>;

    export function runNotificationSendPlainOrchestration(
        payload: { to: string; subject: string; html: string; replyTo?: string },
        options?: { queueName?: string }
    ): Promise<{ runId: string; enqueued: boolean }>;

    /**
     * Enqueues a delayed `scheduled-social-post` Flowcraft run when `scheduledSocialPost.transport` is `bullmq`.
     * In-process use requires the second-argument workflow dependencies (orchestrator / tests only).
     */
    export function runScheduledSocialPostOrchestration(
        input: { organizationId: string; postGroup: string; delayMs?: number },
        workflowDependencies?: {
            publishScheduledGroup: (input: { organizationId: string; postGroup: string }) => Promise<void>;
        },
        options?: unknown
    ): Promise<boolean>;

    export function appendNotificationDigestEntry(
        redis: import("ioredis").default,
        organizationId: string,
        entry: import("openquok-common").DigestQueueEntry
    ): Promise<void>;
}
