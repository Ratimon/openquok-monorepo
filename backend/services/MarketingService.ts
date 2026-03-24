import type { ConfigRepository } from "../repositories/ConfigRepository";
import type { ModuleConfigRow } from "../repositories/ConfigRepository";
import type CacheService from "../connections/cache/CacheService";

export interface MarketingInformationRow extends ModuleConfigRow {}

/** Domain-scoped cache key prefixes. */
const CACHE_KEYS = {
    CONFIG_MARKETING_INFORMATION: "config:module:marketing_information",
};

const MARKETING_CACHE_TTL_SEC = 300;

export class MarketingService {
    private static readonly MODULE_NAME = "marketing_information";

    constructor(
        private readonly configRepository: ConfigRepository,
        private readonly cache?: CacheService
    ) {}

    async getMarketingInformation(): Promise<MarketingInformationRow> {
        const cacheKey = CACHE_KEYS.CONFIG_MARKETING_INFORMATION;
        const factory = async (): Promise<MarketingInformationRow> => {
            const { data } = await this.configRepository.getConfigByModuleName(
                MarketingService.MODULE_NAME
            );
            return data as MarketingInformationRow;
        };
        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, MARKETING_CACHE_TTL_SEC);
        }
        return factory();
    }

    async getMarketingInformationByProperties(
        properties: string[]
    ): Promise<Record<string, string>> {
        if (!properties || properties.length === 0) {
            return {};
        }
        const cacheKey = `${CACHE_KEYS.CONFIG_MARKETING_INFORMATION}:${properties.join(":")}`;
        const factory = async (): Promise<Record<string, string>> => {
            const { result } = await this.configRepository.getConfigByModuleNameAndProperties({
                moduleName: MarketingService.MODULE_NAME,
                properties,
            });
            return result;
        };
        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, MARKETING_CACHE_TTL_SEC);
        }
        return factory();
    }
}
