import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import type { IntegrationRepository } from "../repositories/IntegrationRepository";
import type { PlugRepository } from "../repositories/PlugRepository";
import type { IntegrationPlugRowDto } from "../utils/dtos/PlugDTO";
import { DatabaseError } from "../errors/InfraError";
import { logger } from "../utils/Logger";

/**
 * Cache key segments for this service: integration-domain patterns ({@link IntegrationService})
 * and plug row/list read-through keys.
 */
const CACHE_KEYS = {
    INTEGRATION: "integration",
    
    PLUG_LIST: "plug:list",
    PLUG_ACTIVATED: "plug:activated",
    PLUG_ROW: "plug:row",
} as const;

/** TTL for plug list / row read-through cache (shorter in development for quicker iteration). */
const PLUG_CACHE_TTL_SEC =
    !process.env.NODE_ENV || process.env.NODE_ENV === "development" ? 15 : 90;

function plugsListCacheKey(organizationId: string, integrationId: string): string {
    return `${CACHE_KEYS.PLUG_LIST}:${organizationId}:${integrationId}`;
}

function plugsActivatedCacheKey(organizationId: string, integrationId: string): string {
    return `${CACHE_KEYS.PLUG_ACTIVATED}:${organizationId}:${integrationId}`;
}

function plugRowCacheKey(plugId: string): string {
    return `${CACHE_KEYS.PLUG_ROW}:${plugId}`;
}

/**
 * Global plug rules (`public.plugs`): CRUD, activation, read-through Redis cache, and integration-domain invalidation.
 */
export class PlugService {
    constructor(
        private readonly plugRepository: PlugRepository,
        private readonly integrationRepository: IntegrationRepository,
        private readonly cache?: CacheService,
        private readonly cacheInvalidator?: CacheInvalidationService
    ) {}

    async listIntegrationPlugs(organizationId: string, integrationId: string): Promise<IntegrationPlugRowDto[]> {
        if (!this.cache) {
            return this.plugRepository.listPlugsByIntegration(organizationId, integrationId);
        }
        const key = plugsListCacheKey(organizationId, integrationId);
        return this.cache.getOrSet(
            key,
            () => this.plugRepository.listPlugsByIntegration(organizationId, integrationId),
            PLUG_CACHE_TTL_SEC
        );
    }

    async listActivatedPlugsByIntegration(
        organizationId: string,
        integrationId: string
    ): Promise<IntegrationPlugRowDto[]> {
        if (!this.cache) {
            return this.plugRepository.listActivatedPlugsByIntegration(organizationId, integrationId);
        }
        const key = plugsActivatedCacheKey(organizationId, integrationId);
        return this.cache.getOrSet(
            key,
            () => this.plugRepository.listActivatedPlugsByIntegration(organizationId, integrationId),
            PLUG_CACHE_TTL_SEC
        );
    }

    async getPlugRowById(plugId: string): Promise<IntegrationPlugRowDto | null> {
        if (!this.cache) {
            return this.plugRepository.getPlugRowById(plugId);
        }
        const key = plugRowCacheKey(plugId);
        return this.cache.getOrSet(key, () => this.plugRepository.getPlugRowById(plugId), PLUG_CACHE_TTL_SEC);
    }

    async upsertIntegrationPlug(params: {
        organizationId: string;
        integrationId: string;
        plugFunction: string;
        dataJson: string;
        plugId?: string;
    }): Promise<{ id: string; activated: boolean }> {
        let row: { id: string; activated: boolean };
        if (params.plugId) {
            const updated = await this.plugRepository.updatePlugData({
                organizationId: params.organizationId,
                integrationId: params.integrationId,
                plugId: params.plugId,
                dataJson: params.dataJson,
            });
            if (!updated) {
                throw new DatabaseError("Plug not found or not updatable", {
                    operation: "update",
                    resource: { type: "table", name: "plugs" },
                });
            }
            row = updated;
        } else {
            row = await this.plugRepository.insertPlug({
                organizationId: params.organizationId,
                integrationId: params.integrationId,
                plugFunction: params.plugFunction,
                dataJson: params.dataJson,
            });
        }
        await this.invalidatePlugReadCaches(params.organizationId, params.integrationId, [row.id]);
        await this.invalidateIntegrationDomainCacheForIntegration(params.organizationId, params.integrationId);
        return row;
    }

    async deleteIntegrationPlug(organizationId: string, plugId: string): Promise<{ id: string } | null> {
        const existing = await this.plugRepository.getPlugRowById(plugId);
        const result = await this.plugRepository.deletePlugById(organizationId, plugId);
        if (existing && result) {
            await this.invalidatePlugReadCaches(organizationId, existing.integration_id, [plugId]);
            await this.invalidateIntegrationDomainCacheForIntegration(organizationId, existing.integration_id);
        }
        return result;
    }

    async setIntegrationPlugActivated(
        organizationId: string,
        plugId: string,
        activated: boolean
    ): Promise<{ id: string } | null> {
        const existing = await this.plugRepository.getPlugRowById(plugId);
        const result = await this.plugRepository.setPlugActivated(organizationId, plugId, activated);
        if (existing) {
            await this.invalidatePlugReadCaches(organizationId, existing.integration_id, [plugId]);
            await this.invalidateIntegrationDomainCacheForIntegration(organizationId, existing.integration_id);
        }
        return result;
    }

    /** Drops plug read caches for one channel (list + activated list + affected rows). */
    private async invalidatePlugReadCaches(
        organizationId: string,
        integrationId: string,
        plugIds: string[]
    ): Promise<void> {
        if (!this.cache) return;
        await Promise.all([
            this.cache.del(plugsListCacheKey(organizationId, integrationId)),
            this.cache.del(plugsActivatedCacheKey(organizationId, integrationId)),
            ...plugIds.map((id) => this.cache!.del(plugRowCacheKey(id))),
        ]);
        logger.debug({
            msg: "Invalidated plug read caches",
            organizationId,
            integrationId,
            plugIds,
        });
    }

    private async invalidateIntegrationDomainCacheForProvider(
        organizationId: string,
        providerIdentifier: string
    ): Promise<void> {
        if (!this.cacheInvalidator) return;
        await this.cacheInvalidator.invalidatePattern(
            `${CACHE_KEYS.INTEGRATION}:${organizationId}:${providerIdentifier}:*`
        );
        logger.debug({
            msg: "Invalidated integration domain cache (plug mutation)",
            organizationId,
            providerIdentifier,
        });
    }

    private async invalidateIntegrationDomainCacheForIntegration(
        organizationId: string,
        integrationId: string
    ): Promise<void> {
        if (!this.cacheInvalidator) return;
        const row = await this.integrationRepository.getById(organizationId, integrationId);
        if (!row) return;
        await this.invalidateIntegrationDomainCacheForProvider(organizationId, row.provider_identifier);
    }
}
