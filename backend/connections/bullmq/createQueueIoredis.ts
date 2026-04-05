import IORedis, { type RedisOptions } from "ioredis";
import { config } from "../../config/GlobalConfig";

function queueRedisOptionsFromConfig(): RedisOptions {
    const redis = config.cache as {
        redis?: { host?: string; port?: number; password?: string; db?: number; bullmqDb?: number };
    };
    const r = redis.redis;
    const host = r?.host ?? "127.0.0.1";
    const port = r?.port ?? 6379;
    const password = r?.password;
    const db = r?.bullmqDb ?? r?.db ?? 0;

    return {
        host,
        port,
        password: password || undefined,
        db,
        maxRetriesPerRequest: null,
    };
}

/**
 * Connection options for BullMQ / Flowcraft’s BullMQ adapter.
 * Prefer passing this object into `BullMQAdapter` (not a shared `IORedis` instance) so `adapter.close()` can disconnect.
 */
export function getQueueRedisConnectionOptions(): RedisOptions {
    return queueRedisOptionsFromConfig();
}

/**
 * Standalone `ioredis` client for one-off enqueue/ping tests. Caller should `quit()` when finished.
 * Uses the same host/port/password as application cache (`REDIS_*`), with an optional
 * logical DB via `REDIS_BULLMQ_DB` (defaults to `REDIS_DB`). This is separate from
 * `RedisCacheProvider`, which uses the `redis` package and key prefixing for cache keys.
 */
export function createQueueIoredisClient(): IORedis {
    return new IORedis(queueRedisOptionsFromConfig());
}
