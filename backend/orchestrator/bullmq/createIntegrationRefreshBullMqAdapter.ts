import { BullMQAdapter, RedisCoordinationStore } from "@flowcraft/bullmq-adapter";
import type IORedis from "ioredis";
import { config } from "../../config/GlobalConfig";
import { createQueueIoredisClient } from "../../connections/bullmq/createQueueIoredis";
import type { RefreshTokenOrchestrationDeps } from "../flows/refreshTokenWorkflow";
import {
    buildRefreshTokenBlueprintDistributed,
    getRefreshTokenNodeRegistry,
    REFRESH_TOKEN_BLUEPRINT_ID,
} from "../flows/refreshTokenWorkflow";

/**
 * Worker-side BullMQ adapter for the refresh-token blueprint.
 * Use the same `redis` instance for coordination and the adapter; call `adapter.close()` then `redis.quit()` on shutdown
 * (the adapter does not disconnect a caller-supplied `IORedis` instance).
 */
export function createIntegrationRefreshBullMqAdapter(deps: RefreshTokenOrchestrationDeps): {
    adapter: BullMQAdapter;
    redis: IORedis;
} {
    const redis = createQueueIoredisClient();
    const coordinationStore = new RedisCoordinationStore(redis);
    const blueprint = buildRefreshTokenBlueprintDistributed();
    const bullmqConfig = config.bullmq as { queueName?: string } | undefined;
    const queueName = bullmqConfig?.queueName ?? "integration-refresh";

    const adapter = new BullMQAdapter({
        connection: redis,
        coordinationStore,
        queueName,
        runtimeOptions: {
            blueprints: { [REFRESH_TOKEN_BLUEPRINT_ID]: blueprint },
            registry: getRefreshTokenNodeRegistry(),
            dependencies: deps,
        },
    });

    return { adapter, redis };
}
