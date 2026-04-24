import { Queue } from "bullmq";
import { analyzeBlueprint } from "flowcraft";
import { config } from "backend/config/GlobalConfig.js";
import { createQueueIoredisClient } from "backend/connections/bullmq/createQueueIoredis.js";
import { logger } from "backend/utils/Logger.js";
import { buildScheduledSocialPostBlueprintDistributed } from "../../../blueprints/scheduledSocialPostBlueprint.js";
import { SCHEDULED_SOCIAL_POST_BLUEPRINT_ID } from "../../../blueprints/scheduledSocialPostFlowTypes.js";
import { seedScheduledSocialPostWorkflowContext } from "./seedScheduledSocialPostWorkflowContext.js";

const MAX_DELAY_MS = 0x7fffffff; // ~24.8 days; BullMQ uses 32-bit delay (see JobsOptions)

/**
 * Enqueues a scheduled post run for `post_group` at (approximately) the publish time.
 * we use BullMQ `delay` on the start jobs.
 */
export async function enqueueScheduledSocialPostDistributedRun(
    input: { organizationId: string; postGroup: string; delayMs?: number },
    options?: { queueName?: string }
): Promise<{ runId: string; enqueued: boolean }> {
    const redis = createQueueIoredisClient();
    const bullmq = config.bullmq as { scheduledSocialPost?: { queueName?: string } };
    const queueName = options?.queueName ?? bullmq.scheduledSocialPost?.queueName ?? "scheduled-social-post";
    const rawDelay = input.delayMs ?? 0;
    const delay = Math.max(0, Math.min(Math.floor(rawDelay), MAX_DELAY_MS));

    const blueprint = buildScheduledSocialPostBlueprintDistributed();
    const version = blueprint.metadata?.version;
    if (typeof version !== "string" || !version) {
        throw new Error("scheduled-social-post blueprint metadata.version is required for distributed runs");
    }

    const analysis = analyzeBlueprint(blueprint);
    const runId = crypto.randomUUID();

    await seedScheduledSocialPostWorkflowContext(redis, runId, {
        organizationId: input.organizationId,
        postGroup: input.postGroup,
        blueprintVersion: version,
    });

    const queue = new Queue(queueName, { connection: redis });
    try {
        const startJobs = analysis.startNodeIds.map((nodeId) => ({
            name: "executeNode" as const,
            data: { runId, blueprintId: SCHEDULED_SOCIAL_POST_BLUEPRINT_ID, nodeId },
            opts: { delay },
        }));
        await queue.addBulk(startJobs);
        logger.info({
            msg: "[Orchestrator] Enqueued scheduled social post workflow",
            runId,
            queueName,
            startNodes: analysis.startNodeIds,
            delayMs: delay,
        });
        return { runId, enqueued: true };
    } finally {
        await queue.close();
        await redis.quit();
    }
}
