import type { LinkDirectoryCategoryRepository } from "../repositories/LinkDirectoryCategoryRepository";
import type { LinkDirectoryRepository } from "../repositories/LinkDirectoryRepository";
import type { LinkDirectoryTagRepository } from "../repositories/LinkDirectoryTagRepository";
import type {
    AdminLinkDirectorySiteComment,
    AdminLinkDirectorySiteCommentsFilterOptions,
    AdminLinkDirectorySitesFilterOptions,
    LinkDirectoryCategoryRow,
    LinkDirectoryOpportunityTypeRow,
    LinkDirectorySiteComment,
    LinkDirectorySiteRow,
    LinkDirectorySubmissionRow,
    LinkDirectoryTagGroupRow,
    LinkDirectoryTagRow,
    PublishedLinkDirectorySitesFilterOptions,
} from "../data/types/linkDirectoryTypes";
import type {
    LinkDirectoryCategoryCreateSchemaType,
    LinkDirectoryCategoryUpdateSchemaType,
    LinkDirectoryOpportunityCreateSchemaType,
    LinkDirectoryOpportunityUpdateSchemaType,
    LinkDirectorySiteCommentCreateSchemaType,
    LinkDirectorySiteCreateSchemaType,
    LinkDirectorySiteUpdateSchemaType,
    LinkDirectorySubmissionCreateSchemaType,
    LinkDirectoryTagCreateSchemaType,
    LinkDirectoryTagGroupCreateSchemaType,
    LinkDirectoryTagUpdateSchemaType,
} from "../data/schemas/linkDirectorySchemas";
import type { LinkDirectorySavedSiteRow } from "../data/types/linkDirectoryTypes";
import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import {
    buildAdminLinkDirectorySitesCacheKey,
    buildPublishedLinkDirectorySitesCacheKey,
} from "../utils/dtos/LinkDirectoryDTO";
import { ValidationError } from "../errors/InfraError";
import type { SubscriptionGuardService } from "../guards/subscription/SubscriptionGuardService";
import type { InternalOpsEmailService } from "./InternalOpsEmailService";
import { SubscriptionSection } from "openquok-common";

const CACHE_KEYS = {
    PUBLISHED_LIST: "linkDirectory:published:list",
    PUBLISHED_BY_SLUG: "linkDirectory:published:bySlug",
    PUBLISHED_HUB_STATS: "linkDirectory:published:hubStats",
    TAXONOMY_CATEGORIES_ACTIVE: "linkDirectory:taxonomy:categories:active",
    TAXONOMY_TAGS_ACTIVE: "linkDirectory:taxonomy:tags:active",
    TAXONOMY_OPPORTUNITY_TYPES: "linkDirectory:taxonomy:opportunityTypes",
    COMMENTS_BY_SITE_ID: "linkDirectory:comments:bySiteId",
    ADMIN_SITES_LIST: "linkDirectory:admin:sites:list",
};

const LINK_DIRECTORY_CACHE_TTL_SEC = 300;

function dedupeSiteIdsPreservingOrder(siteIds: string[]): string[] {
    const seen = new Set<string>();
    const deduped: string[] = [];
    for (const siteId of siteIds) {
        if (seen.has(siteId)) continue;
        seen.add(siteId);
        deduped.push(siteId);
    }
    return deduped;
}

function savedSiteIdsMatchOrderRequest(currentSiteIds: string[], orderedSiteIds: string[]): boolean {
    if (currentSiteIds.length !== orderedSiteIds.length) return false;
    const currentSet = new Set(currentSiteIds);
    return orderedSiteIds.every((siteId) => currentSet.has(siteId));
}

function sanitizeSavedSiteRowsForRead(rows: LinkDirectorySavedSiteRow[]): LinkDirectorySavedSiteRow[] {
    return rows.map((row) => ({
        ...row,
        site: row.site && row.site.is_admin_published === true ? row.site : null,
    }));
}

