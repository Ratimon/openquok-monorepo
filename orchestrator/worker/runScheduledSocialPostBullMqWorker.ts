/**
 * Flowcraft + BullMQ: publish scheduled `posts` rows at `publish_date` to each social provider.
 * Set `orchestratorFlows.scheduledSocialPost.transport` to `bullmq` and `ORCHESTRATOR_SCHEDULED_SOCIAL_POST_TRANSPORT=bullmq` when using this.
 *
 * Run: pnpm worker:scheduled-social-post-bullmq
 */
import { config } from "backend/config/GlobalConfig.js";
import { IntegrationManager } from "backend/integrations/integrationManager.js";
import { integrationRepository, postsRepository } from "backend/repositories/index.js";
import { RefreshIntegrationService } from "backend/services/RefreshIntegrationService.js";
import { createPublishScheduledGroupHandler } from "../activities/scheduledSocialPostExecution.js";
import { createScheduledSocialPostBullMqAdapter } from "../adapters/flowcraft-bullmq/scheduled-social-post/createScheduledSocialPostBullMqAdapter.js";
import {
    buildScheduledSocialPostBlueprintDistributed,
    getScheduledSocialPostNodeRegistry,
} from "../blueprints/scheduledSocialPostBlueprint.js";
import { SCHEDULED_SOCIAL_POST_BLUEPRINT_ID } from "../blueprints/scheduledSocialPostFlowTypes.js";
import { logger } from "backend/utils/Logger.js";
import { runMissingScheduledPostRescan } from "../flows/missingScheduledPostReconciliation.js";
import { startFlowcraftBullMqReconciliationTimer } from "./flowcraftBullMqReconciliationTimer.js";

const transport = (config.bullmq as { scheduledSocialPost?: { transport?: string } }).scheduledSocialPost?.transport;
if (transport !== "bullmq") {
    logger.warn({
        msg: "[Worker] scheduled social post transport is not bullmq; worker will still start. Set scheduledSocialPost.transport to bullmq when using this process.",
        transport: transport ?? "in_process",
    });
}

const integrationManager = new IntegrationManager();
const refreshService = new RefreshIntegrationService(integrationRepository, integrationManager);
const publishScheduledGroup = createPublishScheduledGroupHandler({
    postsRepository,
    integrationRepository,
    integrationManager,
    refreshService,
});

// Debug: confirm blueprint `uses` keys match registry (no `fn_*`).
try {
    const b = buildScheduledSocialPostBlueprintDistributed();
    const reg = getScheduledSocialPostNodeRegistry() as Record<string, unknown>;
    const nodeUses = (b.nodes ?? []).map((n) => n.uses);
    const missing = nodeUses.filter((u) => typeof u === "string" && typeof reg[u] !== "function");
    logger.info({
        msg: "[Worker] scheduled-social-post blueprint registry sanity check",
        nodeUses,
        missingUses: missing,
    });
} catch (err) {
    logger.warn({
        msg: "[Worker] scheduled-social-post blueprint sanity check failed",
        error: err instanceof Error ? err.message : String(err),
    });
}

const { adapter, redis } = createScheduledSocialPostBullMqAdapter({ publishScheduledGroup });
adapter.start();
const flowcraftReconciler = startFlowcraftBullMqReconciliationTimer({
    adapter,
    redis,
    label: "scheduled-social-post",
    allowedBlueprintIds: [SCHEDULED_SOCIAL_POST_BLUEPRINT_ID],
});
const rescanEveryMs = (config.bullmq as { scheduledSocialPost?: { missingPostRescanIntervalMs?: number } })
    .scheduledSocialPost?.missingPostRescanIntervalMs;
let missingPostInterval: ReturnType<typeof setInterval> | undefined;
if (rescanEveryMs && rescanEveryMs > 0) {
    void runMissingScheduledPostRescan();
    missingPostInterval = setInterval(() => {
        void runMissingScheduledPostRescan();
    }, rescanEveryMs);
}
const queueName = (config.bullmq as { scheduledSocialPost?: { queueName?: string } }).scheduledSocialPost?.queueName ?? "scheduled-social-post";
logger.info({
    msg: "[Worker] Flowcraft BullMQ adapter listening for scheduled social post workflows",
    queueName,
    missingPostRescanIntervalMs: rescanEveryMs ?? 0,
});

async function shutdown(signal: string): Promise<void> {
    logger.info({ msg: "[Worker] Shutting down scheduled social post adapter", signal });
    flowcraftReconciler.stop();
    if (missingPostInterval) clearInterval(missingPostInterval);
    try {
        await adapter.close();
        await redis.quit();
    } catch (err) {
        logger.error({
            msg: "[Worker] Error closing scheduled social post adapter",
            error: err instanceof Error ? err.message : String(err),
        });
    }
    process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
