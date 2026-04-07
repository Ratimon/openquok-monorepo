import { Queue } from "bullmq";
import { analyzeBlueprint } from "flowcraft";
import { config } from "backend/config/GlobalConfig.js";
import { createQueueIoredisClient } from "backend/connections/bullmq/createQueueIoredis.js";
import { logger } from "backend/utils/Logger.js";
import { buildNotificationSendPlainBlueprintDistributed } from "../../blueprints/notificationEmailBlueprint";
import { NOTIFICATION_SEND_PLAIN_BLUEPRINT_ID } from "../../blueprints/notificationEmailFlowTypes";
import { seedNotificationSendPlainWorkflowContext } from "./seedNotificationEmailWorkflowContext";

/**
 * Enqueues the notification-send-plain Flowcraft blueprint on BullMQ (`executeNode` jobs).
 * Caller opens and closes its own Redis connection.
 */
export async function enqueueNotificationSendPlainDistributedRun(
    payload: { to: string; subject: string; html: string; replyTo?: string },
    options?: { queueName?: string }
): Promise<{ runId: string; enqueued: boolean }> {
    const redis = createQueueIoredisClient();
    const bullmq = config.bullmq as { notificationEmail?: { queueName?: string } };
    const queueName = options?.queueName ?? bullmq.notificationEmail?.queueName ?? "notification-email";

    const blueprint = buildNotificationSendPlainBlueprintDistributed();
    const version = blueprint.metadata?.version;
    if (typeof version !== "string" || !version) {
        throw new Error("notification-send-plain blueprint metadata.version is required for distributed runs");
    }

    const analysis = analyzeBlueprint(blueprint);
    const runId = crypto.randomUUID();

    await seedNotificationSendPlainWorkflowContext(redis, runId, {
        ...payload,
        blueprintVersion: version,
    });

    const queue = new Queue(queueName, { connection: redis });
    try {
        const startJobs = analysis.startNodeIds.map((nodeId) => ({
            name: "executeNode" as const,
            data: { runId, blueprintId: NOTIFICATION_SEND_PLAIN_BLUEPRINT_ID, nodeId },
        }));
        await queue.addBulk(startJobs);
        logger.info({
            msg: "[Orchestrator] Enqueued notification send-plain workflow",
            runId,
            queueName,
            startNodes: analysis.startNodeIds,
        });
        return { runId, enqueued: true };
    } finally {
        await queue.close();
        await redis.quit();
    }
}
