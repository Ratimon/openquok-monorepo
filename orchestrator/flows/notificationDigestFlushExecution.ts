import type IORedis from "ioredis";
import type { TransactionalNotificationEmailService } from "backend/services/TransactionalNotificationEmailService.js";
import {
    acknowledgeNotificationDigestBatch,
    listPendingNotificationDigestBatches,
} from "../stores/notificationDigestRedisStore.js";
import { logger } from "backend/utils/Logger.js";

/**
 * Worker-side digest flush: list Redis digests, deliver, then acknowledge only on success
 * so SMTP/API failures keep entries for the next interval.
 */
export async function executeNotificationDigestFlush(
    redis: IORedis,
    deps: {
        transactionalNotificationEmailService: TransactionalNotificationEmailService;
        sendPlain: (to: string, subject: string, html: string) => Promise<void>;
    }
): Promise<void> {
    const batches = await listPendingNotificationDigestBatches(redis);
    for (const batch of batches) {
        try {
            await deps.transactionalNotificationEmailService.deliverDigestBatch(
                batch.organizationId,
                batch.entries,
                deps.sendPlain
            );
            await acknowledgeNotificationDigestBatch(redis, batch.organizationId, batch.entries.length);
        } catch (err) {
            logger.error({
                msg: "[Orchestrator] Digest flush failed; leaving entries in Redis for retry",
                organizationId: batch.organizationId,
                entryCount: batch.entries.length,
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }
}
