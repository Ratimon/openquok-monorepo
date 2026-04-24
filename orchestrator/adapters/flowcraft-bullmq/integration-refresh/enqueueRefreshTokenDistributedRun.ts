import { Queue } from "bullmq";
import { analyzeBlueprint } from "flowcraft";
import { config } from "backend/config/GlobalConfig.js";
import { createQueueIoredisClient } from "backend/connections/bullmq/createQueueIoredis.js";
import { logger } from "backend/utils/Logger.js";
import { buildRefreshTokenBlueprintDistributed } from "../../../blueprints/refreshTokenBlueprint.js";
import { REFRESH_TOKEN_BLUEPRINT_ID } from "../../../blueprints/refreshTokenTypes.js";
import { seedRefreshTokenWorkflowContext } from "./seedRefreshTokenWorkflowContext.js";

/**
 * Enqueues the integration refresh Flowcraft blueprint on BullMQ (see worker script).
 * Fire-and-forget from the API; completion is tracked via queue / Redis workflow keys.
 */
export async function enqueueRefreshTokenDistributedRun(
    input: { integrationId: string; organizationId: string },
    options?: { queueName?: string }
): Promise<{ runId: string; enqueued: boolean }> {
    const redis = createQueueIoredisClient();
    const { queueName: configuredQueueName } = config.bullmq as { queueName: string };
    const queueName = options?.queueName ?? configuredQueueName;

    const blueprint = buildRefreshTokenBlueprintDistributed();
    const version = blueprint.metadata?.version;
    if (typeof version !== "string" || !version) {
        throw new Error("refresh-token blueprint metadata.version is required for distributed runs");
    }

    const analysis = analyzeBlueprint(blueprint);
    const runId = crypto.randomUUID();

    await seedRefreshTokenWorkflowContext(redis, runId, {
        integrationId: input.integrationId,
        organizationId: input.organizationId,
        loopShouldContinue: true,
        blueprintVersion: version,
    });

    const queue = new Queue(queueName, { connection: redis });
    try {
        const startJobs = analysis.startNodeIds.map((nodeId) => ({
            name: "executeNode" as const,
            data: { runId, blueprintId: REFRESH_TOKEN_BLUEPRINT_ID, nodeId },
        }));
        await queue.addBulk(startJobs);
        logger.info({
            msg: "[Orchestrator] Enqueued distributed refresh-token workflow",
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
