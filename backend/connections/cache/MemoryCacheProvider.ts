import { logger } from "../../utils/Logger";

interface CacheOptions {
    ttl?: number;
    checkPeriod?: number;
    enablePatterns?: boolean;
}

interface Entry {
    value: unknown;
    expiry: number | null;
}

/**
 * In-memory cache provider (Map + TTL). No external dependency.
 */
class MemoryCacheProvider {
    private cache = new Map<string, Entry>();
    private defaultTTL: number;
    private enablePatterns: boolean;

    constructor(options: CacheOptions = {}) {
        this.defaultTTL = options.ttl ?? 300;
        this.enablePatterns = options.enablePatterns ?? true;
        logger.info({
            msg: "[Cache] Memory cache provider initialized",
            defaultTTL: this.defaultTTL,
        });
    }

    private isExpired(entry: Entry): boolean {
        return entry.expiry !== null && Date.now() > entry.expiry;
    }

    async get(key: string): Promise<unknown> {
        const entry = this.cache.get(key);
        if (entry === undefined) return null;
        if (this.isExpired(entry)) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }

    async set(key: string, value: unknown, ttl?: number): Promise<boolean> {
        const ttlSec = ttl ?? this.defaultTTL;
        const expiry = ttlSec > 0 ? Date.now() + ttlSec * 1000 : null;
        this.cache.set(key, { value, expiry });
        return true;
    }

    async delete(key: string): Promise<boolean> {
        return this.cache.delete(key);
    }

    async del(key: string): Promise<boolean> {
        return this.delete(key);
    }

    private patternToRegex(pattern: string): RegExp {
        const escaped = pattern
            .split("*")
            .map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
            .join(".*");
        return new RegExp(`^${escaped}$`);
    }

    async delPattern(pattern: string): Promise<boolean> {
        if (!this.enablePatterns) return false;
        const re = this.patternToRegex(pattern);
        let deleted = 0;
        for (const key of this.cache.keys()) {
            if (re.test(key)) {
                this.cache.delete(key);
                deleted++;
            }
        }
        return deleted > 0;
    }

    async flush(): Promise<boolean> {
        this.cache.clear();
        return true;
    }
}

export default MemoryCacheProvider;
