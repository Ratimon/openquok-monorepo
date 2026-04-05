import CacheInvalidationService from "./CacheInvalidationService";
import type CacheService from "./CacheService";
import { logger } from "../../utils/Logger";

describe("CacheInvalidationService", () => {
    let cacheService: jest.Mocked<Pick<CacheService, "del" | "delPattern">>;
    let cacheInvalidationService: CacheInvalidationService;

    beforeEach(() => {
        jest.spyOn(logger, "error").mockImplementation(() => {});
        jest.spyOn(logger, "warn").mockImplementation(() => {});
        cacheService = {
            del: jest.fn().mockResolvedValue(true),
            delPattern: jest.fn().mockResolvedValue(true),
        };
        cacheInvalidationService = new CacheInvalidationService(cacheService as unknown as CacheService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("initialization", () => {
        it("should throw if cache service is not provided", () => {
            expect(() => {
                new CacheInvalidationService(null as unknown as CacheService);
            }).toThrow("Cache service is required for the Cache Invalidation Service");
        });

        it("should initialize metrics object", () => {
            const metrics = cacheInvalidationService.getMetrics();

            expect(metrics).toHaveProperty("invalidationsByEntityType");
            expect(metrics.invalidationsByEntityType).toEqual({});
            expect(metrics).toHaveProperty("patternInvalidations");
            expect(metrics.patternInvalidations).toBe(0);
            expect(metrics).toHaveProperty("keyInvalidations");
            expect(metrics.keyInvalidations).toBe(0);
            expect(metrics).toHaveProperty("failedInvalidations");
            expect(metrics.failedInvalidations).toBe(0);
            expect(metrics).toHaveProperty("uptime");
            expect(typeof metrics.uptime).toBe("number");
            expect(metrics).toHaveProperty("totalInvalidations");
            expect(metrics.totalInvalidations).toBe(0);
            expect(metrics).toHaveProperty("lastInvalidation");
            expect(metrics.lastInvalidation).toBeNull();
        });
    });

    describe("invalidateKey", () => {
        it("should call cache del with the provided key", async () => {
            await cacheInvalidationService.invalidateKey("test:key");

            expect(cacheService.del).toHaveBeenCalledTimes(1);
            expect(cacheService.del).toHaveBeenCalledWith("test:key");
        });

        it("should increment keyInvalidations metric", async () => {
            await cacheInvalidationService.invalidateKey("test:key");

            const metrics = cacheInvalidationService.getMetrics();
            expect(metrics.keyInvalidations).toBe(1);
        });

        it("should update lastInvalidation with key information", async () => {
            await cacheInvalidationService.invalidateKey("test:key");

            const metrics = cacheInvalidationService.getMetrics();

            expect(metrics.lastInvalidation).not.toBeNull();
            expect(metrics.lastInvalidation?.type).toBe("key");
            expect(metrics.lastInvalidation?.key).toBe("test:key");
            expect(metrics.lastInvalidation?.timestamp).toBeDefined();
        });

        it("should handle cache errors gracefully", async () => {
            cacheService.del.mockRejectedValueOnce(new Error("Fake cache error"));

            const result = await cacheInvalidationService.invalidateKey("test:key");

            expect(result).toBe(false);

            const metrics = cacheInvalidationService.getMetrics();
            expect(metrics.failedInvalidations).toBe(1);
        });

        it("should return true on successful invalidation", async () => {
            const result = await cacheInvalidationService.invalidateKey("test:key");
            expect(result).toBe(true);
        });
    });

    describe("invalidatePattern", () => {
        it("should call cache delPattern with the provided pattern", async () => {
            await cacheInvalidationService.invalidatePattern("test:*");
            expect(cacheService.delPattern).toHaveBeenCalledTimes(1);
            expect(cacheService.delPattern).toHaveBeenCalledWith("test:*");
        });

        it("should increment patternInvalidations metric", async () => {
            await cacheInvalidationService.invalidatePattern("test:*");
            const metrics = cacheInvalidationService.getMetrics();
            expect(metrics.patternInvalidations).toBe(1);
        });

        it("should update lastInvalidation with pattern information", async () => {
            await cacheInvalidationService.invalidatePattern("test:*");
            const metrics = cacheInvalidationService.getMetrics();
            expect(metrics.lastInvalidation).not.toBeNull();
            expect(metrics.lastInvalidation?.type).toBe("pattern");
            expect(metrics.lastInvalidation?.pattern).toBe("test:*");
            expect(metrics.lastInvalidation?.timestamp).toBeDefined();
        });

        it("should handle cache errors gracefully", async () => {
            cacheService.delPattern.mockRejectedValueOnce(new Error("Fake cache error"));
            const result = await cacheInvalidationService.invalidatePattern("test:*");
            expect(result).toBe(false);

            const metrics = cacheInvalidationService.getMetrics();
            expect(metrics.failedInvalidations).toBe(1);
        });

        it("should return true on successful invalidation", async () => {
            const result = await cacheInvalidationService.invalidatePattern("test:*");
            expect(result).toBe(true);
        });
    });

    describe("invalidateEntity", () => {
        it("should return false for missing entityType", async () => {
            const result = await cacheInvalidationService.invalidateEntity(
                null as unknown as string,
                "id123"
            );
            expect(result).toBe(false);
            expect(cacheService.del).not.toHaveBeenCalled();
            expect(cacheService.delPattern).not.toHaveBeenCalled();
        });

        it("should return false for missing entityId", async () => {
            const result = await cacheInvalidationService.invalidateEntity(
                "user",
                null as unknown as string
            );
            expect(result).toBe(false);
            expect(cacheService.del).not.toHaveBeenCalled();
            expect(cacheService.delPattern).not.toHaveBeenCalled();
        });

        it("should return false for empty entityType", async () => {
            const result = await cacheInvalidationService.invalidateEntity("", "id123");
            expect(result).toBe(false);
        });

        it("should return false for empty entityId", async () => {
            const result = await cacheInvalidationService.invalidateEntity("user", "");
            expect(result).toBe(false);
        });

        it("should invalidate by-id key and related patterns", async () => {
            await cacheInvalidationService.invalidateEntity("user", "user123");

            expect(cacheService.del).toHaveBeenCalledWith("user:byId:user123");
            expect(cacheService.delPattern).toHaveBeenCalledWith("user:*:user123:*");
            expect(cacheService.delPattern).toHaveBeenCalledWith("user:*:*:user123");
        });

        it("should update entity-specific invalidation metrics", async () => {
            await cacheInvalidationService.invalidateEntity("user", "user123");
            await cacheInvalidationService.invalidateEntity("user", "user456");
            await cacheInvalidationService.invalidateEntity("blog", "blog123");

            const metrics = cacheInvalidationService.getMetrics();
            expect(metrics.invalidationsByEntityType.user).toBe(2);
            expect(metrics.invalidationsByEntityType.blog).toBe(1);
        });

        it("should handle cache errors gracefully", async () => {
            cacheService.del.mockRejectedValueOnce(new Error("Fake cache error"));
            cacheService.delPattern.mockRejectedValueOnce(new Error("Fake cache error"));
            cacheService.delPattern.mockRejectedValueOnce(new Error("Fake cache error"));

            const result = await cacheInvalidationService.invalidateEntity("user", "user123");

            expect(result).toBe(true);

            const metrics = cacheInvalidationService.getMetrics();
            expect(metrics.failedInvalidations).toBeGreaterThan(0);
        });

        it("should return true on successful invalidation", async () => {
            const result = await cacheInvalidationService.invalidateEntity("user", "user123");
            expect(result).toBe(true);
        });
    });

    describe("getMetrics", () => {
        it("should return correct totalInvalidations calculation", async () => {
            await cacheInvalidationService.invalidateKey("test:key1");
            await cacheInvalidationService.invalidateKey("test:key2");
            await cacheInvalidationService.invalidatePattern("test:*");

            const metrics = cacheInvalidationService.getMetrics();
            expect(metrics.totalInvalidations).toBe(3);
            expect(metrics.keyInvalidations).toBe(2);
            expect(metrics.patternInvalidations).toBe(1);
        });

        it("should return uptime as a non-negative number", () => {
            const metrics = cacheInvalidationService.getMetrics();
            expect(metrics.uptime).toBeGreaterThanOrEqual(0);
        });

        it("should include all metrics properties", () => {
            const metrics = cacheInvalidationService.getMetrics();
            expect(metrics).toHaveProperty("invalidationsByEntityType");
            expect(metrics).toHaveProperty("patternInvalidations");
            expect(metrics).toHaveProperty("keyInvalidations");
            expect(metrics).toHaveProperty("failedInvalidations");
            expect(metrics).toHaveProperty("lastInvalidation");
            expect(metrics).toHaveProperty("uptime");
            expect(metrics).toHaveProperty("totalInvalidations");
        });
    });

    describe("resetMetrics", () => {
        it("should reset all metrics counters", async () => {
            await cacheInvalidationService.invalidateKey("test:key");
            await cacheInvalidationService.invalidatePattern("test:*");
            await cacheInvalidationService.invalidateEntity("user", "user123");

            let metrics = cacheInvalidationService.getMetrics();
            expect(metrics.keyInvalidations).toBeGreaterThan(0);
            expect(metrics.patternInvalidations).toBeGreaterThan(0);
            expect(metrics.invalidationsByEntityType.user).toBeGreaterThan(0);

            cacheInvalidationService.resetMetrics();

            metrics = cacheInvalidationService.getMetrics();
            expect(metrics.keyInvalidations).toBe(0);
            expect(metrics.patternInvalidations).toBe(0);
            expect(metrics.invalidationsByEntityType).toEqual({});
            expect(metrics.failedInvalidations).toBe(0);
        });

        it("should preserve lastInvalidation when resetting metrics", async () => {
            await cacheInvalidationService.invalidateKey("test:key");

            const originalMetrics = cacheInvalidationService.getMetrics();
            const lastInvalidation = originalMetrics.lastInvalidation;

            cacheInvalidationService.resetMetrics();

            const newMetrics = cacheInvalidationService.getMetrics();
            expect(newMetrics.lastInvalidation).toEqual(lastInvalidation);
        });

        it("should reset metrics multiple times correctly", async () => {
            await cacheInvalidationService.invalidateKey("test:key1");
            cacheInvalidationService.resetMetrics();

            await cacheInvalidationService.invalidateKey("test:key2");
            const metrics = cacheInvalidationService.getMetrics();
            expect(metrics.keyInvalidations).toBe(1);
            expect(metrics.totalInvalidations).toBe(1);
        });
    });
});
