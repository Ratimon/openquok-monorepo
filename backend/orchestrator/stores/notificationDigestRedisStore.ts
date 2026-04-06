import type IORedis from "ioredis";
import type { DigestQueueEntry } from "../../data/types/notificationEmailTypes";

const PENDING_ORGS_KEY = "notificationDigest:pendingOrgs";

function digestListKey(organizationId: string): string {
    return `notificationDigest:list:${organizationId}`;
}

/** Append one digest line item and track the org for periodic flush (worker Flowcraft node). */
export async function appendNotificationDigestEntry(
    redis: IORedis,
    organizationId: string,
    entry: DigestQueueEntry
): Promise<void> {
    await redis.rpush(digestListKey(organizationId), JSON.stringify(entry));
    await redis.sadd(PENDING_ORGS_KEY, organizationId);
}

export type NotificationDigestBatch = { organizationId: string; entries: DigestQueueEntry[] };

/**
 * Reads and clears all pending digest lists. Same semantics as prior in-service flush: list and pending set
 * entries are removed before delivery runs (lossy if downstream send fails).
 */
export async function drainPendingNotificationDigestBatches(redis: IORedis): Promise<NotificationDigestBatch[]> {
    const orgIds = await redis.smembers(PENDING_ORGS_KEY);
    const batches: NotificationDigestBatch[] = [];

    for (const organizationId of orgIds) {
        const key = digestListKey(organizationId);
        const raw = await redis.lrange(key, 0, -1);
        if (raw.length === 0) {
            await redis.srem(PENDING_ORGS_KEY, organizationId);
            continue;
        }
        await redis.del(key);
        await redis.srem(PENDING_ORGS_KEY, organizationId);

        const entries: DigestQueueEntry[] = [];
        for (const row of raw) {
            try {
                entries.push(JSON.parse(row) as DigestQueueEntry);
            } catch {
                /* skip malformed */
            }
        }
        if (entries.length === 0) continue;
        batches.push({ organizationId, entries });
    }

    return batches;
}
