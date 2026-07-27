import type IORedis from "ioredis";
import type { DigestQueueEntry } from "openquok-common";

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
 * Read pending digest lists without removing them.
 * Call {@link acknowledgeNotificationDigestBatch} only after successful delivery so failed sends retry.
 * Empty lists are pruned from the pending-org set.
 */
export async function listPendingNotificationDigestBatches(redis: IORedis): Promise<NotificationDigestBatch[]> {
    const orgIds = await redis.smembers(PENDING_ORGS_KEY);
    const batches: NotificationDigestBatch[] = [];

    for (const organizationId of orgIds) {
        const key = digestListKey(organizationId);
        const raw = await redis.lrange(key, 0, -1);
        if (raw.length === 0) {
            await redis.srem(PENDING_ORGS_KEY, organizationId);
            continue;
        }

        const entries: DigestQueueEntry[] = [];
        for (const row of raw) {
            try {
                entries.push(JSON.parse(row) as DigestQueueEntry);
            } catch {
                /* skip malformed */
            }
        }
        if (entries.length === 0) {
            // Drop unparseable junk so the org is not stuck forever.
            await redis.del(key);
            await redis.srem(PENDING_ORGS_KEY, organizationId);
            continue;
        }
        batches.push({ organizationId, entries });
    }

    return batches;
}

/**
 * Drop the prefix of a digest list that was successfully delivered.
 * Uses LTRIM so entries RPUSHed during send are preserved for the next flush.
 */
export async function acknowledgeNotificationDigestBatch(
    redis: IORedis,
    organizationId: string,
    consumedCount: number
): Promise<void> {
    const key = digestListKey(organizationId);
    if (consumedCount > 0) {
        await redis.ltrim(key, consumedCount, -1);
    }
    const remaining = await redis.llen(key);
    if (remaining === 0) {
        await redis.del(key);
        await redis.srem(PENDING_ORGS_KEY, organizationId);
    }
}

/**
 * @deprecated Prefer {@link listPendingNotificationDigestBatches} + {@link acknowledgeNotificationDigestBatch}.
 * Kept for callers that still expect a destructive drain (tests / older workers).
 */
export async function drainPendingNotificationDigestBatches(redis: IORedis): Promise<NotificationDigestBatch[]> {
    const batches = await listPendingNotificationDigestBatches(redis);
    for (const batch of batches) {
        await acknowledgeNotificationDigestBatch(redis, batch.organizationId, batch.entries.length);
    }
    return batches;
}
