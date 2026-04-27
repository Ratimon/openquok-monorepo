import IORedis, { type RedisOptions } from "ioredis";
import { config } from "../../config/GlobalConfig";
import { logger } from "../../utils/Logger";

function queueRedisOptionsFromConfig(): RedisOptions {
    const redis = config.cache as {
        redis?: {
            host?: string;
            port?: number;
            password?: string;
            db?: number;
            bullmqDb?: number;
            tls?: boolean;
            tlsRejectUnauthorized?: boolean;
        };
    };
    const r = redis.redis;
    const host = String(r?.host ?? "127.0.0.1").trim();
    const port = r?.port ?? 6379;
    const password = typeof r?.password === "string" ? r.password.trim() : r?.password;
    const db = r?.bullmqDb ?? r?.db ?? 0;
    const tlsEnabled = r?.tls === true;
    const tlsRejectUnauthorized = r?.tlsRejectUnauthorized !== false;

    return {
        host,
        port,
        password: password || undefined,
        db,
        connectTimeout: 10_000,
        ...(tlsEnabled
            ? {
                  tls: {
                      rejectUnauthorized: tlsRejectUnauthorized,
                  },
              }
            : {}),
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
    const opts = queueRedisOptionsFromConfig();
    const redis = new IORedis(opts);

    // Ensure we never emit an unhandled "error" event (common prod symptom: only "Unhandled error event" lines).
    redis.on("error", (err) => {
        logger.error({
            msg: "[BullMQ] Redis error",
            error: err instanceof Error ? err.message : String(err),
            host: opts.host,
            port: opts.port,
            db: opts.db,
            tls: Boolean((opts as any).tls),
        });
    });

    redis.on("ready", () => {
        logger.info({
            msg: "[BullMQ] Redis connection ready",
            host: opts.host,
            port: opts.port,
            db: opts.db,
            tls: Boolean((opts as any).tls),
        });
    });

    return redis;
}
