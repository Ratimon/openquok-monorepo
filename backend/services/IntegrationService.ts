import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import type {
    IntegrationCustomerRow,
    IntegrationRepository,
    IntegrationRow,
} from "../repositories/IntegrationRepository";
import { logger } from "../utils/Logger";

type IntegrationCustomerListItem = Pick<IntegrationCustomerRow, "id" | "name">;

/** Domain-scoped cache key prefixes. */
const CACHE_KEYS = {
    INTEGRATION: "integration",
    /** Per-org list cache key is `${INTEGRATION_CUSTOMERS_LIST}:${organizationId}`. */
    INTEGRATION_CUSTOMERS_LIST: "integration:customers:list",
};

function buildIntegrationDomainCacheKey(
    organizationId: string,
    integrationIdentifier: string,
    segment: string
): string {
    return `${CACHE_KEYS.INTEGRATION}:${organizationId}:${integrationIdentifier}:${segment}`;
}

function integrationCustomersListCacheKey(organizationId: string): string {
    return `${CACHE_KEYS.INTEGRATION_CUSTOMERS_LIST}:${organizationId}`;
}

const ANALYTICS_CACHE_TTL_SEC =
    !process.env.NODE_ENV || process.env.NODE_ENV === "development" ? 1 : 3600;

const INTEGRATION_CUSTOMERS_LIST_TTL_SEC =
    !process.env.NODE_ENV || process.env.NODE_ENV === "development" ? 5 : 300;

/**
 * Persistence for `organization_integrations` plus integration-scoped caches
 * (per-provider analytics keys and per-org customer list keys under `CACHE_KEYS`).
 */
export class IntegrationService {
    constructor(
        private readonly integrationRepository: IntegrationRepository,
        private readonly cache?: CacheService,
        private readonly cacheInvalidator?: CacheInvalidationService
    ) {}

    listByOrganization(organizationId: string): Promise<IntegrationRow[]> {
        return this.integrationRepository.listByOrganization(organizationId);
    }

