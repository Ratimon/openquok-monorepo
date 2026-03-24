import type { ConfigRepository } from "../repositories/ConfigRepository";
import type { ModuleConfigRow } from "../repositories/ConfigRepository";
import type CacheService from "../connections/cache/CacheService";

export interface CompanyInformationRow extends ModuleConfigRow {}

const CACHE_KEYS = {
    CONFIG_COMPANY_INFORMATION: "config:module:company_information",
};

const COMPANY_CACHE_TTL = 300;

export class CompanyService {
    private static readonly MODULE_NAME = "company_information";

    constructor(
        private readonly configRepository: ConfigRepository,
        private readonly cache: CacheService
    ) {}

    async getAllCompanyInformation(): Promise<CompanyInformationRow> {
        const cacheKey = CACHE_KEYS.CONFIG_COMPANY_INFORMATION;
        return this.cache.getOrSet(cacheKey, async () => {
            const { data } = await this.configRepository.getConfigByModuleName(
                CompanyService.MODULE_NAME
            );
            return data as CompanyInformationRow;
        }, COMPANY_CACHE_TTL);
    }

    async getCompanyInformationByProperties(
        properties: string[]
    ): Promise<Record<string, string>> {
        if (!properties || properties.length === 0) {
            return {};
        }
        const cacheKey = `${CACHE_KEYS.CONFIG_COMPANY_INFORMATION}:${properties.join(":")}`;
        return this.cache.getOrSet(cacheKey, async () => {
            const { result } = await this.configRepository.getConfigByModuleNameAndProperties({
                moduleName: CompanyService.MODULE_NAME,
                properties,
            });
            return result;
        }, COMPANY_CACHE_TTL);
    }
}
