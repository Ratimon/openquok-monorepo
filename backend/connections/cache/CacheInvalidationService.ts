import type CacheService from "./CacheService";
import { logger } from "../../utils/Logger";

class CacheInvalidationService {
    private cache: CacheService;

    private metrics: {
        invalidationsByEntityType: Record<string, number>;
        patternInvalidations: number;
        keyInvalidations: number;
        failedInvalidations: number;
        lastInvalidation: {
            type: string;
            key?: string;
            pattern?: string;
            timestamp: string;
        } | null;
    };

    private startTime: number;

    constructor(cacheService: CacheService) {
        if (!cacheService) {
            throw new Error("Cache service is required for the Cache Invalidation Service");
        }

        this.cache = cacheService;

        this.metrics = {
            invalidationsByEntityType: {},
            patternInvalidations: 0,
            keyInvalidations: 0,
            failedInvalidations: 0,
            lastInvalidation: null,
        };

        this.startTime = Date.now();
    }

    getMetrics() {
        return {
            ...this.metrics,
            uptime: Date.now() - this.startTime,
            totalInvalidations: this.metrics.patternInvalidations + this.metrics.keyInvalidations,
        };
    }

    resetMetrics(): void {
        this.metrics = {
            invalidationsByEntityType: {},
            patternInvalidations: 0,
            keyInvalidations: 0,
            failedInvalidations: 0,
            lastInvalidation: this.metrics.lastInvalidation,
        };
        logger.info({ msg: "Cache invalidation metrics have been reset" });
    }

    async invalidateKey(key: string): Promise<boolean> {
        try {
            await this.cache.del(key);

            this.metrics.keyInvalidations++;
            this.metrics.lastInvalidation = {
                type: "key",
                key,
                timestamp: new Date().toISOString(),
            };

            logger.debug({ msg: "Invalidated cache key", key });
            return true;
        } catch (error) {
            this.metrics.failedInvalidations++;
            logger.error({ msg: "Error invalidating cache key", key, error: String(error) });
            return false;
        }
    }

    async invalidatePattern(pattern: string): Promise<boolean> {
        try {
            await this.cache.delPattern(pattern);

            this.metrics.patternInvalidations++;
            this.metrics.lastInvalidation = {
                type: "pattern",
                pattern,
                timestamp: new Date().toISOString(),
            };

            logger.debug({ msg: "Invalidated cache keys matching pattern", pattern });
            return true;
        } catch (error) {
            this.metrics.failedInvalidations++;
            logger.error({ msg: "Error invalidating cache pattern", pattern, error: String(error) });
            return false;
        }
    }

    async invalidateEntity(entityType: string, entityId: string): Promise<boolean> {
        if (!entityType || !entityId) {
            logger.warn({
                msg: "Invalid entity type or ID provided for cache invalidation",
                entityType,
                entityId,
            });
            return false;
        }
        try {
            await this.invalidateKey(`${entityType}:byId:${entityId}`);
            await this.invalidatePattern(`${entityType}:*:${entityId}:*`);
            await this.invalidatePattern(`${entityType}:*:*:${entityId}`);

            if (!this.metrics.invalidationsByEntityType[entityType]) {
                this.metrics.invalidationsByEntityType[entityType] = 0;
            }
            this.metrics.invalidationsByEntityType[entityType]++;

            logger.debug({ msg: "Invalidated entity", entityType, entityId });
            return true;
        } catch (error) {
            this.metrics.failedInvalidations++;
            logger.error({
                msg: "Error invalidating entity",
                entityType,
                entityId,
                error: String(error),
            });
            return false;
        }
    }
}

export default CacheInvalidationService;
