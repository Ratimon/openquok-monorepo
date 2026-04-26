import { RedisCoordinationStore } from "@flowcraft/bullmq-adapter";
import type IORedis from "ioredis";
import { config } from "backend/config/GlobalConfig.js";
import { createQueueIoredisClient } from "backend/connections/bullmq/createQueueIoredis.js";
import { SafeBullMQAdapter } from "../safeBullMQAdapter.js";
import {
    buildNotificationDigestFlushBlueprintDistributed,
    buildNotificationSendPlainBlueprintDistributed,
    getNotificationEmailNodeRegistry,
} from "../../../blueprints/notificationEmailBlueprint.js";
import {
    NOTIFICATION_DIGEST_FLUSH_BLUEPRINT_ID,
    NOTIFICATION_SEND_PLAIN_BLUEPRINT_ID,
    type NotificationEmailWorkflowDependencies,
} from "../../../blueprints/notificationEmailFlowTypes.js";

/**
 * BullMQ + Flowcraft adapter for notification email (`notification-send-plain` and `notification-digest-flush`).
 * Use with `pnpm worker:notification-email-bullmq`.
 */
export function createNotificationEmailBullMqAdapter(
    workflowDependencies: NotificationEmailWorkflowDependencies
): {
    adapter: SafeBullMQAdapter;
    redis: IORedis;
} {
    const redis = createQueueIoredisClient();
    const coordinationStore = new RedisCoordinationStore(redis);
    const bullmq = config.bullmq as { notificationEmail?: { queueName?: string } };
    const queueName = bullmq.notificationEmail?.queueName ?? "notification-email";

    const sendPlainBlueprint = buildNotificationSendPlainBlueprintDistributed();
    const digestFlushBlueprint = buildNotificationDigestFlushBlueprintDistributed();

    const adapter = new SafeBullMQAdapter({
        connection: redis,
        coordinationStore,
        queueName,
        runtimeOptions: {
            blueprints: {
                [NOTIFICATION_SEND_PLAIN_BLUEPRINT_ID]: sendPlainBlueprint,
                [NOTIFICATION_DIGEST_FLUSH_BLUEPRINT_ID]: digestFlushBlueprint,
            },
            registry: getNotificationEmailNodeRegistry(),
            dependencies: workflowDependencies,
        },
    });

    return { adapter, redis };
}
