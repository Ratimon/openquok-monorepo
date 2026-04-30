import type { SignatureRepository } from "../repositories/SignatureRepository";
import type { IntegrationConnectionService } from "./IntegrationConnectionService";
import type { SignatureLike } from "../utils/dtos/SignatureDTO";
import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import { SignatureNotFoundError } from "../errors/SignatureError";
import { logger } from "../utils/Logger";

/** Domain-scoped cache key prefixes. */
const CACHE_KEYS = {
    SIGNATURE: "signature",
    /** Full key = `${SIGNATURE_LIST_BYORGID}:${organizationId}` */
    SIGNATURE_LIST_BYORGID: "signature:list:byOrgId",
};

const SIGNATURE_CACHE_TTL_SEC = 300;

function signaturesListCacheKey(organizationId: string): string {
    return `${CACHE_KEYS.SIGNATURE_LIST_BYORGID}:${organizationId}`;
}

export class SignatureService {
    constructor(
        private readonly signatureRepository: SignatureRepository,
        private readonly integrationConnectionService: IntegrationConnectionService,
        private readonly cache?: CacheService,
        private readonly cacheInvalidator?: CacheInvalidationService
    ) {}

    async listForOrganization(authUserId: string, organizationId: string): Promise<SignatureLike[]> {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);
        const cacheKey = signaturesListCacheKey(organizationId);
        const factory = async (): Promise<SignatureLike[]> =>
            await this.signatureRepository.listByOrganization(organizationId);
        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, SIGNATURE_CACHE_TTL_SEC);
        }
        return factory();
    }

    async getById(authUserId: string, signatureId: string): Promise<SignatureLike | null> {
        const row = await this.signatureRepository.findById(signatureId);
        if (!row) return null;
        await this.integrationConnectionService.assertOrganizationMember(authUserId, row.organization_id);
        return row;
    }

    async create(
        authUserId: string,
        input: { organizationId: string; title: string; content: string; isDefault: boolean }
    ): Promise<string> {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, input.organizationId);
        if (input.isDefault) {
            await this.signatureRepository.clearDefaultForOrganization(input.organizationId);
        }
        const row = await this.signatureRepository.insert({
            organizationId: input.organizationId,
            title: input.title,
            content: input.content,
            isDefault: input.isDefault,
        });
        await this._invalidateSignatureRelatedCaches({ organizationId: input.organizationId });
        return row.id;
    }

    async update(
        authUserId: string,
        signatureId: string,
        input: { title?: string; content?: string; isDefault?: boolean }
    ): Promise<string> {
        const existing = await this.signatureRepository.findById(signatureId);
        if (!existing) {
            throw new SignatureNotFoundError(signatureId);
        }
        await this.integrationConnectionService.assertOrganizationMember(authUserId, existing.organization_id);
        if (input.isDefault === true) {
            await this.signatureRepository.clearDefaultForOrganization(existing.organization_id);
        }
        const row = await this.signatureRepository.update({
            signatureId,
            organizationId: existing.organization_id,
            title: input.title,
            content: input.content,
            isDefault: input.isDefault,
        });
        if (!row) {
            throw new SignatureNotFoundError(signatureId);
        }
        await this._invalidateSignatureRelatedCaches({ organizationId: existing.organization_id });
        return row.id;
    }

    async delete(authUserId: string, signatureId: string): Promise<void> {
        const existing = await this.signatureRepository.findById(signatureId);
        if (!existing) {
            throw new SignatureNotFoundError(signatureId);
        }
        await this.integrationConnectionService.assertOrganizationMember(authUserId, existing.organization_id);
        const ok = await this.signatureRepository.delete(signatureId, existing.organization_id);
        if (!ok) {
            throw new SignatureNotFoundError(signatureId);
        }
        await this._invalidateSignatureRelatedCaches({ organizationId: existing.organization_id });
    }

    private async _invalidateSignatureRelatedCaches(params: { organizationId: string }): Promise<void> {
        const { organizationId } = params;
        const listKey = signaturesListCacheKey(organizationId);

        if (this.cacheInvalidator) {
            try {
                await this.cacheInvalidator.invalidateKey(listKey);
                return;
            } catch (error) {
                logger.error({
                    msg: "Error invalidating signature caches",
                    organizationId,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }

        if (this.cache) {
            try {
                await this.cache.del(listKey);
            } catch (error) {
                logger.error({
                    msg: "Error deleting signature caches (fallback)",
                    organizationId,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
    }
}
