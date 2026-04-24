import { config } from "backend/config/GlobalConfig.js";
import { postsRepository } from "backend/repositories/index.js";
import { logger } from "backend/utils/Logger.js";
import { runScheduledSocialPostOrchestration } from "./scheduledSocialPostWorkflow.js";

/**
 * `searchForMissingThreeHoursPosts` / `missing.post.workflow`: find `QUEUE` groups whose `publish_date`
 * falls in a 4h window (now±2h) and re-enqueue Flowcraft (worker was down, BullMQ job lost, etc.).
 */
export async function runMissingScheduledPostRescan(): Promise<void> {
    const transport = (config.bullmq as { scheduledSocialPost?: { transport?: string } }).scheduledSocialPost
        ?.transport;
    if (transport !== "bullmq") return;

    const t = Date.now();
    const fromIso = new Date(t - 2 * 60 * 60 * 1000).toISOString();
    const toIso = new Date(t + 2 * 60 * 60 * 1000).toISOString();

    const groups = await postsRepository.listQueuePostGroupsForMissingPublishRescan(fromIso, toIso);
    for (const g of groups) {
        const ok = await runScheduledSocialPostOrchestration({
            organizationId: g.organizationId,
            postGroup: g.postGroup,
            delayMs: 0,
        });
        if (ok) {
            logger.info({
                msg: "[Orchestrator] Re-enqueued missing scheduled post group (DB rescan)",
                organizationId: g.organizationId,
                postGroup: g.postGroup,
            });
        }
    }
}
