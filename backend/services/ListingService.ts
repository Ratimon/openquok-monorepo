import type { ListingRepository } from "../repositories/ListingRepository";
import type { ListingCategoryRepository } from "../repositories/ListingCategoryRepository";
import type { ListingTagRepository } from "../repositories/ListingTagRepository";
import type { ConfigRepository } from "../repositories/ConfigRepository";
import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import type {
    PublishedListingsFilterOptions,
    AdminListingsFilterOptions,
    ListingCreator,
    ListingKind,
    ExtensionType,
    AdminListingCommentsFilterOptions,
    AdminListingActivitiesFilterOptions,
    AdminListingComment,
    AdminListingActivity,
    ListingComment,
} from "../data/types/listingTypes";
import type {
    CategoryPaginationOptions,
    PartialListingCategory,
    FullListingCategory,
    ListingCategoryGroup,
} from "../data/types/listingCategoryTypes";
import type {
    PartialListingTag,
    FullListingTag,
    ListingTagGroup,
} from "../data/types/listingTagTypes";
import type {
    ListingCreateBodySchemaType,
    ListingUpdateBodySchemaType,
    ListingCommentCreateSchemaType,
} from "../data/schemas/listingSchemas";
import type {
    ListingCategoryCreateSchemaType,
    ListingCategoryUpdateSchemaType,
} from "../data/schemas/listingCategorySchemas";
import type {
    ListingTagCreateSchemaType,
    ListingTagUpdateSchemaType,
} from "../data/schemas/listingTagSchemas";
import {
    buildPublishedListingCacheKey,
    buildAdminListingCacheKey,
    buildAdminListingCommentsCacheKey,
    type ListingLike,
} from "../utils/dtos/ListingDTO";
import { ListingId } from "../utils/valueObjects/ListingId";
import { ValidationError } from "../errors/InfraError";
import { logger } from "../utils/Logger";
import type { SubscriptionGuardService } from "../guards/subscription/SubscriptionGuardService";
import { SubscriptionSection } from "openquok-common";
import type { ListingGithubImportPreview, ListingGithubSyncResult } from "../data/types/extensionTypeModels";
import { listingImportService } from "./ListingImportService";
import { hashContent, parseGithubUrl, parseSkillMarkdown } from "./ListingImportService";

const CACHE_KEYS = {
    LISTING_BY_ID: "listing:byId",
    LISTING_PUBLISHED: "listing:published:list",
    LISTING_PUBLISHED_BY_SLUG: "listing:published:bySlug",
    LISTING_STACK_BY_SLUG: "listing:stack:bySlug",
    LISTING_ADMIN_LIST: "listing:admin:list",
    LISTING_CREATORS: "listing:creators",
    LISTING_INFORMATION: "config:module:listings:information",
    LISTING_APPROVE_INFO: "config:listings:approveinfo",
    LISTING_CATEGORIES_ACTIVE_PARTIAL: "listing:categories:active:partial",
    LISTING_CATEGORIES_ACTIVE_FULL: "listing:categories:active:full",
    LISTING_CATEGORIES_ALL_PARTIAL: "listing:categories:all:partial",
    LISTING_CATEGORIES_ALL_FULL: "listing:categories:all:full",
    LISTING_TAGS_ACTIVE_PARTIAL: "listing:tags:active:partial",
    LISTING_TAGS_ACTIVE_FULL: "listing:tags:active:full",
    LISTING_TAGS_ALL_FULL: "listing:tags:all:full",
    LISTING_USER_BOOKMARKS: "listing:bookmarks:user",
    LISTING_ADMIN_COMMENTS_LIST: "listing:admin:comments:list",
    LISTING_ADMIN_ACTIVITIES_LIST: "listing:admin:activities:list",
    LISTING_COMMENTS_BY_LISTING: "listing:comments:byListing",
};

const LISTING_CACHE_TTL_SEC = 300;

export class ListingService {
    constructor(
        private readonly listingRepository: ListingRepository,
        private readonly listingCategoryRepository: ListingCategoryRepository,
        private readonly listingTagRepository: ListingTagRepository,
        private readonly cache?: CacheService,
        private readonly cacheInvalidator?: CacheInvalidationService,
        private readonly configRepository?: ConfigRepository,
        private readonly subscriptionGuard?: SubscriptionGuardService
    ) {}

