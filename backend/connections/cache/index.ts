import { config } from "../../config/GlobalConfig";
import CacheService from "./CacheService";
import CacheInvalidationService from "./CacheInvalidationService";
import MemoryCacheProvider from "./MemoryCacheProvider";
import RedisCacheProvider from "./RedisCacheProvider";
import type { CacheProvider } from "./CacheService";

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
            enableOfflineQueue?: boolean;
            useScan?: boolean;
        };
    } | undefined;

    const providerName = cacheConfig?.provider ?? "memory";
    const defaultTTL = cacheConfig?.defaultTTL ?? 300;
    const redisOpts = cacheConfig?.redis;

    if (providerName === "redis" && redisOpts) {
        const redis = new RedisCacheProvider({
            host: redisOpts.host,
            port: redisOpts.port,
            password: redisOpts.password,
            db: redisOpts.db,
            prefix: redisOpts.prefix,
            maxReconnectAttempts: redisOpts.maxReconnectAttempts,
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
