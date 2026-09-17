import type { Store } from "express-rate-limit";
import IORedis, { type RedisOptions } from "ioredis";
import { RedisStore, type RedisReply } from "rate-limit-redis";

import { config } from "../config/GlobalConfig";
import { logger } from "../utils/Logger";

type RateLimitRedisConfig = {
    enabled?: boolean;
    keyPrefix?: string;
    db?: number;
};

type CacheRedisConfig = {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    tls?: boolean;
    tlsRejectUnauthorized?: boolean;
};

let sharedClient: IORedis | null = null;
let redisStoreActive = false;
let warmUpCompleted = false;
let fallbackWarningLogged = false;

const getRateLimitRedisConfig = (): RateLimitRedisConfig => {
    const rateLimitConfig = config.rateLimit as { redis?: RateLimitRedisConfig } | undefined;
    return rateLimitConfig?.redis ?? {};
};

const getCacheRedisConfig = (): CacheRedisConfig => {
    const cacheConfig = config.cache as { redis?: CacheRedisConfig } | undefined;
    return cacheConfig?.redis ?? {};
};

const isRateLimitRedisEnabled = (): boolean => getRateLimitRedisConfig().enabled === true;

const rateLimitRedisOptionsFromConfig = (): RedisOptions | null => {
    const cacheRedis = getCacheRedisConfig();
    const rateLimitRedis = getRateLimitRedisConfig();
    const host = String(cacheRedis.host ?? "").trim();
    if (!host) return null;

    const port = cacheRedis.port ?? 6379;
    const password = typeof cacheRedis.password === "string" ? cacheRedis.password.trim() : cacheRedis.password;
    const db = rateLimitRedis.db ?? cacheRedis.db ?? 0;
    const tlsEnabled = cacheRedis.tls === true;
    const tlsRejectUnauthorized = cacheRedis.tlsRejectUnauthorized !== false;

    return {
        host,
        port,
        password: password || undefined,
        db,
        connectTimeout: 10_000,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        ...(tlsEnabled
            ? {
                  tls: {
                      rejectUnauthorized: tlsRejectUnauthorized,
                  },
              }
            : {}),
    };
};

const logFallbackToMemory = (reason: string, extra?: Record<string, unknown>): void => {
    if (fallbackWarningLogged) return;
    fallbackWarningLogged = true;
    logger.warn({
        msg: "[RateLimit] Redis store unavailable; using in-memory counters",
        reason,
        ...extra,
    });
};

const getOrCreateSharedClient = (): IORedis | null => {
    if (sharedClient) return sharedClient;

    const opts = rateLimitRedisOptionsFromConfig();
    if (!opts) {
        logFallbackToMemory("REDIS_HOST is not configured");
        return null;
    }

    const client = new IORedis(opts);
    client.on("error", (err) => {
        logger.error({
            msg: "[RateLimit] Redis error",
            error: err instanceof Error ? err.message : String(err),
            host: opts.host,
            port: opts.port,
            db: opts.db,
            tls: Boolean((opts as { tls?: unknown }).tls),
        });
    });
    sharedClient = client;
    return client;
};

/**
 * Probes Redis when `RATE_LIMIT_REDIS_ENABLED` is true. Call before mounting rate limiters
 * so local dev can fall back to in-memory counters when Redis is down.
 */
export const warmUpRateLimitRedisStore = async (): Promise<void> => {
    if (warmUpCompleted) return;
    warmUpCompleted = true;

    if (!isRateLimitRedisEnabled()) {
        redisStoreActive = false;
        return;
    }

    const client = getOrCreateSharedClient();
    if (!client) {
        redisStoreActive = false;
        return;
    }

    const opts = rateLimitRedisOptionsFromConfig();
    try {
        await client.connect();
        await client.ping();
        redisStoreActive = true;
        logger.info({
            msg: "[RateLimit] Redis store connected",
            host: opts?.host,
            port: opts?.port,
            db: opts?.db,
            keyPrefix: getRateLimitRedisConfig().keyPrefix ?? "rl:",
        });
    } catch (err) {
        redisStoreActive = false;
        try {
            await client.quit();
        } catch {
            client.disconnect();
        }
        sharedClient = null;
        logFallbackToMemory("connection failed", {
            error: err instanceof Error ? err.message : String(err),
            host: opts?.host,
            port: opts?.port,
            db: opts?.db,
        });
    }
};

export const isRateLimitRedisStoreActive = (): boolean => redisStoreActive;

/**
 * Factory for express-rate-limit stores. Returns a Redis-backed store when enabled and
 * warm-up succeeded; otherwise undefined so express-rate-limit uses its in-memory store.
 */
export const createRateLimitStore = (limiterName: string): Store | undefined => {
    if (!isRateLimitRedisEnabled() || !redisStoreActive) {
        return undefined;
    }

    const client = getOrCreateSharedClient();
    if (!client) {
        return undefined;
    }

    const basePrefix = getRateLimitRedisConfig().keyPrefix ?? "rl:";
    const prefix = `${basePrefix}${limiterName}:`;

    return new RedisStore({
        prefix,
        sendCommand: (command: string, ...args: string[]) =>
            client.call(command, ...args) as Promise<RedisReply>,
    });
};

/** Test-only reset for unit tests. */
export const resetRateLimitStoreForTests = (): void => {
    if (sharedClient) {
        sharedClient.disconnect();
    }
    sharedClient = null;
    redisStoreActive = false;
    warmUpCompleted = false;
    fallbackWarningLogged = false;
};