    async getListingInformation(): Promise<Record<string, string>> {
        const cacheKey = CACHE_KEYS.LISTING_INFORMATION;
        const factory = async (): Promise<Record<string, string>> => {
            if (!this.configRepository) return {};
            const { result } = await this.configRepository.getConfigByModuleNameAndProperties({
                moduleName: "listings",
                properties: ["EXTENSIONS_META_TITLE", "EXTENSIONS_META_DESCRIPTION", "LISTING_SCHEMA_TYPE"],
            });
            return result;
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LISTING_CACHE_TTL_SEC);
        return factory();
    }

    private async getApproveConfigInfo(): Promise<Record<string, string>> {
        const cacheKey = CACHE_KEYS.LISTING_APPROVE_INFO;
        const factory = async (): Promise<Record<string, string>> => {
            if (!this.configRepository) return {};
            const { result } = await this.configRepository.getConfigByModuleNameAndProperties({
                moduleName: "listings",
                properties: ["PRE_ADMIN_APPROVE_NEW_LISTINGS", "PRE_ADMIN_APPROVE_UPDATED_LISTINGS"],
            });
            return result;
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LISTING_CACHE_TTL_SEC);
        return factory();
    }

    async getListingById(id: ListingId | string): Promise<ListingLike> {
        const idVO = id instanceof ListingId ? id : ListingId.create(id);
        if (!idVO) throw new ValidationError(`Invalid listing ID: ${id}`);

        const cacheKey = `${CACHE_KEYS.LISTING_BY_ID}:${idVO.value}`;
        const factory = async () => {
            const { data } = await this.listingRepository.findListingById(idVO.value);
            return data;
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LISTING_CACHE_TTL_SEC);
        return factory();
    }

    async getPublishedListingBySlug(slug: string, listingKind: ListingKind = "extension"): Promise<ListingLike | null> {
        const prefix =
            listingKind === "stack"
                ? CACHE_KEYS.LISTING_STACK_BY_SLUG
                : CACHE_KEYS.LISTING_PUBLISHED_BY_SLUG;
        const cacheKey = `${prefix}:${slug}`;
        const factory = async () => {
            const { data } = await this.listingRepository.findPublishedListingBySlug(slug, listingKind);
            return data;
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LISTING_CACHE_TTL_SEC);
        return factory();
    }

    async getPublishedListings(
        options: PublishedListingsFilterOptions
    ): Promise<{ listingsResult: ListingLike[]; countResult: number }> {
        const normalized: PublishedListingsFilterOptions = {
            limit: options.limit ?? 10,
            skipId: options.skipId ?? null,
            skip: options.skip ?? 0,
            searchTerm: options.searchTerm ?? null,
            tagSlugs: options.tagSlugs ?? null,
            categorySlug: options.categorySlug ?? null,
            extensionType: options.extensionType ?? null,
            listingKind: options.listingKind ?? "extension",
            sortByKey: options.sortByKey ?? "created_at",
            sortByOrder: options.sortByOrder ?? false,
            range: options.range ?? null,
            ownerId: options.ownerId ?? null,
        };

        const cacheKey = buildPublishedListingCacheKey(normalized, CACHE_KEYS.LISTING_PUBLISHED);
        const factory = async () => {
            const { data, count } = await this.listingRepository.findPublishedListings(normalized);
            return { listingsResult: data, countResult: count };
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LISTING_CACHE_TTL_SEC);
        return factory();
    }

    async getAdminListings(
        options: AdminListingsFilterOptions
    ): Promise<{ listingsResult: ListingLike[]; countResult: number }> {
        const normalized: AdminListingsFilterOptions = {
            limit: options.limit ?? 10,
            searchTerm: options.searchTerm ?? null,
            listingKind: options.listingKind ?? null,
            sortByKey: options.sortByKey ?? "created_at",
            sortByOrder: options.sortByOrder ?? false,
            range: options.range ?? null,
        };

        const cacheKey = buildAdminListingCacheKey(normalized, CACHE_KEYS.LISTING_ADMIN_LIST);
        const factory = async () => {
            const { data, count } = await this.listingRepository.findAdminListings(normalized);
            return { listingsResult: data, countResult: count };
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LISTING_CACHE_TTL_SEC);
        return factory();
    }

