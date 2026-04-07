import { Queue } from "bullmq";
import { createQueueIoredisClient } from "../../connections/bullmq/createQueueIoredis";

/**
 * Verifies ioredis + BullMQ against the configured Redis (same settings as cache / Flowcraft worker).
 * Opt-in: set BULLMQ_INTEGRATION_TEST=true and ensure Redis is reachable (e.g. local Docker or managed Redis).
 */
const runBullMqIntegration = process.env.BULLMQ_INTEGRATION_TEST === "true";
const describeBullMq = runBullMqIntegration ? describe : describe.skip;

describeBullMq("Integration: BullMQ + queue Redis (ioredis)", () => {
    it("should PING and enqueue a disposable job", async () => {
        const redis = createQueueIoredisClient();
        try {
            const pong = await redis.ping();
            expect(pong).toBe("PONG");

            const queueName = `openquok-jest-bullmq-${Date.now()}`;
            const queue = new Queue(queueName, { connection: redis });
            await queue.add("connectivity-test", { ok: true });
            const counts = await queue.getJobCounts("waiting", "delayed", "active");
            const pending = counts.waiting + counts.delayed + counts.active;
            expect(pending).toBeGreaterThanOrEqual(1);
            await queue.obliterate({ force: true });
            await queue.close();
        } finally {
            await redis.quit();
        }
    });
});
