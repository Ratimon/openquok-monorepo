import type { CacheProvider } from "./CacheService";

import { config } from "../../config/GlobalConfig";
import { logger } from "../../utils/Logger";

import CacheService from "./CacheService";
import CacheInvalidationService from "./CacheInvalidationService";
import MemoryCacheProvider from "./MemoryCacheProvider";
import RedisCacheProvider from "./RedisCacheProvider";

function createCacheProvider(): CacheProvider {
    const cacheConfig = config.cache as {
        provider?: string;
        defaultTTL?: number;
        checkPeriod?: number;
        useClones?: boolean;
        enablePatterns?: boolean;
        redis?: {
            host?: string;
            port?: number;
            password?: string;
            db?: number;
            prefix?: string;
            maxReconnectAttempts?: number;
            tls?: boolean;
            tlsRejectUnauthorized?: boolean;
            enableOfflineQueue?: boolean;
            useScan?: boolean;
        };
    } | undefined;

    const providerName = cacheConfig?.provider ?? "memory";
    const defaultTTL = cacheConfig?.defaultTTL ?? 300;
    const redisOpts = cacheConfig?.redis;

    const nodeEnv = String((config.server as { nodeEnv?: string } | undefined)?.nodeEnv ?? process.env.NODE_ENV ?? "");
    const isProduction = nodeEnv === "production";
    const hasRedisConfig = Boolean(redisOpts?.host);

    // FOr durability, OAuth state must be stored in a shared store (Redis) in production.
    // If production is misconfigured (CACHE_PROVIDER=memory), OAuth callbacks can hit a different instance
    // and fail with "Invalid state". Prefer forcing Redis when Redis env is available.
    const shouldUseRedis = (providerName === "redis" || (isProduction && hasRedisConfig)) && redisOpts;

    if (shouldUseRedis) {
        if (isProduction && providerName !== "redis") {
            logger.warn({
                msg: "[Cache] Forcing Redis cache provider in production for OAuth state durability",
                provider: providerName,
            });
        }
        const redis = new RedisCacheProvider({
            host: redisOpts.host,
            port: redisOpts.port,
            password: redisOpts.password,
            db: redisOpts.db,
            prefix: redisOpts.prefix,
            maxReconnectAttempts: redisOpts.maxReconnectAttempts,
            tls: redisOpts.tls,
            tlsRejectUnauthorized: redisOpts.tlsRejectUnauthorized,
            enableOfflineQueue: redisOpts.enableOfflineQueue,
            useScan: redisOpts.useScan,
        });
        return {
            get: (k) => redis.get(k),
            set: (k, v, ttl) => redis.set(k, v, ttl),
            del: (k) => redis.del(k),
            delPattern: (p) => redis.delPattern(p),
            flush: () => redis.flush(),
        };
    }

    if (isProduction) {
        logger.warn({
            msg: "[Cache] Using in-memory cache provider in production (OAuth state may be lost across instances). Set CACHE_PROVIDER=redis.",
            provider: providerName,
            hasRedisConfig,
        });
    }

    const memory = new MemoryCacheProvider({
        ttl: defaultTTL,
        checkPeriod: (cacheConfig as { checkPeriod?: number })?.checkPeriod ?? 60,
        enablePatterns: cacheConfig?.enablePatterns ?? true,
    });
    return {
        get: (k) => memory.get(k),
        set: (k, v, ttl) => memory.set(k, v, ttl),
        del: (k) => memory.del(k),
        delPattern: (p) => memory.delPattern(p),
        flush: () => memory.flush(),
    };
}

const cacheConfig = config.cache as {
    defaultTTL?: number;
    logHits?: boolean;
    logMisses?: boolean;
    enabled?: boolean;
} | undefined;

export const cacheService = new CacheService(createCacheProvider(), {
    defaultTTL: cacheConfig?.defaultTTL ?? 300,
    logHits: cacheConfig?.logHits ?? true,
    logMisses: cacheConfig?.logMisses ?? true,
    enabled: cacheConfig?.enabled ?? true,
});

export const cacheInvalidationService = new CacheInvalidationService(cacheService);

export { CacheService, CacheInvalidationService };
export default cacheService;