    async getListingCreators(): Promise<ListingCreator[]> {
        const cacheKey = CACHE_KEYS.LISTING_CREATORS;
        const factory = async () => {
            const { data } = await this.listingRepository.getListingCreators();
            return data;
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LISTING_CACHE_TTL_SEC);
        return factory();
    }

    async getCreatorListings(username: string): Promise<ListingLike[]> {
        const { data } = await this.listingRepository.findListingsByOwnerUsername(username);
        return data;
    }

    async incrementStatCounter(
        listingId: string,
        type: "views" | "clicks" | "likes",
        userId: string | null
    ): Promise<void> {
        await this.listingRepository.incrementStatCounter(listingId, type);
        await this.listingRepository.insertListingActivity(listingId, type, userId);
        await this._invalidateListingStatCaches(listingId);
    }

    async createListing(
        body: ListingCreateBodySchemaType,
        ownerId: string,
        isPlatformAdmin: boolean
    ): Promise<{ id: string; isAdminApproved: boolean; isUserApproved: boolean }> {
        const { listingData, listingTagsData, stackMembersData = [] } = body;
        const isUserApproved = listingData.is_user_published === true;
        const approveInfo = await this.getApproveConfigInfo();

        let isAdminPublished = false;
        if (isUserApproved) {
            if (isPlatformAdmin && listingData.is_admin_published === true) {
                isAdminPublished = true;
            } else if (approveInfo.PRE_ADMIN_APPROVE_NEW_LISTINGS === "true") {
                isAdminPublished = true;
            }
        }

        const { savedListingId, isAdminApproved, isUserApproved: userApproved } =
            await this.listingRepository.createListing(
                listingData,
                listingTagsData,
                ownerId,
                isAdminPublished,
                stackMembersData
            );

        await this._invalidateListingMutationCaches(savedListingId);
        return { id: savedListingId, isAdminApproved, isUserApproved: userApproved };
    }

    async updateListing(
        body: ListingUpdateBodySchemaType,
        actorUserId: string,
        isPlatformAdmin: boolean
    ): Promise<{ id: string; isAdminApproved: boolean; isUserApproved: boolean }> {
        const { listingData, listingTagsData, stackMembersData = [] } = body;
        const isUserApproved = listingData.is_user_published === true;
        const approveInfo = await this.getApproveConfigInfo();

        const { data: existing } = await this.listingRepository.findListingById(listingData.id);
        const ownerId =
            isPlatformAdmin && listingData.owner_id ? listingData.owner_id : (existing.owner_id ?? actorUserId);

        let isAdminPublished = existing.is_admin_published === true;
        if (isUserApproved) {
            const explicitlyApproving =
                existing.is_admin_published !== true && listingData.is_admin_published === true && isPlatformAdmin;
            if (explicitlyApproving) {
                isAdminPublished = true;
            } else if (existing.is_admin_published !== true) {
                isAdminPublished = approveInfo.PRE_ADMIN_APPROVE_NEW_LISTINGS === "true";
            } else if (listingData.is_admin_published === false && isPlatformAdmin) {
                isAdminPublished = false;
            } else {
                isAdminPublished =
                    approveInfo.PRE_ADMIN_APPROVE_UPDATED_LISTINGS === "true"
                        ? true
                        : existing.is_admin_published === true;
            }
        } else {
            isAdminPublished = false;
        }

        const { savedListingId, isAdminApproved, isUserApproved: userApproved } =
            await this.listingRepository.updateListing(
                listingData,
                listingTagsData,
                ownerId,
                isAdminPublished,
                stackMembersData
            );

        await this._invalidateListingMutationCaches(savedListingId);
        return { id: savedListingId, isAdminApproved, isUserApproved: userApproved };
    }

    async deleteListing(id: string): Promise<void> {
        await this.listingRepository.deleteListing(id);
        await this._invalidateListingMutationCaches(id);
    }

    async getSkillMarkdown(slug: string): Promise<string | null> {
        return this.listingRepository.getSkillMarkdownContent(slug);
    }

    // --- Categories ---

