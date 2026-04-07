/**
 * Ambient types for `import { … } from "openquok-orchestrator"` so the backend project stays rooted under `backend/`
 * (orchestrator sources live in `../orchestrator` and must not be pulled in as compilation roots).
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

    export function appendNotificationDigestEntry(
        redis: import("ioredis").default,
        organizationId: string,
        entry: import("openquok-common").DigestQueueEntry
    ): Promise<void>;
}
