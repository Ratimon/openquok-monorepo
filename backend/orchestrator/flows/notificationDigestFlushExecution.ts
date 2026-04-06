import type IORedis from "ioredis";
import type { TransactionalNotificationEmailService } from "../../services/TransactionalNotificationEmailService";
import { drainPendingNotificationDigestBatches } from "../stores/notificationDigestRedisStore";

/**
 * Worker-side digest flush: Redis drain lives in `stores/notificationDigestRedisStore`; org HTML + delivery in the service.
 */
export async function executeNotificationDigestFlush(
    redis: IORedis,
    deps: {
        transactionalNotificationEmailService: TransactionalNotificationEmailService;
        sendPlain: (to: string, subject: string, html: string) => Promise<void>;
    }
): Promise<void> {
    const batches = await drainPendingNotificationDigestBatches(redis);
    for (const batch of batches) {
        await deps.transactionalNotificationEmailService.deliverDigestBatch(
            batch.organizationId,
            batch.entries,
            deps.sendPlain
        );
    }
}
