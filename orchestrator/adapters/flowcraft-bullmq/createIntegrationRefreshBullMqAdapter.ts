import { BullMQAdapter, RedisCoordinationStore } from "@flowcraft/bullmq-adapter";
import type IORedis from "ioredis";
import { config } from "backend/config/GlobalConfig.js";
import { createQueueIoredisClient } from "backend/connections/bullmq/createQueueIoredis.js";
import { buildRefreshTokenBlueprintDistributed, getRefreshTokenNodeRegistry } from "../../blueprints/refreshTokenBlueprint.js";
import { REFRESH_TOKEN_BLUEPRINT_ID, type RefreshTokenWorkflowDependencies } from "../../blueprints/refreshTokenTypes.js";

/**
 * Worker-side BullMQ adapter for the refresh-token blueprint.
 * Use the same `redis` instance for coordination and the adapter; call `adapter.close()` then `redis.quit()` on shutdown
 * (the adapter does not disconnect a caller-supplied `IORedis` instance).
 */
export function createIntegrationRefreshBullMqAdapter(workflowDependencies: RefreshTokenWorkflowDependencies): {
    adapter: BullMQAdapter;
    redis: IORedis;
} {
    const redis = createQueueIoredisClient();
    const coordinationStore = new RedisCoordinationStore(redis);
    const blueprint = buildRefreshTokenBlueprintDistributed();
    const { queueName } = config.bullmq as { queueName: string };

    const adapter = new BullMQAdapter({
        connection: redis,
        coordinationStore,
        queueName,
        runtimeOptions: {
            blueprints: { [REFRESH_TOKEN_BLUEPRINT_ID]: blueprint },
            registry: getRefreshTokenNodeRegistry(),
            dependencies: workflowDependencies,
        },
    });

    return { adapter, redis };
}
