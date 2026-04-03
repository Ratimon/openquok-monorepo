import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import type { IntegrationRepository, IntegrationRow } from "../repositories/IntegrationRepository";
import { logger } from "../utils/Logger";

/** Domain-scoped cache key prefixes. */
const CACHE_KEYS = {
    /**
     * Per-org, per-provider domain cache (e.g. analytics payloads: `integration:${orgId}:${integration}:${date}`).
     * Full key via {@link buildIntegrationDomainCacheKey}; invalidate e.g. pattern `integration:${orgId}:*` when needed.
     */
    INTEGRATION_DOMAIN: "integration",
} as const;

function buildIntegrationDomainCacheKey(
    organizationId: string,
    integrationIdentifier: string,
    segment: string
): string {
    return `${CACHE_KEYS.INTEGRATION_DOMAIN}:${organizationId}:${integrationIdentifier}:${segment}`;
}

const ANALYTICS_CACHE_TTL_SEC =
    !process.env.NODE_ENV || process.env.NODE_ENV === "development" ? 1 : 3600;

/**
 * Persistence for `organization_integrations` plus `integration:*` domain cache.
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

    getById(organizationId: string, id: string) {
        return this.integrationRepository.getById(organizationId, id);
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
            `${CACHE_KEYS.INTEGRATION_DOMAIN}:${organizationId}:${providerIdentifier}:*`
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
