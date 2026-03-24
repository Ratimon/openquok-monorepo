/// <reference types="jest" />
import type { BlogRepository } from "../../repositories/BlogRepository";
import type { ConfigRepository, ModuleConfigRow } from "../../repositories/ConfigRepository";
import CacheInvalidationService from "../../connections/cache/CacheInvalidationService";
import CacheService from "../../connections/cache/CacheService";
import MemoryCacheProvider from "../../connections/cache/MemoryCacheProvider";
import { ConfigService } from "../../services/ConfigService";
import { BlogService } from "../../services/BlogService";
import { CompanyService } from "../../services/CompanyService";
import { MarketingService } from "../../services/MarketingService";

function createCache() {
    const provider = new MemoryCacheProvider({
        ttl: 300,
        checkPeriod: 60,
        enablePatterns: true,
    });
    const cacheService = new CacheService(provider, {
        defaultTTL: 300,
        logHits: false,
        logMisses: false,
        enabled: true,
    });
    const cacheInvalidationService = new CacheInvalidationService(cacheService);
    return { cacheService, cacheInvalidationService };
}

function moduleRow(module_name: string, config: Record<string, unknown>): ModuleConfigRow {
    return {
        module_name,
        config,
        updated_at: new Date("2020-01-01T00:00:00.000Z").toISOString(),
    };
}

describe("Config integration: cache keys + invalidation", () => {
    let configRepository: jest.Mocked<ConfigRepository>;
    let cacheService: CacheService;
    let cacheInvalidationService: CacheInvalidationService;

    const blogRepo = {} as unknown as BlogRepository;

    beforeEach(async () => {
        ({ cacheService, cacheInvalidationService } = createCache());

        configRepository = {
            getConfigByModuleName: jest.fn(),
            getConfigByModuleNameAndProperty: jest.fn(),
            getConfigByModuleNameAndProperties: jest.fn(),
            updateConfigByModuleName: jest.fn(),
        } as unknown as jest.Mocked<ConfigRepository>;

        await cacheService.flush();

        const companyRow = moduleRow("company_information", { COMPANY_NAME: "ACME" });
        const marketingRow = moduleRow("marketing_information", { MARKETING_TAGLINE: "Hello" });

        configRepository.getConfigByModuleName.mockImplementation(async (moduleName: string) => {
            if (moduleName === "company_information") return { data: companyRow };
            if (moduleName === "marketing_information") return { data: marketingRow };
            throw new Error(`Unexpected moduleName for getConfigByModuleName: ${moduleName}`);
        });

        const blogSeo = {
            BLOG_POST_SEO_META_TITLE: "Blog title",
            BLOG_POST_SEO_META_DESCRIPTION: "Blog description",
            BLOG_POST_SEO_META_TAGS: "tag1,tag2",
        } as Record<string, string>;

        configRepository.getConfigByModuleNameAndProperties.mockImplementation(async (params) => {
            const { moduleName, properties } = params as { moduleName: string; properties: string[] };

            if (moduleName === "blog") {
                const result: Record<string, string> = {};
                for (const p of properties) result[p] = blogSeo[p] ?? "missing";
                return { result, error: null };
            }

            if (moduleName === "company_information") {
                const result: Record<string, string> = {};
                for (const p of properties) result[p] = `company:${p}`;
                return { result, error: null };
            }

            if (moduleName === "marketing_information") {
                const result: Record<string, string> = {};
                for (const p of properties) result[p] = `marketing:${p}`;
                return { result, error: null };
            }

            throw new Error(`Unexpected moduleName for getConfigByModuleNameAndProperties: ${moduleName}`);
        });

        configRepository.updateConfigByModuleName.mockResolvedValue(true);
    });

    it("caches getModuleConfig() results per moduleName", async () => {
        const configService = new ConfigService(configRepository, cacheService, cacheInvalidationService);

        const res1 = await configService.getModuleConfig("company_information");
        const res2 = await configService.getModuleConfig("company_information");

        expect(res1).toEqual({ COMPANY_NAME: "ACME" });
        expect(res2).toEqual(res1);
        expect(configRepository.getConfigByModuleName).toHaveBeenCalledTimes(1);
        expect(configRepository.getConfigByModuleName).toHaveBeenCalledWith("company_information");
    });

    it("caches and invalidates ConfigService + Blog/Company/Marketing caches", async () => {
        const configService = new ConfigService(configRepository, cacheService, cacheInvalidationService);
        const blogService = new BlogService(blogRepo, cacheService, cacheInvalidationService, configRepository);
        const companyService = new CompanyService(configRepository, cacheService);
        const marketingService = new MarketingService(configRepository, cacheService);

        // Seed caches
        await configService.getModuleConfig("company_information"); // config:company_information
        await companyService.getAllCompanyInformation(); // config:module:company_information
        await marketingService.getMarketingInformation(); // config:module:marketing_information
        await blogService.getBlogInformation(); // config:module:blog:information
        await companyService.getCompanyInformationByProperties(["A", "B"]); // config:module:company_information:A:B
        await marketingService.getMarketingInformationByProperties(["X"]); // config:module:marketing_information:X

        const expectedKeys = [
            "config:company_information",
            "config:module:company_information",
            "config:module:marketing_information",
            "config:module:blog:information",
            "config:module:company_information:A:B",
            "config:module:marketing_information:X",
        ];

        for (const key of expectedKeys) {
            expect(await cacheService.get(key)).not.toBeNull();
        }

        // Ensure cache hits (no additional repository calls)
        configRepository.getConfigByModuleName.mockClear();
        configRepository.getConfigByModuleNameAndProperties.mockClear();
        configRepository.updateConfigByModuleName.mockClear();

        await configService.getModuleConfig("company_information");
        await companyService.getAllCompanyInformation();
        await marketingService.getMarketingInformation();
        await blogService.getBlogInformation();
        await companyService.getCompanyInformationByProperties(["A", "B"]);
        await marketingService.getMarketingInformationByProperties(["X"]);

        expect(configRepository.getConfigByModuleName).not.toHaveBeenCalled();
        expect(configRepository.getConfigByModuleNameAndProperties).not.toHaveBeenCalled();
        expect(configRepository.updateConfigByModuleName).not.toHaveBeenCalled();

        // Invalidate via ConfigService.updateModuleConfig()
        await configService.updateModuleConfig({
            moduleName: "company_information",
            newConfig: { UPDATED_AT: Date.now() },
        });

        // Keys should be removed
        for (const key of expectedKeys) {
            expect(await cacheService.get(key)).toBeNull();
        }

        // Repopulate after invalidation
        configRepository.getConfigByModuleName.mockClear();
        configRepository.getConfigByModuleNameAndProperties.mockClear();

        await configService.getModuleConfig("company_information");
        await companyService.getAllCompanyInformation();
        await marketingService.getMarketingInformation();
        await blogService.getBlogInformation();
        await companyService.getCompanyInformationByProperties(["A", "B"]);
        await marketingService.getMarketingInformationByProperties(["X"]);

        // 3 module config reads for configService/companyService/marketingService
        expect(configRepository.getConfigByModuleName).toHaveBeenCalledTimes(3);
        // 3 property reads for blog/company properties/marketing properties
        expect(configRepository.getConfigByModuleNameAndProperties).toHaveBeenCalledTimes(3);
    });
});