    /** Returns repository row shape; controller maps to DTO just before response. */
    async customers(organizationId: string): Promise<IntegrationCustomerListItem[]> {
        const cacheKey = integrationCustomersListCacheKey(organizationId);
        const factory = async (): Promise<IntegrationCustomerListItem[]> => {
            logger.debug({ msg: "Getting integration customers from repository", organizationId });
            const list = await this.integrationRepository.customers(organizationId);
            logger.info({ msg: "Integration customers retrieved", organizationId, count: list.length });
            return list;
        };
        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, INTEGRATION_CUSTOMERS_LIST_TTL_SEC);
        }
        return factory();
    }

    async createIntegrationCustomer(organizationId: string, name: string): Promise<IntegrationCustomerListItem> {
        const row = await this.integrationRepository.createIntegrationCustomer(organizationId, name);
        await this.invalidateIntegrationCustomersListCache(organizationId);
        return row;
    }

    async updateIntegrationGroup(organizationId: string, integrationId: string, group: string | null) {
        await this.integrationRepository.updateIntegrationGroup(organizationId, integrationId, group);
        await this.invalidateIntegrationDomainCacheForIntegration(organizationId, integrationId);
    }

    async updateOnCustomerName(organizationId: string, integrationId: string, name: string) {
        await this.integrationRepository.updateOnCustomerName(organizationId, integrationId, name);
        await this.invalidateIntegrationCustomersListCache(organizationId);
        await this.invalidateIntegrationDomainCacheForIntegration(organizationId, integrationId);
    }

    getById(organizationId: string, id: string) {
        return this.integrationRepository.getById(organizationId, id);
    }

    async updateIntegrationById(
        organizationId: string,
        integrationId: string,
        params: Parameters<IntegrationRepository["updateIntegrationById"]>[2]
    ) {
        const result = await this.integrationRepository.updateIntegrationById(organizationId, integrationId, params);
        await this.invalidateIntegrationDomainCacheForIntegration(organizationId, integrationId);
        return result;
    }

    async upsertIntegration(params: Parameters<IntegrationRepository["upsertIntegration"]>[0]) {
        const result = await this.integrationRepository.upsertIntegration(params);
        await this.invalidateIntegrationDomainCacheForProvider(params.organizationId, params.providerIdentifier);
        return result;
    }

    async setPostingTimes(organizationId: string, integrationId: string, json: string) {
        await this.integrationRepository.setPostingTimes(organizationId, integrationId, json);
        await this.invalidateIntegrationDomainCacheForIntegration(organizationId, integrationId);
    }

    async disableChannel(organizationId: string, integrationId: string): Promise<void> {
        await this.integrationRepository.disableChannel(organizationId, integrationId);
        await this.invalidateIntegrationDomainCacheForIntegration(organizationId, integrationId);
    }

    async enableChannel(organizationId: string, integrationId: string): Promise<void> {
        await this.integrationRepository.enableChannel(organizationId, integrationId);
        await this.invalidateIntegrationDomainCacheForIntegration(organizationId, integrationId);
    }

    async softDeleteChannel(organizationId: string, integrationId: string, internalId: string) {
        await this.invalidateIntegrationDomainCacheForIntegration(organizationId, integrationId);
        return this.integrationRepository.softDeleteChannel(organizationId, integrationId, internalId);
    }

    /**
     * Invalidate `integration:${orgId}:${providerIdentifier}:*` (e.g. cached analytics per segment).
     */
    private async invalidateIntegrationDomainCacheForProvider(
        organizationId: string,
        providerIdentifier: string
    ): Promise<void> {
        if (!this.cacheInvalidator) return;
        await this.cacheInvalidator.invalidatePattern(
            `${CACHE_KEYS.INTEGRATION}:${organizationId}:${providerIdentifier}:*`
        );
        logger.debug({
            msg: "Invalidated integration domain cache",
            organizationId,
            providerIdentifier,
        });
    }

    /** Load row to resolve `provider_identifier`, then invalidate domain cache for that provider. */
    private async invalidateIntegrationDomainCacheForIntegration(
        organizationId: string,
        integrationId: string
    ): Promise<void> {
        if (!this.cacheInvalidator) return;
        const row = await this.integrationRepository.getById(organizationId, integrationId);
        if (!row) return;
        await this.invalidateIntegrationDomainCacheForProvider(organizationId, row.provider_identifier);
    }

    /** Invalidate cache used by {@link IntegrationService.customers} (same key as `getOrSet` for that org). */
    private async invalidateIntegrationCustomersListCache(organizationId: string): Promise<void> {
        const key = integrationCustomersListCacheKey(organizationId);
        if (this.cacheInvalidator) {
            await this.cacheInvalidator.invalidateKey(key);
        } else if (this.cache) {
            await this.cache.del(key);
        }
        logger.debug({ msg: "Invalidated integration customers list cache", organizationId });
    }

    /**
     * Read cached analytics (or similar) payload for an integration on a date segment.
     */
    async getCachedIntegrationPayload(
        organizationId: string,
        integrationIdentifier: string,
        segment: string
    ): Promise<unknown[] | null> {
        if (!this.cache) return null;
        const key = buildIntegrationDomainCacheKey(organizationId, integrationIdentifier, segment);
        const raw = await this.cache.get(key);
        if (raw == null) return null;
        if (Array.isArray(raw)) return raw;
        return null;
    }

    /**
     * Store integration-scoped cache (e.g. analytics rows); TTL is shorter in development than in production.
     */
    async setCachedIntegrationPayload(
        organizationId: string,
        integrationIdentifier: string,
        segment: string,
        data: unknown[],
        ttlSec: number = ANALYTICS_CACHE_TTL_SEC
    ): Promise<void> {
        if (!this.cache) return;
        const key = buildIntegrationDomainCacheKey(organizationId, integrationIdentifier, segment);
        await this.cache.set(key, data, ttlSec);
    }
}
