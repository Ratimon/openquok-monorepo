import { type BullMQAdapter } from "@flowcraft/bullmq-adapter";
import type IORedis from "ioredis";
import { config } from "backend/config/GlobalConfig.js";
import { logger } from "backend/utils/Logger.js";

const WORKFLOW_STATE_KEY_PREFIX = "workflow:state:";

/**
 * Resolves the Flowcraft blueprint id for a run (same keys as {@linkcode BullMQAdapter.reconcile}).
 */
async function resolveBlueprintIdForRun(redis: IORedis, runId: string): Promise<string | undefined> {
    const fromCoord = await redis.get(`flowcraft:blueprint:${runId}`);
    if (fromCoord) {
        return fromCoord;
    }
    const raw = await redis.hget(`${WORKFLOW_STATE_KEY_PREFIX}${runId}`, "blueprintId");
    if (raw == null) {
        return undefined;
    }
    try {
        return JSON.parse(raw) as string;
    } catch {
        return raw;
    }
}

/**
 * Like `@flowcraft/bullmq-adapter` {@linkcode createBullMQReconciler}, but only calls
 * {@linkcode BullMQAdapter.reconcile} when the run’s `blueprintId` is in `allowedBlueprintIds`.
 * Without this, every worker’s reconciler would scan **all** `workflow:state:*` keys in shared Redis
 * and throw `Blueprint with ID '…' not found` for runs owned by other workers.
 */
function createBlueprintFilteredBullMQReconciler(options: {
    adapter: BullMQAdapter;
    redis: IORedis;
    stalledThresholdSeconds: number;
    allowedBlueprintIds: ReadonlySet<string>;
    keyPrefix?: string;
    scanCount?: number;
}): {
    run: () => Promise<{
        scannedKeys: number;
        reconciledRuns: number;
        stalledRuns: number;
        failedRuns: number;
        skippedOtherBlueprint: number;
    }>;
} {
    const { adapter, redis, stalledThresholdSeconds, allowedBlueprintIds } = options;
    const keyPrefix = options.keyPrefix ?? WORKFLOW_STATE_KEY_PREFIX;
    const scanCount = options.scanCount ?? 100;

    return {
        async run() {
            const stats = {
                scannedKeys: 0,
                reconciledRuns: 0,
                stalledRuns: 0,
                failedRuns: 0,
                skippedOtherBlueprint: 0,
            };
            let cursor = 0;
            do {
                const result = await redis.scan(cursor, "MATCH", `${keyPrefix}*`, "COUNT", scanCount);
                cursor = Number(result[0]);
                const keys = result[1];
                for (const key of keys) {
                    stats.scannedKeys++;
                    const runId = key.replace(keyPrefix, "");
                    const idleTime = await redis.object("IDLETIME", key);
                    if (idleTime !== null && idleTime !== void 0 && Number(idleTime) > stalledThresholdSeconds) {
                        stats.stalledRuns++;
                        const blueprintId = await resolveBlueprintIdForRun(redis, runId);
                        if (!blueprintId || !allowedBlueprintIds.has(blueprintId)) {
                            stats.skippedOtherBlueprint++;
                            continue;
                        }
                        try {
                            const enqueued = await adapter.reconcile(runId);
                            if (enqueued.size > 0) {
                                stats.reconciledRuns++;
                                logger.info(
                                    `[Reconciler] Resumed run ${runId}, enqueued nodes: ${[...enqueued].join(", ")}`
                                );
                            }
                        } catch (error) {
                            stats.failedRuns++;
                            logger.error({
                                msg: `[Reconciler] Failed to reconcile run ${runId}`,
                                error: error instanceof Error ? error.message : String(error),
                            });
                        }
                    }
                }
            } while (cursor !== 0);
            return stats;
        },
    };
}

/**
 * Runs a blueprint-filtered {@link https://flowcraft.js.org/guide/adapters/bullmq#reconciliation BullMQ reconciler} on a timer
 * (each dedicated worker only reconciles runs for its own Flowcraft blueprints; shared Redis otherwise sees every stall).
 * Set `config.bullmq.flowcraft.reconcilerIntervalMs` to `0` to disable.
 */
export function startFlowcraftBullMqReconciliationTimer(options: {
    adapter: BullMQAdapter;
    redis: IORedis;
    /** Shown in logs, e.g. `integration-refresh` */
    label: string;
    /** Blueprint ids this worker’s adapter can execute; must match `runtimeOptions.blueprints` keys. */
    allowedBlueprintIds: readonly string[];
}): { stop: () => void } {
    const flow = (config.bullmq as {
        flowcraft?: { reconcilerStalledThresholdSeconds?: number; reconcilerIntervalMs?: number };
    }).flowcraft;
    const intervalMs = flow?.reconcilerIntervalMs ?? 0;
    const stalledThresholdSeconds = flow?.reconcilerStalledThresholdSeconds ?? 300;

    if (intervalMs <= 0) {
        return { stop: () => undefined };
    }

    const allowed = new Set(options.allowedBlueprintIds);
    const reconciler = createBlueprintFilteredBullMQReconciler({
        adapter: options.adapter,
        redis: options.redis,
        stalledThresholdSeconds,
        allowedBlueprintIds: allowed,
    });

    const tick = () => {
        void reconciler
            .run()
            .then((stats) => {
                if (
                    stats.reconciledRuns > 0 ||
                    stats.stalledRuns > 0 ||
                    stats.failedRuns > 0 ||
                    stats.skippedOtherBlueprint > 0
                ) {
                    logger.info({
                        msg: "[Worker] Flowcraft BullMQ reconciler",
                        label: options.label,
                        reconciledRuns: stats.reconciledRuns,
                        stalledRuns: stats.stalledRuns,
                        failedRuns: stats.failedRuns,
                        skippedOtherBlueprint: stats.skippedOtherBlueprint,
                        scannedKeys: stats.scannedKeys,
                    });
                }
            })
            .catch((err: unknown) => {
                logger.warn({
                    msg: "[Worker] Flowcraft BullMQ reconciler run failed",
                    label: options.label,
                    error: err instanceof Error ? err.message : String(err),
                });
            });
    };

    tick();
    const id = setInterval(tick, intervalMs);
    return {
        stop: () => {
            clearInterval(id);
        },
    };
}
