import { logger } from "../../utils/Logger";
import { CacheConnectionError, CacheOperationError } from "../../errors/CacheError";

export interface CacheProvider {
    get(key: string): Promise<unknown>;
    set(key: string, value: unknown, ttl?: number): Promise<boolean>;
    del(key: string): Promise<boolean>;
    delPattern(pattern: string): Promise<boolean>;
    flush(): Promise<boolean>;
}

interface CacheOptions {
    defaultTTL?: number;
    logHits?: boolean;
    logMisses?: boolean;
    enabled?: boolean;
}

const DEFAULT_TTL_SEC = 300;

class CacheService {
    private provider: CacheProvider;
    private defaultTTL: number;
    private logHits: boolean;
    private logMisses: boolean;
    private enabled: boolean;

    constructor(provider: CacheProvider, options: CacheOptions = {}) {
        if (!provider) {
            throw new CacheConnectionError("Cache provider is required");
        }
        this.provider = provider;
        this.defaultTTL = options.defaultTTL ?? DEFAULT_TTL_SEC;
        this.logHits = options.logHits ?? true;
        this.logMisses = options.logMisses ?? true;
        this.enabled = options.enabled ?? true;
    }

    async get(key: string): Promise<unknown> {
        if (!this.enabled) return null;
        if (!key) throw new CacheOperationError("Cache key is required");

        const raw = await this.provider.get(key);
        if (raw === null || raw === undefined) {
            if (this.logMisses) logger.debug({ msg: "[Cache] miss", key });
            return null;
        }

        if (this.logHits) logger.debug({ msg: "[Cache] hit", key });
        if (typeof raw === "string" && (raw.startsWith("{") || raw.startsWith("["))) {
            try {
                return JSON.parse(raw) as unknown;
            } catch {
                return raw;
            }
        }
        return raw;
    }

    async set(key: string, value: unknown, ttl?: number): Promise<boolean> {
        if (!this.enabled) return false;
        if (!key) throw new CacheOperationError("Cache key is required");
        if (value === undefined || value === null) {
            logger.debug({ msg: "[Cache] skip set null/undefined", key });
            return false;
        }

        const effectiveTTL = ttl ?? this.defaultTTL;
        const toStore = typeof value === "object" ? JSON.stringify(value) : value;
        await this.provider.set(key, toStore, effectiveTTL);
        logger.debug({ msg: "[Cache] set", key, ttl: effectiveTTL });
        return true;
    }

    async del(key: string): Promise<boolean> {
        if (!this.enabled) return false;
        try {
            const ok = await this.provider.del(key);
            if (ok) logger.debug({ msg: "[Cache] del", key });
            return ok;
        } catch (error) {
            logger.error({ msg: "[Cache] del error", key, error: String(error) });
            return false;
        }
    }

    async delPattern(pattern: string): Promise<boolean> {
        if (!this.enabled) return false;
        try {
            return await this.provider.delPattern(pattern);
        } catch (error) {
            logger.error({ msg: "[Cache] delPattern error", pattern, error: String(error) });
            return false;
        }
    }

    async flush(): Promise<boolean> {
        if (!this.enabled) return false;
        await this.provider.flush();
        logger.debug({ msg: "[Cache] flush" });
        return true;
    }

    async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
        if (!this.enabled) return factory();
        if (!key) throw new CacheOperationError("Cache key is required");
        if (typeof factory !== "function") throw new CacheOperationError("Factory must be a function");

        const cached = await this.get(key);
        if (cached !== null && cached !== undefined) {
            return cached as T;
        }

        const value = await factory();
        if (value !== null && value !== undefined) {
            await this.set(key, value, ttl ?? this.defaultTTL);
        }
        return value;
    }
}

export default CacheService;