export class LinkDirectoryService {
    constructor(
        private readonly linkDirectoryRepository: LinkDirectoryRepository,
        private readonly categoryRepository: LinkDirectoryCategoryRepository,
        private readonly tagRepository: LinkDirectoryTagRepository,
        private readonly subscriptionGuard: SubscriptionGuardService | undefined,
        private readonly internalOpsEmailService: InternalOpsEmailService,
        private readonly cache?: CacheService,
        private readonly cacheInvalidator?: CacheInvalidationService
    ) {}

    private async assertPublishedSiteForEngagement(siteId: string): Promise<void> {
        await this.linkDirectoryRepository.assertPublishedSiteIds([siteId]);
    }

    private async assertCommunityFeatures(authUserId?: string): Promise<void> {
        if (authUserId?.trim() && this.subscriptionGuard) {
            await this.subscriptionGuard.assert(SubscriptionSection.COMMUNITY_FEATURES, {
                scope: "account",
                authUserId,
            });
        }
    }

    private async _resolveSiteSlug(siteId: string): Promise<string | null> {
        try {
            const site = await this.getSiteById(siteId);
            return site.slug;
        } catch {
            return null;
        }
    }

    private async _invalidatePublishedCatalogCaches(options?: {
        siteSlugs?: string[];
    }): Promise<void> {
        if (!this.cacheInvalidator) return;
        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.PUBLISHED_LIST}:*`);
        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.ADMIN_SITES_LIST}:*`);
        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.PUBLISHED_BY_SLUG}:*`);
        await this.cacheInvalidator.invalidateKey(CACHE_KEYS.PUBLISHED_HUB_STATS);
        for (const slug of options?.siteSlugs ?? []) {
            await this.cacheInvalidator.invalidateKey(`${CACHE_KEYS.PUBLISHED_BY_SLUG}:${slug}`);
        }
    }

    private async _invalidateSiteMutationCaches(params?: {
        siteId?: string;
        siteSlugs?: string[];
        previousSiteSlug?: string;
    }): Promise<void> {
        const slugs = [...(params?.siteSlugs ?? [])];
        if (params?.previousSiteSlug && !slugs.includes(params.previousSiteSlug)) {
            slugs.push(params.previousSiteSlug);
        }
        if (params?.siteId) {
            const slug = await this._resolveSiteSlug(params.siteId);
            if (slug && !slugs.includes(slug)) slugs.push(slug);
        }
        await this._invalidatePublishedCatalogCaches({
            siteSlugs: slugs.length > 0 ? slugs : undefined,
        });
    }

    private async _invalidateSiteStatCaches(siteId: string): Promise<void> {
        if (!this.cacheInvalidator) return;
        const slug = await this._resolveSiteSlug(siteId);
        await this._invalidatePublishedCatalogCaches({
            siteSlugs: slug ? [slug] : undefined,
        });
    }

    private async _invalidateTaxonomyCaches(): Promise<void> {
        if (!this.cacheInvalidator) return;
        await this.cacheInvalidator.invalidateKey(CACHE_KEYS.TAXONOMY_CATEGORIES_ACTIVE);
        await this.cacheInvalidator.invalidateKey(CACHE_KEYS.TAXONOMY_TAGS_ACTIVE);
        await this.cacheInvalidator.invalidateKey(CACHE_KEYS.TAXONOMY_OPPORTUNITY_TYPES);
        await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.PUBLISHED_LIST}:*`);
    }

    private async _invalidateSiteCommentsCache(siteId: string): Promise<void> {
        if (!this.cacheInvalidator) return;
        await this.cacheInvalidator.invalidateKey(`${CACHE_KEYS.COMMENTS_BY_SITE_ID}:${siteId}`);
    }

    async getPublishedSites(
        options: PublishedLinkDirectorySitesFilterOptions
    ): Promise<{ sites: LinkDirectorySiteRow[]; count: number }> {
        const normalized: PublishedLinkDirectorySitesFilterOptions = {
            limit: options.limit ?? 20,
            skip: options.skip ?? 0,
            searchTerm: options.searchTerm ?? null,
            tagSlugs: options.tagSlugs ?? null,
            categorySlug: options.categorySlug ?? null,
            costTiers: options.costTiers ?? null,
            dofollow: options.dofollow ?? null,
            effort: options.effort ?? null,
            approvalMode: options.approvalMode ?? null,
            opportunityTypeSlugs: options.opportunityTypeSlugs ?? null,
            sortByKey: options.sortByKey ?? null,
            sortByOrder: options.sortByOrder ?? null,
            range: options.range ?? null,
        };

        const cacheKey = buildPublishedLinkDirectorySitesCacheKey(normalized, CACHE_KEYS.PUBLISHED_LIST);
        const factory = async () => {
            const { data, count } = await this.linkDirectoryRepository.findPublishedSites(normalized);
            return { sites: data, count };
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LINK_DIRECTORY_CACHE_TTL_SEC);
        return factory();
    }

    async getPublishedSiteBySlug(siteSlug: string): Promise<LinkDirectorySiteRow | null> {
        const cacheKey = `${CACHE_KEYS.PUBLISHED_BY_SLUG}:${siteSlug}`;
        const factory = async () => {
            const { data } = await this.linkDirectoryRepository.findPublishedSiteBySlug(siteSlug);
            return data;
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LINK_DIRECTORY_CACHE_TTL_SEC);
        return factory();
    }

    async getPublishedHubStats(): Promise<{
        siteCount: number;
        opportunityCount: number;
        freeOrFreemiumOpportunityCount: number;
        quickWinOpportunityCount: number;
    }> {
        const cacheKey = CACHE_KEYS.PUBLISHED_HUB_STATS;
        const factory = async () => this.linkDirectoryRepository.findPublishedHubStats();
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LINK_DIRECTORY_CACHE_TTL_SEC);
        return factory();
    }

    async getActiveCategories(): Promise<LinkDirectoryCategoryRow[]> {
        const cacheKey = CACHE_KEYS.TAXONOMY_CATEGORIES_ACTIVE;
        const factory = async () => {
            const { data } = await this.categoryRepository.findActiveCategories();
            return data;
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LINK_DIRECTORY_CACHE_TTL_SEC);
        return factory();
    }

    async getActiveTags(): Promise<LinkDirectoryTagRow[]> {
        const cacheKey = CACHE_KEYS.TAXONOMY_TAGS_ACTIVE;
        const factory = async () => {
            const { data } = await this.tagRepository.findActiveTags();
            return data;
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LINK_DIRECTORY_CACHE_TTL_SEC);
        return factory();
    }

    async getOpportunityTypes(): Promise<LinkDirectoryOpportunityTypeRow[]> {
        const cacheKey = CACHE_KEYS.TAXONOMY_OPPORTUNITY_TYPES;
        const factory = async () => {
            const { data } = await this.linkDirectoryRepository.findOpportunityTypes();
            return data;
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LINK_DIRECTORY_CACHE_TTL_SEC);
        return factory();
    }

    async createSubmission(
        payload: LinkDirectorySubmissionCreateSchemaType,
        userId?: string | null
    ): Promise<string> {
        const submissionId = await this.linkDirectoryRepository.createSubmission(payload, userId);
        this.internalOpsEmailService.notifyLinkDirectorySubmissionCreated({
            submissionId,
            siteUrl: payload.site_url,
            email: payload.email,
            proposedTitle: payload.proposed_title,
            notes: payload.notes,
            userId: userId ?? undefined,
        });
        return submissionId;
    }

    async getAdminSites(
        options: AdminLinkDirectorySitesFilterOptions
    ): Promise<{ sites: LinkDirectorySiteRow[]; count: number }> {
        const normalized: AdminLinkDirectorySitesFilterOptions = {
            limit: options.limit ?? 50,
            searchTerm: options.searchTerm ?? null,
            sortByKey: options.sortByKey ?? "created_at",
            sortByOrder: options.sortByOrder ?? false,
            range: options.range ?? null,
        };

        const cacheKey = buildAdminLinkDirectorySitesCacheKey(normalized, CACHE_KEYS.ADMIN_SITES_LIST);
        const factory = async () => {
            const { data, count } = await this.linkDirectoryRepository.findAdminSites(normalized);
            return { sites: data, count };
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LINK_DIRECTORY_CACHE_TTL_SEC);
        return factory();
    }

    async getSiteById(siteId: string): Promise<LinkDirectorySiteRow> {
        const { data } = await this.linkDirectoryRepository.findSiteById(siteId);
        return data;
    }

    async createSite(
        payload: LinkDirectorySiteCreateSchemaType,
        tagIds: string[] = []
    ): Promise<string> {
        const siteId = await this.linkDirectoryRepository.createSite(payload, tagIds);
        await this._invalidateSiteMutationCaches({ siteSlugs: [payload.slug] });
        return siteId;
    }

    async updateSite(
        payload: LinkDirectorySiteUpdateSchemaType,
        tagIds?: string[]
    ): Promise<string> {
        let previousSiteSlug: string | undefined;
        try {
            const existing = await this.getSiteById(payload.id);
            if (existing.slug !== payload.slug) previousSiteSlug = existing.slug;
        } catch {
            // Best-effort slug invalidation when the row is missing
        }
        const siteId = await this.linkDirectoryRepository.updateSite(payload, tagIds);
        await this._invalidateSiteMutationCaches({
            siteSlugs: [payload.slug],
            previousSiteSlug,
        });
        return siteId;
    }

    async deleteSite(siteId: string): Promise<void> {
        let siteSlug: string | undefined;
        try {
            const existing = await this.getSiteById(siteId);
            siteSlug = existing.slug;
        } catch {
            // Best-effort slug invalidation when the row is missing
        }
        await this.linkDirectoryRepository.deleteSite(siteId);
        await this._invalidateSiteMutationCaches({
            siteSlugs: siteSlug ? [siteSlug] : undefined,
        });
    }

    async createOpportunity(
        siteId: string,
        payload: LinkDirectoryOpportunityCreateSchemaType
    ): Promise<string> {
        const opportunityId = await this.linkDirectoryRepository.createOpportunity(siteId, payload);
        await this._invalidateSiteMutationCaches({ siteId });
        return opportunityId;
    }

    async updateOpportunity(payload: LinkDirectoryOpportunityUpdateSchemaType): Promise<string> {
        const { data: opportunity } = await this.linkDirectoryRepository.findOpportunityById(payload.id);
        const opportunityId = await this.linkDirectoryRepository.updateOpportunity(payload);
        await this._invalidateSiteMutationCaches({ siteId: opportunity.site_id });
        return opportunityId;
    }

    async deleteOpportunity(opportunityId: string): Promise<void> {
        const { data: opportunity } = await this.linkDirectoryRepository.findOpportunityById(opportunityId);
        await this.linkDirectoryRepository.deleteOpportunity(opportunityId);
        await this._invalidateSiteMutationCaches({ siteId: opportunity.site_id });
    }

    async getAllCategories(): Promise<LinkDirectoryCategoryRow[]> {
        const { data } = await this.categoryRepository.findAllCategories();
        return data;
    }

    async createCategory(payload: LinkDirectoryCategoryCreateSchemaType): Promise<string> {
        const categoryId = await this.categoryRepository.createCategory(payload);
        await this._invalidateTaxonomyCaches();
        return categoryId;
    }

    async updateCategory(payload: LinkDirectoryCategoryUpdateSchemaType): Promise<string> {
        const categoryId = await this.categoryRepository.updateCategory(payload);
        await this._invalidateTaxonomyCaches();
        return categoryId;
    }

    async deleteCategory(categoryId: string): Promise<void> {
        await this.categoryRepository.deleteCategory(categoryId);
        await this._invalidateTaxonomyCaches();
    }

    async getAllTags(): Promise<LinkDirectoryTagRow[]> {
        const { data } = await this.tagRepository.findAllTags();
        return data;
    }

    async getAllTagGroups(): Promise<LinkDirectoryTagGroupRow[]> {
        const { data } = await this.tagRepository.findAllTagGroups();
        return data;
    }

    async createTag(payload: LinkDirectoryTagCreateSchemaType, groupIds: string[]): Promise<string> {
        const tagId = await this.tagRepository.createTag(payload, groupIds);
        await this._invalidateTaxonomyCaches();
        return tagId;
    }

    async updateTag(payload: LinkDirectoryTagUpdateSchemaType, groupIds: string[]): Promise<string> {
        const tagId = await this.tagRepository.updateTag(payload, groupIds);
        await this._invalidateTaxonomyCaches();
        return tagId;
    }

    async deleteTag(tagId: string): Promise<void> {
        await this.tagRepository.deleteTag(tagId);
        await this._invalidateTaxonomyCaches();
    }

    async createTagGroup(payload: LinkDirectoryTagGroupCreateSchemaType): Promise<string> {
        const tagGroupId = await this.tagRepository.createTagGroup(payload);
        await this._invalidateTaxonomyCaches();
        return tagGroupId;
    }

    async updateTagGroup(
        tagGroupId: string,
        payload: LinkDirectoryTagGroupCreateSchemaType
    ): Promise<string> {
        const id = await this.tagRepository.updateTagGroup(tagGroupId, payload);
        await this._invalidateTaxonomyCaches();
        return id;
    }

    async deleteTagGroup(tagGroupId: string): Promise<void> {
        await this.tagRepository.deleteTagGroup(tagGroupId);
        await this._invalidateTaxonomyCaches();
    }

    async getAdminSubmissions(): Promise<LinkDirectorySubmissionRow[]> {
        const { data } = await this.linkDirectoryRepository.findAdminSubmissions();
        return data;
    }

    async reviewSubmission(
        submissionId: string,
        status: "approved" | "rejected",
        reviewedByUserId: string
    ): Promise<void> {
        await this.linkDirectoryRepository.updateSubmissionStatus(
            submissionId,
            status,
            reviewedByUserId
        );
    }

    async getUserSavedSites(userId: string) {
        const { data } = await this.linkDirectoryRepository.findUserSavedSites(userId);
        return sanitizeSavedSiteRowsForRead(data);
    }

    async replaceUserSavedSites(userId: string, siteIds: string[]): Promise<void> {
        const dedupedSiteIds = dedupeSiteIdsPreservingOrder(siteIds);
        await this.linkDirectoryRepository.assertPublishedSiteIds(dedupedSiteIds);
        await this.linkDirectoryRepository.replaceUserSavedSites(userId, dedupedSiteIds);
    }

    async reorderUserSavedSites(userId: string, siteIds: string[]): Promise<void> {
        const dedupedSiteIds = dedupeSiteIdsPreservingOrder(siteIds);
        const { data: currentSaved } = await this.linkDirectoryRepository.findUserSavedSites(userId);
        const currentSiteIds = currentSaved.map((row) => row.site_id);
        if (!savedSiteIdsMatchOrderRequest(currentSiteIds, dedupedSiteIds)) {
            throw new ValidationError(
                "Saved site order must include every saved site exactly once."
            );
        }
        await this.linkDirectoryRepository.assertPublishedSiteIds(dedupedSiteIds);
        await this.linkDirectoryRepository.reorderUserSavedSites(userId, dedupedSiteIds);
    }

    async setUserSavedSiteOutreachCompleted(
        userId: string,
        siteId: string,
        completed: boolean
    ): Promise<void> {
        const outreachCompletedAt = completed ? new Date().toISOString() : null;
        await this.linkDirectoryRepository.setUserSavedSiteOutreachCompleted(
            userId,
            siteId,
            outreachCompletedAt
        );
    }

    async incrementSiteViews(siteId: string): Promise<void> {
        await this.assertPublishedSiteForEngagement(siteId);
        await this.linkDirectoryRepository.incrementSiteStatCounter(siteId, "views");
        await this._invalidateSiteStatCaches(siteId);
    }

    async incrementSiteLikes(siteId: string): Promise<void> {
        await this.assertPublishedSiteForEngagement(siteId);
        await this.linkDirectoryRepository.incrementSiteStatCounter(siteId, "likes");
        await this._invalidateSiteStatCaches(siteId);
    }

    async getSiteComments(siteId: string): Promise<LinkDirectorySiteComment[]> {
        await this.assertPublishedSiteForEngagement(siteId);
        const cacheKey = `${CACHE_KEYS.COMMENTS_BY_SITE_ID}:${siteId}`;
        const factory = async () => {
            const { data } = await this.linkDirectoryRepository.findSiteComments(siteId);
            return data;
        };
        if (this.cache) return this.cache.getOrSet(cacheKey, factory, LINK_DIRECTORY_CACHE_TTL_SEC);
        return factory();
    }

    async createSiteComment(
        siteId: string,
        payload: LinkDirectorySiteCommentCreateSchemaType,
        userId: string,
        authUserId?: string,
        userEmail?: string
    ): Promise<{ id: string }> {
        await this.assertPublishedSiteForEngagement(siteId);
        await this.assertCommunityFeatures(authUserId);
        const result = await this.linkDirectoryRepository.createSiteComment(siteId, payload, userId);

        let siteSlug: string | null = null;
        let siteTitle: string | null = null;
        try {
            const site = await this.getSiteById(siteId);
            siteSlug = site.slug;
            siteTitle = site.title;
        } catch {
            // Best-effort context for ops email
        }

        this.internalOpsEmailService.notifyLinkDirectorySiteCommentCreated({
            commentId: result.id,
            siteId,
            siteSlug,
            siteTitle,
            content: payload.content,
            userId,
            userEmail,
            parentId: payload.parentId ?? null,
        });

        await this._invalidateSiteCommentsCache(siteId);

        return { id: result.id };
    }

    async upsertSiteRating(
        siteId: string,
        rating: number,
        userId: string,
        authUserId?: string
    ): Promise<{ id: string }> {
        await this.assertPublishedSiteForEngagement(siteId);
        await this.assertCommunityFeatures(authUserId);
        return this.linkDirectoryRepository.upsertSiteRating(siteId, userId, rating);
    }

    async getAdminSiteComments(
        options: AdminLinkDirectorySiteCommentsFilterOptions
    ): Promise<{ comments: AdminLinkDirectorySiteComment[]; count: number }> {
        const normalized: AdminLinkDirectorySiteCommentsFilterOptions = {
            limit: options.limit ?? 100,
            searchTerm: options.searchTerm ?? null,
            sortByKey: options.sortByKey ?? "created_at",
            sortByOrder: options.sortByOrder ?? false,
            range: options.range ?? null,
        };
        const { data, count } = await this.linkDirectoryRepository.findAdminSiteComments(normalized);
        return { comments: data, count };
    }

    async approveSiteComment(commentId: string): Promise<{ id: string }> {
        const result = await this.linkDirectoryRepository.approveSiteComment(commentId);
        await this._invalidateSiteCommentsCache(result.site_id);
        return { id: result.id };
    }

    async deleteSiteComment(commentId: string): Promise<void> {
        const result = await this.linkDirectoryRepository.deleteSiteComment(commentId);
        await this._invalidateSiteCommentsCache(result.site_id);
    }
}
