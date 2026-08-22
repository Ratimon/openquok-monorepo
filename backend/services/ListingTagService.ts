import type { ListingTagRepository } from "../repositories/ListingTagRepository";
import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import type { PartialListingTag, FullListingTag, ListingTagGroup } from "../data/types/listingTagTypes";
import type {
    ListingTagCreateSchemaType,
    ListingTagUpdateSchemaType,
} from "../data/schemas/listingTagSchemas";
import { logger } from "../utils/Logger";

const CACHE_KEYS = {
    LISTING_TAGS_ACTIVE_PARTIAL: "listing:tags:active:partial",
    LISTING_TAGS_ACTIVE_FULL: "listing:tags:active:full",
    LISTING_TAGS_ALL_FULL: "listing:tags:all:full",
    LISTING_TAGS_GROUPS: "listing:tags:groups",
    LISTING_PUBLISHED: "listing:published:list",
    LISTING_ADMIN_LIST: "listing:admin:list",
};

const LISTING_CACHE_TTL_SEC = 300;

export class ListingTagService {
    constructor(
        private readonly listingTagRepository: ListingTagRepository,
        private readonly cache?: CacheService,
        private readonly cacheInvalidator?: CacheInvalidationService
    ) {}

    async getActivePartialTags(): Promise<PartialListingTag[]> {
        const cacheKey = CACHE_KEYS.LISTING_TAGS_ACTIVE_PARTIAL;
        const factory = async () => {
            const { data } = await this.listingTagRepository.findActivePartialTags();
            return data;
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LISTING_CACHE_TTL_SEC);
        return factory();
    }

    async getActiveFullTags(): Promise<FullListingTag[]> {
        const cacheKey = CACHE_KEYS.LISTING_TAGS_ACTIVE_FULL;
        const factory = async () => {
            const { data } = await this.listingTagRepository.findActiveFullTags();
            return data;
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LISTING_CACHE_TTL_SEC);
        return factory();
    }

    async getAllFullTags(): Promise<FullListingTag[]> {
        const cacheKey = CACHE_KEYS.LISTING_TAGS_ALL_FULL;
        const factory = async () => {
            const { data } = await this.listingTagRepository.findAllFullTags();
            return data;
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LISTING_CACHE_TTL_SEC);
        return factory();
    }

    async createTag(payload: ListingTagCreateSchemaType, groupIds: string[] = []): Promise<{ id: string }> {
        const id = await this.listingTagRepository.createTag(payload, groupIds);
        await this._invalidateTaxonomyCaches();
        return { id };
    }

    async updateTag(payload: ListingTagUpdateSchemaType, groupIds: string[] = []): Promise<{ id: string }> {
        const id = await this.listingTagRepository.updateTag(payload, groupIds);
        await this._invalidateTaxonomyCaches();
        return { id };
    }

    async deleteTag(tagId: string): Promise<void> {
        await this.listingTagRepository.deleteTag(tagId);
        await this._invalidateTaxonomyCaches();
    }

    async getAllTagGroups(): Promise<ListingTagGroup[]> {
        const cacheKey = CACHE_KEYS.LISTING_TAGS_GROUPS;
        const factory = async () => {
            const { data } = await this.listingTagRepository.findAllTagGroups();
            return data;
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LISTING_CACHE_TTL_SEC);
        return factory();
    }

    async createTagGroup(name: string): Promise<ListingTagGroup> {
        const tagGroup = await this.listingTagRepository.createTagGroup(name);
        await this._invalidateTaxonomyCaches();
        return tagGroup;
    }

    async updateTagGroup(id: string, name: string): Promise<ListingTagGroup> {
        const tagGroup = await this.listingTagRepository.updateTagGroup(id, name);
        await this._invalidateTaxonomyCaches();
        return tagGroup;
    }

    async deleteTagGroup(id: string): Promise<void> {
        await this.listingTagRepository.deleteTagGroup(id);
        await this._invalidateTaxonomyCaches();
    }

    private async _invalidateTaxonomyCaches(): Promise<void> {
        if (!this.cacheInvalidator) return;
        await this.cacheInvalidator.invalidatePattern("listing:tags:*");
        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.LISTING_PUBLISHED}:*`);
        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.LISTING_ADMIN_LIST}:*`);
        logger.debug({ msg: "Invalidated listing tag taxonomy caches" });
    }
}
