import type IORedis from "ioredis";

import { Queue } from "bullmq";
import { analyzeBlueprint } from "flowcraft";
import { config } from "backend/config/GlobalConfig.js";
import { logger } from "backend/utils/Logger.js";
import { buildNotificationDigestFlushBlueprintDistributed } from "../../../blueprints/notificationEmailBlueprint.js";
import { NOTIFICATION_DIGEST_FLUSH_BLUEPRINT_ID } from "../../../blueprints/notificationEmailFlowTypes.js";
import { seedNotificationDigestFlushWorkflowContext } from "./seedNotificationEmailWorkflowContext.js";

/**
 * Enqueues one `notification-digest-flush` Flowcraft run. Does **not** close `redis` (shared worker connection).
 */
export async function enqueueNotificationDigestFlushDistributedRun(
    redis: IORedis,
    options?: { queueName?: string }
): Promise<{ runId: string; enqueued: boolean }> {
    const bullmq = config.bullmq as { notificationEmail?: { queueName?: string } };
    const queueName = options?.queueName ?? bullmq.notificationEmail?.queueName ?? "notification-email";

    const blueprint = buildNotificationDigestFlushBlueprintDistributed();
    const version = blueprint.metadata?.version;
    if (typeof version !== "string" || !version) {
        throw new Error("notification-digest-flush blueprint metadata.version is required for distributed runs");
    }

    const analysis = analyzeBlueprint(blueprint);
    const runId = crypto.randomUUID();

    await seedNotificationDigestFlushWorkflowContext(redis, runId, version);

    const queue = new Queue(queueName, { connection: redis });
    try {
        const startJobs = analysis.startNodeIds.map((nodeId) => ({
            name: "executeNode" as const,
            data: { runId, blueprintId: NOTIFICATION_DIGEST_FLUSH_BLUEPRINT_ID, nodeId },
        }));
        await queue.addBulk(startJobs);
        logger.info({
            msg: "[Orchestrator] Enqueued notification digest-flush workflow",
            runId,
            queueName,
            startNodes: analysis.startNodeIds,
        });
        return { runId, enqueued: true };
    } finally {
        await queue.close();
    }
}
