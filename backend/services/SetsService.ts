import type { SetsRepository } from "../repositories/SetsRepository";
import type { IntegrationConnectionService } from "./IntegrationConnectionService";
import type { SetLike } from "../utils/dtos/SetDTO";
import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import { SetNotFoundError } from "../errors/SetError";
import { logger } from "../utils/Logger";

const CACHE_KEYS = {
    /** Full key = `${SET_LIST_BYORGID}:${organizationId}` */
    SET_LIST_BYORGID: "sets:list:byOrgId",
    /** Full key = `${SET_BY_SETID}:${setId}` */
    SET_BY_SETID: "sets:bySetId",
};

const SETS_CACHE_TTL_SEC = 300;

function setsListCacheKey(organizationId: string): string {
    return `${CACHE_KEYS.SET_LIST_BYORGID}:${organizationId}`;
}

function setByIdCacheKey(setId: string): string {
    return `${CACHE_KEYS.SET_BY_SETID}:${setId}`;
}

export class SetsService {
    constructor(
        private readonly setsRepository: SetsRepository,
        private readonly integrationConnectionService: IntegrationConnectionService,
        private readonly cache?: CacheService,
        private readonly cacheInvalidator?: CacheInvalidationService
    ) {}

    async listForOrganization(authUserId: string, organizationId: string): Promise<SetLike[]> {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);
        const cacheKey = setsListCacheKey(organizationId);
        const factory = async (): Promise<SetLike[]> =>
            await this.setsRepository.listByOrganization(organizationId);
        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, SETS_CACHE_TTL_SEC);
        }
        return factory();
    }

    async upsert(
        authUserId: string,
        organizationId: string,
        body: { id?: string; name: string; content: string }
    ): Promise<{ id: string }> {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);

        if (body.id) {
            const existing = await this.setsRepository.findById(body.id);
            if (existing && existing.organization_id === organizationId) {
                const updated = await this.setsRepository.update({
                    setId: body.id,
                    organizationId,
                    name: body.name,
                    content: body.content,
                });
                await this._invalidateSetRelatedCaches({ organizationId, setId: body.id });
                return { id: updated?.id ?? body.id };
            }
        }

        const row = await this.setsRepository.insert({
            organizationId,
            name: body.name,
            content: body.content,
        });
        await this._invalidateSetRelatedCaches({ organizationId });
        return { id: row.id };
    }

    async getByIdForMember(authUserId: string, setId: string): Promise<SetLike | null> {
        const cacheKey = setByIdCacheKey(setId);
        const factory = async (): Promise<SetLike | null> => await this.setsRepository.findById(setId);
        const row = this.cache
            ? await this.cache.getOrSet(cacheKey, factory, SETS_CACHE_TTL_SEC)
            : await factory();
        if (!row) return null;
        await this.integrationConnectionService.assertOrganizationMember(authUserId, row.organization_id);
        return row;
    }

    async delete(authUserId: string, setId: string): Promise<void> {
        const existing = await this.setsRepository.findById(setId);
        if (!existing) {
            throw new SetNotFoundError(setId);
        }
        await this.integrationConnectionService.assertOrganizationMember(authUserId, existing.organization_id);
        const ok = await this.setsRepository.delete(setId, existing.organization_id);
        if (!ok) {
            throw new SetNotFoundError(setId);
        }
        await this._invalidateSetRelatedCaches({ organizationId: existing.organization_id, setId });
    }

    private async _invalidateSetRelatedCaches(params: { organizationId: string; setId?: string | null }): Promise<void> {
        const { organizationId, setId } = params;
        const listKey = setsListCacheKey(organizationId);
        const keysToDrop = [listKey];
        if (setId) keysToDrop.push(setByIdCacheKey(setId));

        if (this.cacheInvalidator) {
            try {
                for (const key of keysToDrop) {
                    await this.cacheInvalidator.invalidateKey(key);
                }
                return;
            } catch (error) {
                logger.error({
                    msg: "Error invalidating sets caches",
                    organizationId,
                    setId: setId ?? undefined,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }

        if (this.cache) {
            try {
                for (const key of keysToDrop) {
                    await this.cache.del(key);
                }
            } catch (error) {
                logger.error({
                    msg: "Error deleting sets caches (fallback)",
                    organizationId,
                    setId: setId ?? undefined,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
    }
}
