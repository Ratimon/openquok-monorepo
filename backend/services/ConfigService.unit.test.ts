import type { ConfigRepository } from "../repositories/ConfigRepository";
import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import { ConfigService } from "./ConfigService";

function createMockConfigRepo(): jest.Mocked<ConfigRepository> {
    return {
        getConfigByModuleName: jest.fn(),
        // not used by ConfigService tests below, but part of the interface
        getConfigByModuleNameAndProperty: jest.fn(),
        getConfigByModuleNameAndProperties: jest.fn(),
        updateConfigByModuleName: jest.fn(),
    } as unknown as jest.Mocked<ConfigRepository>;
}

function createMockCacheInvalidator(): jest.Mocked<CacheInvalidationService> {
    return {
        invalidateKey: jest.fn().mockResolvedValue(true),
        invalidatePattern: jest.fn().mockResolvedValue(true),
        // not used in tests below
        invalidateEntity: jest.fn().mockResolvedValue(true),
        getMetrics: jest.fn().mockReturnValue({}),
        resetMetrics: jest.fn(),
    } as unknown as jest.Mocked<CacheInvalidationService>;
}

describe("ConfigService", () => {
    describe("getModuleConfig", () => {
        it("uses cache when provided (skips repository)", async () => {
            const moduleName = "company_information";
            const expected = { COMPANY_NAME: "ACME" };

            const repo = createMockConfigRepo();
            repo.getConfigByModuleName.mockResolvedValue({
                data: { module_name: moduleName, config: expected, updated_at: new Date().toISOString() },
            });

            const cache = {
                getOrSet: jest.fn().mockResolvedValue(expected),
            } as unknown as jest.Mocked<Pick<CacheService, "getOrSet">>;

            const service = new ConfigService(repo, cache as unknown as CacheService);
            const result = await service.getModuleConfig(moduleName);

            expect(result).toEqual(expected);
            expect(cache.getOrSet).toHaveBeenCalledWith(
                `config:${moduleName}`,
                expect.any(Function),
                300
            );
            expect(repo.getConfigByModuleName).not.toHaveBeenCalled();
        });

        it("calls repository when cache is missing", async () => {
            const moduleName = "marketing_information";
            const expected = { MARKETING_TAGLINE: "Hello" };

            const repo = createMockConfigRepo();
            repo.getConfigByModuleName.mockResolvedValue({
                data: { module_name: moduleName, config: expected, updated_at: new Date().toISOString() },
            });

            const service = new ConfigService(repo);
            const result = await service.getModuleConfig(moduleName);

            expect(result).toEqual(expected);
            expect(repo.getConfigByModuleName).toHaveBeenCalledTimes(1);
            expect(repo.getConfigByModuleName).toHaveBeenCalledWith(moduleName);
        });
    });

    describe("updateModuleConfig", () => {
        it("invalidates related caches when update is saved", async () => {
            const moduleName = "company_information";
            const newConfig = { UPDATED_AT: Date.now() };

            const repo = createMockConfigRepo();
            repo.updateConfigByModuleName.mockResolvedValue(true);

            const invalidator = createMockCacheInvalidator();
            const service = new ConfigService(repo, undefined, invalidator);

            const result = await service.updateModuleConfig({ moduleName, newConfig });

            expect(result).toEqual({ isSaved: true });
            expect(invalidator.invalidatePattern).toHaveBeenCalledTimes(1);
            expect(invalidator.invalidatePattern).toHaveBeenCalledWith("config:*");
            expect(invalidator.invalidateKey).toHaveBeenCalledTimes(1);
            expect(invalidator.invalidateKey).toHaveBeenCalledWith("config:module:blog:information");
        });

        it("does not invalidate caches when update is not saved", async () => {
            const moduleName = "company_information";
            const newConfig = { UPDATED_AT: Date.now() };

            const repo = createMockConfigRepo();
            repo.updateConfigByModuleName.mockResolvedValue(false);

            const invalidator = createMockCacheInvalidator();
            const service = new ConfigService(repo, undefined, invalidator);

            const result = await service.updateModuleConfig({ moduleName, newConfig });

            expect(result).toEqual({ isSaved: false });
            expect(invalidator.invalidatePattern).not.toHaveBeenCalled();
            expect(invalidator.invalidateKey).not.toHaveBeenCalled();
        });
    });
});

