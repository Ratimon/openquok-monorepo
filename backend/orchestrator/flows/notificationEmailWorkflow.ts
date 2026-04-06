import type IORedis from "ioredis";
import { logger } from "../../utils/Logger";
import { enqueueNotificationDigestFlushDistributedRun } from "../adapters/flowcraft-bullmq/enqueueNotificationDigestFlushDistributedRun";
import { enqueueNotificationSendPlainDistributedRun } from "../adapters/flowcraft-bullmq/enqueueNotificationSendPlainDistributedRun";

export {
    NOTIFICATION_DIGEST_FLUSH_BLUEPRINT_ID,
    NOTIFICATION_DIGEST_FLUSH_BLUEPRINT_VERSION,
    NOTIFICATION_SEND_PLAIN_BLUEPRINT_ID,
    NOTIFICATION_SEND_PLAIN_BLUEPRINT_VERSION,
    type NotificationDigestFlushFlowContext,
    type NotificationEmailWorkflowDependencies,
    type NotificationSendPlainFlowContext,
} from "../blueprints/notificationEmailFlowTypes";

export {
    buildNotificationDigestFlushBlueprintDistributed,
    buildNotificationSendPlainBlueprintDistributed,
    createNotificationDigestFlushFlowBuilder,
    createNotificationSendPlainFlowBuilder,
    getNotificationEmailNodeRegistry,
} from "../blueprints/notificationEmailBlueprint";

/**
 * Enqueues one `notification-send-plain` Flowcraft run (BullMQ `executeNode` jobs).
 * Used when `notificationEmail.transport` is `bullmq` and `pnpm worker:notification-email-bullmq` is running.
 * For `in_process`, the API sends via `EmailService.sendPlain` instead (see `NotificationService.inAppNotification`).
 */
export async function runNotificationSendPlainOrchestration(
    payload: { to: string; subject: string; html: string; replyTo?: string },
    options?: { queueName?: string }
): Promise<{ runId: string; enqueued: boolean }> {
    try {
        return await enqueueNotificationSendPlainDistributedRun(payload, options);
    } catch (err) {
        logger.warn({
            msg: "[Orchestrator] Failed to enqueue notification send-plain workflow",
            error: err instanceof Error ? err.message : String(err),
        });
        return { runId: "", enqueued: false };
    }
}

/**
 * Enqueues one `notification-digest-flush` Flowcraft run. Does not close `redis` (shared worker connection).
 *
 * **Scheduling:** only `runNotificationEmailBullMqWorker` calls this on `setInterval` (`digestFlushIntervalMs`).
 * The API does not call it: digest lines are appended via `TransactionalNotificationEmailService.appendDigestEntry`
 * (Redis); this function starts the worker job that drains those lists and sends mail.
 */
export async function runNotificationDigestFlushOrchestration(
    redis: IORedis,
    options?: { queueName?: string }
): Promise<{ runId: string; enqueued: boolean }> {
    try {
        return await enqueueNotificationDigestFlushDistributedRun(redis, options);
    } catch (err) {
        logger.warn({
            msg: "[Orchestrator] Failed to enqueue notification digest-flush workflow",
            error: err instanceof Error ? err.message : String(err),
        });
        return { runId: "", enqueued: false };
    }
}
