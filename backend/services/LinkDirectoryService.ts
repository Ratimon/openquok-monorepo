import type { LinkDirectoryCategoryRepository } from "../repositories/LinkDirectoryCategoryRepository";
import type { LinkDirectoryRepository } from "../repositories/LinkDirectoryRepository";
import type { LinkDirectoryTagRepository } from "../repositories/LinkDirectoryTagRepository";
import type {
    AdminLinkDirectorySitesFilterOptions,
    LinkDirectoryCategoryRow,
    LinkDirectoryOpportunityTypeRow,
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
    LinkDirectorySiteCreateSchemaType,
    LinkDirectorySiteUpdateSchemaType,
    LinkDirectorySubmissionCreateSchemaType,
    LinkDirectoryTagCreateSchemaType,
    LinkDirectoryTagGroupCreateSchemaType,
    LinkDirectoryTagUpdateSchemaType,
} from "../data/schemas/linkDirectorySchemas";
import type { LinkDirectorySavedSiteRow } from "../data/types/linkDirectoryTypes";
import { ValidationError } from "../errors/InfraError";

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
        private readonly tagRepository: LinkDirectoryTagRepository
    ) {}

    async getPublishedSites(
        options: PublishedLinkDirectorySitesFilterOptions
    ): Promise<{ sites: LinkDirectorySiteRow[]; count: number }> {
        const { data, count } = await this.linkDirectoryRepository.findPublishedSites(options);
        return { sites: data, count };
    }

    async getPublishedSiteBySlug(siteSlug: string): Promise<LinkDirectorySiteRow | null> {
        const { data } = await this.linkDirectoryRepository.findPublishedSiteBySlug(siteSlug);
        return data;
    }

    async getPublishedHubStats(): Promise<{
        siteCount: number;
        opportunityCount: number;
        freeOrFreemiumOpportunityCount: number;
        quickWinOpportunityCount: number;
    }> {
        return this.linkDirectoryRepository.findPublishedHubStats();
    }

    async getActiveCategories(): Promise<LinkDirectoryCategoryRow[]> {
        const { data } = await this.categoryRepository.findActiveCategories();
        return data;
    }

    async getActiveTags(): Promise<LinkDirectoryTagRow[]> {
        const { data } = await this.tagRepository.findActiveTags();
        return data;
    }

    async getOpportunityTypes(): Promise<LinkDirectoryOpportunityTypeRow[]> {
        const { data } = await this.linkDirectoryRepository.findOpportunityTypes();
        return data;
    }

    async createSubmission(
        payload: LinkDirectorySubmissionCreateSchemaType,
        userId?: string | null
    ): Promise<string> {
        return this.linkDirectoryRepository.createSubmission(payload, userId);
    }

    async getAdminSites(
        options: AdminLinkDirectorySitesFilterOptions
    ): Promise<{ sites: LinkDirectorySiteRow[]; count: number }> {
        const { data, count } = await this.linkDirectoryRepository.findAdminSites(options);
        return { sites: data, count };
    }

    async getSiteById(siteId: string): Promise<LinkDirectorySiteRow> {
        const { data } = await this.linkDirectoryRepository.findSiteById(siteId);
        return data;
    }

    async createSite(
        payload: LinkDirectorySiteCreateSchemaType,
        tagIds: string[] = []
    ): Promise<string> {
        return this.linkDirectoryRepository.createSite(payload, tagIds);
    }

    async updateSite(
        payload: LinkDirectorySiteUpdateSchemaType,
        tagIds?: string[]
    ): Promise<string> {
        return this.linkDirectoryRepository.updateSite(payload, tagIds);
    }

    async deleteSite(siteId: string): Promise<void> {
        await this.linkDirectoryRepository.deleteSite(siteId);
    }

    async createOpportunity(
        siteId: string,
        payload: LinkDirectoryOpportunityCreateSchemaType
    ): Promise<string> {
        return this.linkDirectoryRepository.createOpportunity(siteId, payload);
    }

    async updateOpportunity(payload: LinkDirectoryOpportunityUpdateSchemaType): Promise<string> {
        return this.linkDirectoryRepository.updateOpportunity(payload);
    }

    async deleteOpportunity(opportunityId: string): Promise<void> {
        await this.linkDirectoryRepository.deleteOpportunity(opportunityId);
    }

    async getAllCategories(): Promise<LinkDirectoryCategoryRow[]> {
        const { data } = await this.categoryRepository.findAllCategories();
        return data;
    }

    async createCategory(payload: LinkDirectoryCategoryCreateSchemaType): Promise<string> {
        return this.categoryRepository.createCategory(payload);
    }

    async updateCategory(payload: LinkDirectoryCategoryUpdateSchemaType): Promise<string> {
        return this.categoryRepository.updateCategory(payload);
    }

    async deleteCategory(categoryId: string): Promise<void> {
        await this.categoryRepository.deleteCategory(categoryId);
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
        return this.tagRepository.createTag(payload, groupIds);
    }

    async updateTag(payload: LinkDirectoryTagUpdateSchemaType, groupIds: string[]): Promise<string> {
        return this.tagRepository.updateTag(payload, groupIds);
    }

    async deleteTag(tagId: string): Promise<void> {
        await this.tagRepository.deleteTag(tagId);
    }

    async createTagGroup(payload: LinkDirectoryTagGroupCreateSchemaType): Promise<string> {
        return this.tagRepository.createTagGroup(payload);
    }

    async updateTagGroup(
        tagGroupId: string,
        payload: LinkDirectoryTagGroupCreateSchemaType
    ): Promise<string> {
        return this.tagRepository.updateTagGroup(tagGroupId, payload);
    }

    async deleteTagGroup(tagGroupId: string): Promise<void> {
        await this.tagRepository.deleteTagGroup(tagGroupId);
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
}
