import { BullMQAdapter } from "@flowcraft/bullmq-adapter";
import type { JobPayload } from "flowcraft";
import { Worker, type Job } from "bullmq";
import type IORedis from "ioredis";

import { config } from "backend/config/GlobalConfig.js";

import { SafeRedisContext } from "./safeRedisContext.js";

type AdapterInternals = {
    redisClient: IORedis;
    queueName: string;
    logger: { info: (m: string) => void; debug?: (m: string) => void; error: (...a: unknown[]) => void };
    worker: Worker | undefined;
};

const MIN_LOCK_MS = 30_000;

/**
 * `BullMQAdapter` from `@flowcraft/bullmq-adapter` uses a `RedisContext` whose `set()` can write
 * empty hash fields when a node returns `undefined` output (notably loop controller nodes).
 *
 * We also override `createContext` to use {@link SafeRedisContext}, and `processJobs` to set a
 * longer `lockDuration` than BullMQ’s default (30s). The upstream package does not pass
 * `lockDuration`; long Flowcraft node work (e.g. OAuth refresh) would otherwise throw
 * “Error: could not renew lock for job …” when execution exceeds the lock window.
 */
export class SafeBullMQAdapter extends BullMQAdapter {
    override createContext(runId: string) {
        const redis = (this as unknown as AdapterInternals).redisClient;
        return new SafeRedisContext(redis, runId) as unknown as ReturnType<BullMQAdapter["createContext"]>;
    }

    protected override processJobs(handler: (job: JobPayload) => Promise<void>): void {
        const $this = this as unknown as AdapterInternals;
        const lockMs = resolveWorkerLockDurationMs();
        $this.worker = new Worker(
            $this.queueName,
            async (job: Job) => {
                $this.logger.info(`[BullMQAdapter] ==> Picked up job ID: ${job.id}, Name: ${job.name}`);
                await handler(job.data);
            },
            {
                connection: $this.redisClient,
                concurrency: 5,
                lockDuration: lockMs,
            }
        );
        $this.logger.info(
            `[BullMQAdapter] Worker listening for jobs on queue: "${$this.queueName}" (lockDuration=${lockMs}ms).`
        );
    }
}

function resolveWorkerLockDurationMs(): number {
    const raw = (config.bullmq as { flowcraft?: { workerLockDurationMs?: number } } | undefined)?.flowcraft
        ?.workerLockDurationMs;
    if (typeof raw === "number" && Number.isFinite(raw) && raw >= MIN_LOCK_MS) {
        return Math.floor(raw);
    }
    return 600_000;
}
