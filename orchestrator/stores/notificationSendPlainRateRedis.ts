import type IORedis from "ioredis";

/** Single-slot gate shared by all notification-email workers (minimum spacing between send-plain deliveries). */
const SEND_PLAIN_SLOT_KEY = "notificationEmail:sendPlain:slot";

/**
 * Blocks until this process may send the next transactional mail: at most one acquisition per
 * `minIntervalMs` window cluster-wide (Redis `SET NX` + spin). Use `minIntervalMs <= 0` to disable.
 */
export async function acquireNotificationSendPlainSlot(redis: IORedis, minIntervalMs: number): Promise<void> {
    if (minIntervalMs <= 0) return;

    const pollMs = Math.min(50, Math.max(10, Math.floor(minIntervalMs / 10)));

    while (true) {
        const ok = await redis.set(SEND_PLAIN_SLOT_KEY, "1", "PX", minIntervalMs, "NX");
        if (ok === "OK") {
            return;
        }
        await new Promise<void>((resolve) => {
            setTimeout(resolve, pollMs);
        });
    }
}