    async getActivePartialCategories(options: CategoryPaginationOptions = {}): Promise<PartialListingCategory[]> {
        const cacheKey = `${CACHE_KEYS.LISTING_CATEGORIES_ACTIVE_PARTIAL}:${options.limit ?? "all"}:${options.offset ?? 0}`;
        const factory = async () => {
            const { data } = await this.listingCategoryRepository.findActivePartialCategories(options);
            return data;
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LISTING_CACHE_TTL_SEC);
        return factory();
    }

    async getActiveFullCategories(options: CategoryPaginationOptions = {}): Promise<FullListingCategory[]> {
        const cacheKey = `${CACHE_KEYS.LISTING_CATEGORIES_ACTIVE_FULL}:${options.limit ?? "all"}:${options.offset ?? 0}`;
        const factory = async () => {
            const { data } = await this.listingCategoryRepository.findActiveFullCategories(options);
            return data;
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LISTING_CACHE_TTL_SEC);
        return factory();
    }

    async getAllPartialCategories(): Promise<PartialListingCategory[]> {
        const cacheKey = CACHE_KEYS.LISTING_CATEGORIES_ALL_PARTIAL;
        const factory = async () => {
            const { data } = await this.listingCategoryRepository.findAllPartialCategories();
            return data;
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LISTING_CACHE_TTL_SEC);
        return factory();
    }

    async getAllFullCategories(): Promise<FullListingCategory[]> {
        const cacheKey = CACHE_KEYS.LISTING_CATEGORIES_ALL_FULL;
        const factory = async () => {
            const { data } = await this.listingCategoryRepository.findAllFullCategories();
            return data;
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LISTING_CACHE_TTL_SEC);
        return factory();
    }

    async createCategory(
        payload: ListingCategoryCreateSchemaType,
        groupIds: string[] = []
    ): Promise<{ id: string }> {
        const id = await this.listingCategoryRepository.createCategory(payload, groupIds);
        await this._invalidateTaxonomyCaches();
        return { id };
    }

    async updateCategory(
        payload: ListingCategoryUpdateSchemaType,
        groupIds: string[] = []
    ): Promise<{ id: string }> {
        const id = await this.listingCategoryRepository.updateCategory(payload, groupIds);
        await this._invalidateTaxonomyCaches();
        return { id };
    }

    async deleteCategory(categoryId: string): Promise<void> {
        await this.listingCategoryRepository.deleteCategory(categoryId);
        await this._invalidateTaxonomyCaches();
    }

    async getAllCategoryGroups(): Promise<ListingCategoryGroup[]> {
        const { data } = await this.listingCategoryRepository.findAllCategoryGroups();
        return data;
    }

