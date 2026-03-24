import type { ConfigRepository } from "../repositories/ConfigRepository";
import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";

const CACHE_KEYS = {
    CONFIG: "config",
    BLOG_INFORMATION: "config:module:blog:information",
} as const;

const CONFIG_CACHE_TTL_SEC = 300;

export class ConfigService {
    constructor(
        private readonly configRepository: ConfigRepository,
        private readonly cache?: CacheService,
        private readonly cacheInvalidator?: CacheInvalidationService
    ) {}

    async getModuleConfig(moduleName: string): Promise<Record<string, unknown>> {
        const cacheKey = `${CACHE_KEYS.CONFIG}:${moduleName}`;
        const factory = async (): Promise<Record<string, unknown>> => {
            const { data } = await this.configRepository.getConfigByModuleName(moduleName);
            return (data.config ?? {}) as Record<string, unknown>;
        };

        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, CONFIG_CACHE_TTL_SEC);
        }
        return factory();
    }

    async updateModuleConfig(params: {
        moduleName: string;
        newConfig: Record<string, unknown>;
    }): Promise<{ isSaved: boolean }> {
        const { moduleName, newConfig } = params;
        const isSaved = await this.configRepository.updateConfigByModuleName({ moduleName, newConfig });

        if (isSaved) {
            await this.invalidateConfigRelatedCaches();
        }

        return { isSaved };
    }

    private async invalidateConfigRelatedCaches(): Promise<void> {
        if (!this.cacheInvalidator) return;

        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.CONFIG}:*`);
        await this.cacheInvalidator.invalidateKey(CACHE_KEYS.BLOG_INFORMATION);
    }
}
