import { BullMQAdapter } from "@flowcraft/bullmq-adapter";
import type IORedis from "ioredis";

import { SafeRedisContext } from "./safeRedisContext.js";

/**
 * `BullMQAdapter` from `@flowcraft/bullmq-adapter` uses a `RedisContext` whose `set()` can write
 * empty hash fields when a node returns `undefined` output (notably loop controller nodes).
 *
 * We only override `createContext` to use {@link SafeRedisContext}.
 */
export class SafeBullMQAdapter extends BullMQAdapter {
    override createContext(runId: string) {
        // `this.redisClient` exists on `BullMQAdapter` at runtime (see vendor `dist/index.mjs`)
        const redis = (this as unknown as { redisClient: IORedis }).redisClient;
        return new SafeRedisContext(redis, runId) as unknown as ReturnType<BullMQAdapter["createContext"]>;
    }
}