    // --- Tags ---

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
        const { data } = await this.listingTagRepository.findAllTagGroups();
        return data;
    }

    async addBookmark(listingId: string, userId: string, authUserId?: string): Promise<void> {
        await this._assertCommunityFeatures(authUserId);
        await this.listingRepository.addBookmark(userId, listingId);
        await this.listingRepository.insertListingActivity(listingId, "bookmark", userId);
        await this._invalidateUserBookmarkCaches(userId, listingId);
    }

    async removeBookmark(listingId: string, userId: string, authUserId?: string): Promise<void> {
        await this._assertCommunityFeatures(authUserId);
        await this.listingRepository.removeBookmark(userId, listingId);
        await this._invalidateUserBookmarkCaches(userId, listingId);
    }

    async getUserBookmarks(userId: string, authUserId?: string): Promise<ListingLike[]> {
        await this._assertCommunityFeatures(authUserId);
        const cacheKey = `${CACHE_KEYS.LISTING_USER_BOOKMARKS}:${userId}`;
        const factory = async () => {
            const { data } = await this.listingRepository.findBookmarkedListingsByUserId(userId);
            return data;
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LISTING_CACHE_TTL_SEC);
        return factory();
    }

    async getAdminListingComments(
        options: AdminListingCommentsFilterOptions
    ): Promise<{ commentsResult: AdminListingComment[]; countResult: number }> {
        const normalized: AdminListingCommentsFilterOptions = {
            limit: options.limit ?? 100,
            searchTerm: options.searchTerm ?? null,
            sortByKey: options.sortByKey ?? "created_at",
            sortByOrder: options.sortByOrder ?? false,
            range: options.range ?? null,
        };
        const cacheKey = buildAdminListingCommentsCacheKey(
            normalized,
            CACHE_KEYS.LISTING_ADMIN_COMMENTS_LIST
        );
        const factory = async (): Promise<{ commentsResult: AdminListingComment[]; countResult: number }> => {
            const { data, count } = await this.listingRepository.findAdminListingComments(normalized);
            return { commentsResult: data, countResult: count };
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LISTING_CACHE_TTL_SEC);
        return factory();
    }

    async getAdminListingActivities(
        options: AdminListingActivitiesFilterOptions
    ): Promise<{ activitiesResult: AdminListingActivity[]; countResult: number }> {
        const normalized: AdminListingActivitiesFilterOptions = {
            limit: options.limit ?? 100,
            sortByKey: options.sortByKey ?? "created_at",
            sortByOrder: options.sortByOrder ?? false,
            range: options.range ?? null,
            listing_id: options.listing_id ?? null,
            activity_type: options.activity_type ?? null,
        };
        const cacheKey = [
            CACHE_KEYS.LISTING_ADMIN_ACTIVITIES_LIST,
            `limit:${normalized.limit}`,
            `listing:${normalized.listing_id ?? "all"}`,
            `type:${normalized.activity_type ?? "all"}`,
            `sort:${normalized.sortByKey}`,
            `order:${normalized.sortByOrder ? "asc" : "desc"}`,
        ].join(":");
        const factory = async (): Promise<{ activitiesResult: AdminListingActivity[]; countResult: number }> => {
            const { data, count } = await this.listingRepository.findAdminListingActivities(normalized);
            return { activitiesResult: data, countResult: count };
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LISTING_CACHE_TTL_SEC);
        return factory();
    }

    async approveListingComment(commentId: string): Promise<{ id: string }> {
        const result = await this.listingRepository.approveListingComment(commentId);
        if (this.cacheInvalidator) {
            await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.LISTING_ADMIN_COMMENTS_LIST}:*`);
            await this.cacheInvalidator.invalidateKey(
                `${CACHE_KEYS.LISTING_COMMENTS_BY_LISTING}:${result.listing_id}`
            );
        }
        return { id: result.id };
    }

    async deleteListingComment(commentId: string): Promise<void> {
        await this.listingRepository.deleteListingComment(commentId);
        if (this.cacheInvalidator) {
            await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.LISTING_ADMIN_COMMENTS_LIST}:*`);
        }
    }

    async getListingComments(listingId: string): Promise<ListingComment[]> {
        const cacheKey = `${CACHE_KEYS.LISTING_COMMENTS_BY_LISTING}:${listingId}`;
        const factory = async () => {
            const { data } = await this.listingRepository.findListingComments(listingId);
            return data;
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LISTING_CACHE_TTL_SEC);
        return factory();
    }

    async createListingComment(
        payload: ListingCommentCreateSchemaType,
        userId: string,
        authUserId?: string
    ): Promise<{ id: string }> {
        await this._assertCommunityFeatures(authUserId);
        const result = await this.listingRepository.createListingComment(payload, userId);
        await this.listingRepository.insertListingActivity(payload.listing_id, "comment", userId);
        if (this.cacheInvalidator) {
            await this.cacheInvalidator.invalidateKey(
                `${CACHE_KEYS.LISTING_COMMENTS_BY_LISTING}:${payload.listing_id}`
            );
            await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.LISTING_ADMIN_COMMENTS_LIST}:*`);
        }
        return { id: result.id };
    }

    async upsertListingRating(
        listingId: string,
        rating: number,
        userId: string,
        authUserId?: string
    ): Promise<{ id: string }> {
        await this._assertCommunityFeatures(authUserId);
        const result = await this.listingRepository.upsertListingRating(listingId, userId, rating);
        await this.listingRepository.insertListingActivity(listingId, "rating", userId);
        await this._invalidateListingStatCaches(listingId);
        return { id: result.id };
    }

    async cloneStack(stackId: string, ownerId: string, authUserId?: string): Promise<{ id: string }> {
        await this._assertCommunityFeatures(authUserId);
        const result = await this.listingRepository.cloneStack(stackId, ownerId);
        await this._invalidateListingMutationCaches(result.id);
        return result;
    }

    private async _assertCommunityFeatures(authUserId?: string): Promise<void> {
        if (authUserId?.trim() && this.subscriptionGuard) {
            await this.subscriptionGuard.assert(SubscriptionSection.COMMUNITY_FEATURES, {
                scope: "account",
                authUserId,
            });
        }
    }

    private async _invalidateUserBookmarkCaches(userId: string, listingId: string): Promise<void> {
        if (!this.cacheInvalidator) return;
        await this.cacheInvalidator.invalidateKey(`${CACHE_KEYS.LISTING_USER_BOOKMARKS}:${userId}`);
        await this._invalidateListingStatCaches(listingId);
    }

    private async _invalidateListingMutationCaches(listingId: string): Promise<void> {
        if (!this.cacheInvalidator) return;
        await this.cacheInvalidator.invalidateKey(`${CACHE_KEYS.LISTING_BY_ID}:${listingId}`);
        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.LISTING_PUBLISHED}:*`);
        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.LISTING_PUBLISHED_BY_SLUG}:*`);
        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.LISTING_STACK_BY_SLUG}:*`);
        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.LISTING_ADMIN_LIST}:*`);
        await this.cacheInvalidator.invalidateKey(CACHE_KEYS.LISTING_CREATORS);
        logger.debug({ msg: "Invalidated listing caches", listingId });
    }

    private async _invalidateListingStatCaches(listingId: string): Promise<void> {
        if (!this.cacheInvalidator) return;
        await this.cacheInvalidator.invalidateKey(`${CACHE_KEYS.LISTING_BY_ID}:${listingId}`);
        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.LISTING_PUBLISHED}:*`);
        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.LISTING_PUBLISHED_BY_SLUG}:*`);
        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.LISTING_STACK_BY_SLUG}:*`);
    }

    private async _invalidateTaxonomyCaches(): Promise<void> {
        if (!this.cacheInvalidator) return;
        await this.cacheInvalidator.invalidatePattern("listing:categories:*");
        await this.cacheInvalidator.invalidatePattern("listing:tags:*");
        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.LISTING_PUBLISHED}:*`);
        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.LISTING_ADMIN_LIST}:*`);
    }

    async previewGithubImport(
        githubUrl: string,
        extensionType?: "skills" | "mcp" | "both" | null
    ): Promise<ListingGithubImportPreview> {
        return listingImportService.previewGithubImport(githubUrl, extensionType);
    }

    async syncListingFromGithub(listingId: string): Promise<ListingGithubSyncResult> {
        const idVO = ListingId.create(listingId);
        if (!idVO) throw new ValidationError(`Invalid listing ID: ${listingId}`);

        const listing = await this.getListingById(idVO.value);
        const skillSourceUrl = listing.skill_source_url;
        if (!skillSourceUrl) {
            throw new ValidationError("This listing has no skill_source_url to sync.");
        }

        const raw = await listingImportService.fetchRawMarkdown(skillSourceUrl);
        const parsedUrl = parseGithubUrl(skillSourceUrl);
        if (!parsedUrl) {
            throw new ValidationError("Stored skill_source_url is not a valid GitHub URL.");
        }

        const parsed = parseSkillMarkdown(raw);
        const nextHash = hashContent(raw);
        const previousHash = listing.source_content_hash ?? null;
        const contentChanged = previousHash !== nextHash;
        const syncedAt = new Date().toISOString();

        if (contentChanged) {
            const excerpt = parsed.description ? parsed.description.slice(0, 160) : null;
            await this.listingRepository.updateListingGithubSync(listingId, {
                content: parsed.body,
                sourceContentHash: nextHash,
                sourceSyncedAt: syncedAt,
                description: parsed.description,
                excerpt,
                skillMetadata: parsed.metadata,
                license: parsed.license,
                version: parsed.version,
            });
            await this._invalidateListingMutationCaches(listingId);
        } else {
            await this.listingRepository.updateListingGithubSync(listingId, {
                content: listing.content ?? parsed.body,
                sourceContentHash: nextHash,
                sourceSyncedAt: syncedAt,
            });
        }

        return {
            updated: true,
            contentChanged,
            sourceSyncedAt: syncedAt,
            sourceContentHash: nextHash,
        };
    }
}
