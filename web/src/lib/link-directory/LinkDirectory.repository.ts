import {
	HttpGateway,
	HttpMethod,
	withNotFoundFallback,
	withOptionalCmsFallback
} from '$lib/core/HttpGateway';
import {
	publicCmsEditorManagedDetailRequestOptions,
	publicCmsServerRequestOptions
} from '$lib/core/publicCmsFetch';

import type { LinkDirectoryConfig } from '$lib/link-directory/constants/config';
import type {
	LinkDirectorySavedSiteDto,
	LinkDirectoryCategoryDto,
	LinkDirectoryOpportunityTypeDto,
	LinkDirectorySiteCommentDto,
	LinkDirectorySiteDto,
	LinkDirectoryTagDto,
	LinkDirectorySubmissionFormValues
} from '$lib/link-directory/link-directory.types';
import type {
	AdminLinkDirectorySiteCommentVm,
	LinkDirectoryCategoryFormValues,
	LinkDirectoryOpportunityApiPayload,
	LinkDirectoryOpportunityFormValues,
	LinkDirectorySiteFormValues,
	LinkDirectorySubmissionDto,
	LinkDirectoryTagFormValues,
	LinkDirectoryTagGroupDto,
	LinkDirectoryTagGroupFormValues,
	LinkDirectoryUpsertResult
} from '$lib/link-directory/link-directory-admin.types';

type PublishedSitesResponseDto = {
	success: boolean;
	data: LinkDirectorySiteDto[];
	count?: number;
};

type PublishedHubStatsResponseDto = {
	success: boolean;
	data: {
		siteCount: number;
		opportunityCount: number;
		freeOrFreemiumOpportunityCount: number;
		quickWinOpportunityCount: number;
	};
};

type PublishedSiteResponseDto = {
	success: boolean;
	data: LinkDirectorySiteDto;
};

type CategoriesResponseDto = {
	success: boolean;
	data: LinkDirectoryCategoryDto[];
};

type TagsResponseDto = {
	success: boolean;
	data: LinkDirectoryTagDto[];
};

type SubmissionResponseDto = {
	success: boolean;
	data?: { id: string };
	message?: string;
};

type SavedSitesResponseDto = {
	success: boolean;
	data: LinkDirectorySavedSiteDto[];
	message?: string;
};

type IdResponseDto = {
	success: boolean;
	data?: { id: string };
	message?: string;
};

type MessageResponseDto = {
	success: boolean;
	message?: string;
};

type OpportunityTypesResponseDto = {
	success: boolean;
	data: LinkDirectoryOpportunityTypeDto[];
};

type SubmissionsResponseDto = {
	success: boolean;
	data: LinkDirectorySubmissionDto[];
};

type TagGroupsResponseDto = {
	success: boolean;
	data: Array<{ id: string; name: string; sort_order: number }>;
};

type SiteCommentsResponseDto = {
	success: boolean;
	data: LinkDirectorySiteCommentDto[];
};

type SiteEngagementMutationResponseDto = {
	success: boolean;
	data?: { id: string };
	message?: string;
};

type AdminSiteCommentDto = AdminLinkDirectorySiteCommentVm;

type GetAdminSiteCommentsResponseDto = {
	success: boolean;
	data?: {
		commentsResult: AdminSiteCommentDto[];
		countResult: number;
	};
	message?: string;
};

type ApproveSiteCommentResponseDto = {
	success: boolean;
	data?: { id: string };
	message?: string;
};

export type LinkDirectorySiteEngagementMutationResult = { ok: true; id?: string } | { ok: false; error: string };

export class LinkDirectoryRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: LinkDirectoryConfig
	) {}

	async getPublishedSites(
		params: {
			limit: number;
			skip: number;
			searchTerm?: string | null;
			tagSlugs?: string[] | null;
			categorySlug?: string | null;
			costTiers?: string[] | null;
			dofollow?: string[] | null;
			effort?: string[] | null;
			approvalMode?: string[] | null;
			opportunityTypeSlugs?: string[] | null;
			sortByKey?: string | null;
			sortByOrder?: boolean | null;
			fetch?: typeof globalThis.fetch;
		}
	): Promise<{ sites: LinkDirectorySiteDto[]; count: number }> {
		const query: Record<string, string | number | boolean> = {
			limit: params.limit,
			skip: params.skip
		};
		const term = params.searchTerm?.trim();
		if (term) query.searchTerm = term;
		if (params.tagSlugs?.length) query.tagSlugs = params.tagSlugs.join(',');
		if (params.categorySlug) query.categorySlug = params.categorySlug;
		if (params.costTiers?.length) query.costTiers = params.costTiers.join(',');
		if (params.dofollow?.length) query.dofollow = params.dofollow.join(',');
		if (params.effort?.length) query.effort = params.effort.join(',');
		if (params.approvalMode?.length) query.approvalMode = params.approvalMode.join(',');
		if (params.opportunityTypeSlugs?.length) {
			query.opportunityTypeSlugs = params.opportunityTypeSlugs.join(',');
		}
		if (params.sortByKey) query.sortByKey = params.sortByKey;
		if (params.sortByOrder != null) query.sortByOrder = params.sortByOrder;

		return withOptionalCmsFallback(async () => {
			const { data: publishedSitesDto, ok } = await this.httpGateway.get<PublishedSitesResponseDto>(
				this.config.endpoints.getPublishedSites,
				query,
				publicCmsServerRequestOptions(params.fetch)
			);

			if (ok && publishedSitesDto?.success && Array.isArray(publishedSitesDto.data)) {
				return {
					sites: publishedSitesDto.data,
					count: publishedSitesDto.count ?? 0
				};
			}
			return { sites: [], count: 0 };
		}, { sites: [], count: 0 });
	}

	async getPublishedHubStats(fetch?: typeof globalThis.fetch): Promise<{
		siteCount: number;
		opportunityCount: number;
		freeOrFreemiumOpportunityCount: number;
		quickWinOpportunityCount: number;
	} | null> {
		return withOptionalCmsFallback(async () => {
			const { data: statsDto, ok } = await this.httpGateway.get<PublishedHubStatsResponseDto>(
				this.config.endpoints.getPublishedHubStats,
				undefined,
				publicCmsServerRequestOptions(fetch)
			);

			if (ok && statsDto?.success && statsDto.data) {
				return statsDto.data;
			}
			return null;
		}, null);
	}

	async getPublishedSiteBySlug(
		siteSlug: string,
		fetch?: typeof globalThis.fetch
	): Promise<LinkDirectorySiteDto | null> {
		return withNotFoundFallback(async () => {
			const { data: publishedSiteDto, ok } = await this.httpGateway.get<PublishedSiteResponseDto>(
				this.config.endpoints.getPublishedSiteBySlug(siteSlug),
				undefined,
				publicCmsEditorManagedDetailRequestOptions(fetch)
			);
			if (ok && publishedSiteDto?.success && publishedSiteDto.data) {
				return publishedSiteDto.data;
			}
			return null;
		}, null);
	}

	async getActiveCategories(fetch?: typeof globalThis.fetch): Promise<LinkDirectoryCategoryDto[]> {
		const { data: categoriesDto, ok } = await this.httpGateway.get<CategoriesResponseDto>(
			this.config.endpoints.getActiveCategories,
			undefined,
			publicCmsServerRequestOptions(fetch)
		);
		if (ok && categoriesDto?.success && Array.isArray(categoriesDto.data)) {
			return categoriesDto.data;
		}
		return [];
	}

	async getActiveTags(fetch?: typeof globalThis.fetch): Promise<LinkDirectoryTagDto[]> {
		const { data: tagsDto, ok } = await this.httpGateway.get<TagsResponseDto>(
			this.config.endpoints.getActiveTags,
			undefined,
			publicCmsServerRequestOptions(fetch)
		);
		if (ok && tagsDto?.success && Array.isArray(tagsDto.data)) {
			return tagsDto.data;
		}
		return [];
	}

	async getMySavedSites(fetch?: typeof globalThis.fetch): Promise<LinkDirectorySavedSiteDto[]> {
		const { data: savedSitesDto, ok } = await this.httpGateway.get<SavedSitesResponseDto>(
			this.config.endpoints.getMySavedSites,
			undefined,
			{ withCredentials: true, fetch }
		);
		if (ok && savedSitesDto?.success && Array.isArray(savedSitesDto.data)) {
			return savedSitesDto.data;
		}
		return [];
	}

	async replaceMySavedSites(
		siteIds: string[],
		fetch?: typeof globalThis.fetch
	): Promise<{ ok: boolean; savedSites: LinkDirectorySavedSiteDto[]; error?: string }> {
		try {
			const { data: savedSitesDto, ok } = await this.httpGateway.put<SavedSitesResponseDto>(
				this.config.endpoints.putMySavedSites,
				{ siteIds },
				{ withCredentials: true, fetch }
			);
			if (ok && savedSitesDto?.success && Array.isArray(savedSitesDto.data)) {
				return { ok: true, savedSites: savedSitesDto.data };
			}
			return {
				ok: false,
				savedSites: [],
				error: savedSitesDto?.message ?? 'Failed to update saved sites.'
			};
		} catch {
			return { ok: false, savedSites: [], error: 'Failed to update saved sites.' };
		}
	}

	async reorderMySavedSites(
		siteIds: string[],
		fetch?: typeof globalThis.fetch
	): Promise<{ ok: boolean; savedSites: LinkDirectorySavedSiteDto[]; error?: string }> {
		try {
			const { data: savedSitesDto, ok } = await this.httpGateway.put<SavedSitesResponseDto>(
				this.config.endpoints.putMySavedSitesOrder,
				{ siteIds },
				{ withCredentials: true, fetch }
			);
			if (ok && savedSitesDto?.success && Array.isArray(savedSitesDto.data)) {
				return { ok: true, savedSites: savedSitesDto.data };
			}
			return {
				ok: false,
				savedSites: [],
				error: savedSitesDto?.message ?? 'Failed to reorder saved sites.'
			};
		} catch {
			return { ok: false, savedSites: [], error: 'Failed to reorder saved sites.' };
		}
	}

	async setSavedSiteOutreachCompletion(
		siteId: string,
		completed: boolean,
		fetch?: typeof globalThis.fetch
	): Promise<{ ok: boolean; savedSites: LinkDirectorySavedSiteDto[]; error?: string }> {
		try {
			const { data: savedSitesDto, ok } = await this.httpGateway.request<SavedSitesResponseDto>({
				method: HttpMethod.PATCH,
				url: this.config.endpoints.patchSavedSiteOutreachCompletion(siteId),
				data: { completed },
				withCredentials: true,
				fetch
			});
			if (ok && savedSitesDto?.success && Array.isArray(savedSitesDto.data)) {
				return { ok: true, savedSites: savedSitesDto.data };
			}
			return {
				ok: false,
				savedSites: [],
				error: savedSitesDto?.message ?? 'Failed to update outreach completion.'
			};
		} catch {
			return { ok: false, savedSites: [], error: 'Failed to update outreach completion.' };
		}
	}

	private adminOpts(fetch?: typeof globalThis.fetch) {
		return { withCredentials: true, fetch };
	}

	private extractErrorMessage(err: unknown): string {
		if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
			return err.message;
		}
		return 'Request failed.';
	}

	async getOpportunityTypes(fetch?: typeof globalThis.fetch): Promise<LinkDirectoryOpportunityTypeDto[]> {
		const { data: typesDto, ok } = await this.httpGateway.get<OpportunityTypesResponseDto>(
			this.config.endpoints.getOpportunityTypes,
			undefined,
			publicCmsServerRequestOptions(fetch)
		);
		if (ok && typesDto?.success && Array.isArray(typesDto.data)) {
			return typesDto.data;
		}
		return [];
	}

	async getAdminSites(
		params: { limit?: number; skip?: number; searchTerm?: string },
		fetch?: typeof globalThis.fetch
	): Promise<{ sites: LinkDirectorySiteDto[]; count: number }> {
		const query: Record<string, string | number> = {
			limit: params.limit ?? 200,
			skip: params.skip ?? 0
		};
		if (params.searchTerm?.trim()) query.searchTerm = params.searchTerm.trim();

		const { data: adminSitesDto, ok } = await this.httpGateway.get<PublishedSitesResponseDto>(
			this.config.endpoints.getAdminSites,
			query,
			this.adminOpts(fetch)
		);
		if (ok && adminSitesDto?.success && Array.isArray(adminSitesDto.data)) {
			return { sites: adminSitesDto.data, count: adminSitesDto.count ?? adminSitesDto.data.length };
		}
		return { sites: [], count: 0 };
	}

	async getSiteById(siteId: string, fetch?: typeof globalThis.fetch): Promise<LinkDirectorySiteDto | null> {
		const { data: siteDto, ok } = await this.httpGateway.get<PublishedSiteResponseDto>(
			this.config.endpoints.getSiteById(siteId),
			undefined,
			this.adminOpts(fetch)
		);
		if (ok && siteDto?.success && siteDto.data) return siteDto.data;
		return null;
	}

	async createSite(payload: LinkDirectorySiteFormValues, fetch?: typeof globalThis.fetch): Promise<LinkDirectoryUpsertResult> {
		try {
			const { tagIds, id: _id, ...siteData } = payload;
			const body = {
				siteData: {
					...siteData,
					logo_url: siteData.logo_url?.trim() || null,
					category_id: siteData.category_id?.trim() || null
				},
				tagIds: tagIds ?? []
			};
			const { data: createSiteDto, ok } = await this.httpGateway.post<IdResponseDto>(
				this.config.endpoints.createSite,
				body,
				this.adminOpts(fetch)
			);
			if (ok && createSiteDto?.success && createSiteDto.data?.id) {
				return { ok: true, id: createSiteDto.data.id };
			}
			return { ok: false, error: createSiteDto?.message ?? 'Failed to create site.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async updateSite(
		siteId: string,
		payload: LinkDirectorySiteFormValues,
		fetch?: typeof globalThis.fetch
	): Promise<LinkDirectoryUpsertResult> {
		try {
			const { tagIds, ...siteData } = payload;
			const body = {
				siteData: {
					...siteData,
					id: siteId,
					logo_url: siteData.logo_url?.trim() || null,
					category_id: siteData.category_id?.trim() || null
				},
				tagIds: tagIds ?? []
			};
			const { data: updateSiteDto, ok } = await this.httpGateway.put<IdResponseDto>(
				this.config.endpoints.updateSite(siteId),
				body,
				this.adminOpts(fetch)
			);
			if (ok && updateSiteDto?.success) {
				return { ok: true, id: updateSiteDto.data?.id ?? siteId };
			}
			return { ok: false, error: updateSiteDto?.message ?? 'Failed to update site.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async deleteSite(siteId: string, fetch?: typeof globalThis.fetch): Promise<LinkDirectoryUpsertResult> {
		try {
			const { data: deleteSiteDto, ok } = await this.httpGateway.delete<MessageResponseDto>(
				this.config.endpoints.deleteSite(siteId),
				this.adminOpts(fetch)
			);
			if (ok && deleteSiteDto?.success) return { ok: true };
			return { ok: false, error: deleteSiteDto?.message ?? 'Failed to delete site.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async createOpportunity(
		siteId: string,
		payload: LinkDirectoryOpportunityFormValues,
		fetch?: typeof globalThis.fetch
	): Promise<LinkDirectoryUpsertResult> {
		try {
			const { id: _id, ...body } = payload as LinkDirectoryOpportunityApiPayload;
			const { data: createOpportunityDto, ok } = await this.httpGateway.post<IdResponseDto>(
				this.config.endpoints.createOpportunity(siteId),
				body,
				this.adminOpts(fetch)
			);
			if (ok && createOpportunityDto?.success && createOpportunityDto.data?.id) {
				return { ok: true, id: createOpportunityDto.data.id };
			}
			return { ok: false, error: createOpportunityDto?.message ?? 'Failed to create opportunity.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async updateOpportunity(
		opportunityId: string,
		payload: LinkDirectoryOpportunityFormValues,
		fetch?: typeof globalThis.fetch
	): Promise<LinkDirectoryUpsertResult> {
		try {
			const body = { ...payload, id: opportunityId } as LinkDirectoryOpportunityApiPayload;
			const { data: updateOpportunityDto, ok } = await this.httpGateway.put<IdResponseDto>(
				this.config.endpoints.updateOpportunity(opportunityId),
				body,
				this.adminOpts(fetch)
			);
			if (ok && updateOpportunityDto?.success) {
				return { ok: true, id: updateOpportunityDto.data?.id ?? opportunityId };
			}
			return { ok: false, error: updateOpportunityDto?.message ?? 'Failed to update opportunity.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async deleteOpportunity(
		opportunityId: string,
		fetch?: typeof globalThis.fetch
	): Promise<LinkDirectoryUpsertResult> {
		try {
			const { data: deleteOpportunityDto, ok } = await this.httpGateway.delete<MessageResponseDto>(
				this.config.endpoints.deleteOpportunity(opportunityId),
				this.adminOpts(fetch)
			);
			if (ok && deleteOpportunityDto?.success) return { ok: true };
			return { ok: false, error: deleteOpportunityDto?.message ?? 'Failed to delete opportunity.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async getAllCategories(fetch?: typeof globalThis.fetch): Promise<LinkDirectoryCategoryDto[]> {
		const { data: categoriesDto, ok } = await this.httpGateway.get<CategoriesResponseDto>(
			this.config.endpoints.getAllCategories,
			undefined,
			this.adminOpts(fetch)
		);
		if (ok && categoriesDto?.success && Array.isArray(categoriesDto.data)) {
			return categoriesDto.data;
		}
		return [];
	}

	async createCategory(
		payload: LinkDirectoryCategoryFormValues,
		fetch?: typeof globalThis.fetch
	): Promise<LinkDirectoryUpsertResult> {
		try {
			const { id: _id, ...body } = payload;
			const { data: createCategoryDto, ok } = await this.httpGateway.post<IdResponseDto>(
				this.config.endpoints.createCategory,
				body,
				this.adminOpts(fetch)
			);
			if (ok && createCategoryDto?.success && createCategoryDto.data?.id) {
				return { ok: true, id: createCategoryDto.data.id };
			}
			return { ok: false, error: createCategoryDto?.message ?? 'Failed to create category.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async updateCategory(
		categoryId: string,
		payload: LinkDirectoryCategoryFormValues,
		fetch?: typeof globalThis.fetch
	): Promise<LinkDirectoryUpsertResult> {
		try {
			const body = { ...payload, id: categoryId };
			const { data: updateCategoryDto, ok } = await this.httpGateway.put<IdResponseDto>(
				this.config.endpoints.updateCategory(categoryId),
				body,
				this.adminOpts(fetch)
			);
			if (ok && updateCategoryDto?.success) {
				return { ok: true, id: updateCategoryDto.data?.id ?? categoryId };
			}
			return { ok: false, error: updateCategoryDto?.message ?? 'Failed to update category.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async deleteCategory(categoryId: string, fetch?: typeof globalThis.fetch): Promise<LinkDirectoryUpsertResult> {
		try {
			const { data: deleteCategoryDto, ok } = await this.httpGateway.delete<MessageResponseDto>(
				this.config.endpoints.deleteCategory(categoryId),
				this.adminOpts(fetch)
			);
			if (ok && deleteCategoryDto?.success) return { ok: true };
			return { ok: false, error: deleteCategoryDto?.message ?? 'Failed to delete category.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async getAllTags(fetch?: typeof globalThis.fetch): Promise<LinkDirectoryTagDto[]> {
		const { data: tagsDto, ok } = await this.httpGateway.get<TagsResponseDto>(
			this.config.endpoints.getAllTags,
			undefined,
			this.adminOpts(fetch)
		);
		if (ok && tagsDto?.success && Array.isArray(tagsDto.data)) {
			return tagsDto.data;
		}
		return [];
	}

	async getAllTagGroups(fetch?: typeof globalThis.fetch): Promise<LinkDirectoryTagGroupDto[]> {
		const { data: tagGroupsDto, ok } = await this.httpGateway.get<TagGroupsResponseDto>(
			this.config.endpoints.getTagGroups,
			undefined,
			this.adminOpts(fetch)
		);
		if (ok && tagGroupsDto?.success && Array.isArray(tagGroupsDto.data)) {
			return tagGroupsDto.data.map((row) => ({
				id: row.id,
				name: row.name,
				sortOrder: row.sort_order
			}));
		}
		return [];
	}

	async createTagGroup(
		payload: LinkDirectoryTagGroupFormValues,
		fetch?: typeof globalThis.fetch
	): Promise<LinkDirectoryUpsertResult> {
		try {
			const { data: createTagGroupDto, ok } = await this.httpGateway.post<IdResponseDto>(
				this.config.endpoints.createTagGroup,
				payload,
				this.adminOpts(fetch)
			);
			if (ok && createTagGroupDto?.success && createTagGroupDto.data?.id) {
				return { ok: true, id: createTagGroupDto.data.id };
			}
			return { ok: false, error: createTagGroupDto?.message ?? 'Failed to create tag group.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async updateTagGroup(
		tagGroupId: string,
		payload: LinkDirectoryTagGroupFormValues,
		fetch?: typeof globalThis.fetch
	): Promise<LinkDirectoryUpsertResult> {
		try {
			const { data: updateTagGroupDto, ok } = await this.httpGateway.put<IdResponseDto>(
				this.config.endpoints.updateTagGroup(tagGroupId),
				payload,
				this.adminOpts(fetch)
			);
			if (ok && updateTagGroupDto?.success) {
				return { ok: true, id: updateTagGroupDto.data?.id ?? tagGroupId };
			}
			return { ok: false, error: updateTagGroupDto?.message ?? 'Failed to update tag group.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async deleteTagGroup(tagGroupId: string, fetch?: typeof globalThis.fetch): Promise<LinkDirectoryUpsertResult> {
		try {
			const { data: deleteTagGroupDto, ok } = await this.httpGateway.delete<MessageResponseDto>(
				this.config.endpoints.deleteTagGroup(tagGroupId),
				this.adminOpts(fetch)
			);
			if (ok && deleteTagGroupDto?.success) return { ok: true };
			return { ok: false, error: deleteTagGroupDto?.message ?? 'Failed to delete tag group.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async createTag(payload: LinkDirectoryTagFormValues, fetch?: typeof globalThis.fetch): Promise<LinkDirectoryUpsertResult> {
		try {
			const { id: _id, tagGroupIds, ...tagData } = payload;
			const { data: createTagDto, ok } = await this.httpGateway.post<IdResponseDto>(
				this.config.endpoints.createTag,
				{ tagData, tagGroupIds: tagGroupIds ?? [] },
				this.adminOpts(fetch)
			);
			if (ok && createTagDto?.success && createTagDto.data?.id) {
				return { ok: true, id: createTagDto.data.id };
			}
			return { ok: false, error: createTagDto?.message ?? 'Failed to create tag.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async updateTag(
		tagId: string,
		payload: LinkDirectoryTagFormValues,
		fetch?: typeof globalThis.fetch
	): Promise<LinkDirectoryUpsertResult> {
		try {
			const { tagGroupIds, ...tagData } = payload;
			const body = { tagData: { ...tagData, id: tagId }, tagGroupIds: tagGroupIds ?? [] };
			const { data: updateTagDto, ok } = await this.httpGateway.put<IdResponseDto>(
				this.config.endpoints.updateTag(tagId),
				body,
				this.adminOpts(fetch)
			);
			if (ok && updateTagDto?.success) {
				return { ok: true, id: updateTagDto.data?.id ?? tagId };
			}
			return { ok: false, error: updateTagDto?.message ?? 'Failed to update tag.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async deleteTag(tagId: string, fetch?: typeof globalThis.fetch): Promise<LinkDirectoryUpsertResult> {
		try {
			const { data: deleteTagDto, ok } = await this.httpGateway.delete<MessageResponseDto>(
				this.config.endpoints.deleteTag(tagId),
				this.adminOpts(fetch)
			);
			if (ok && deleteTagDto?.success) return { ok: true };
			return { ok: false, error: deleteTagDto?.message ?? 'Failed to delete tag.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async getAdminSubmissions(fetch?: typeof globalThis.fetch): Promise<LinkDirectorySubmissionDto[]> {
		const { data: submissionsDto, ok } = await this.httpGateway.get<SubmissionsResponseDto>(
			this.config.endpoints.getAdminSubmissions,
			undefined,
			this.adminOpts(fetch)
		);
		if (ok && submissionsDto?.success && Array.isArray(submissionsDto.data)) {
			return submissionsDto.data;
		}
		return [];
	}

	async getAdminSiteComments(
		params?: { limit?: number; searchTerm?: string | null },
		fetch?: typeof globalThis.fetch
	): Promise<AdminLinkDirectorySiteCommentVm[]> {
		const query: Record<string, string | number> = {
			limit: params?.limit ?? 100
		};
		const term = params?.searchTerm?.trim();
		if (term) query.searchTerm = term;

		const { data: getAdminSiteCommentsDto, ok } = await this.httpGateway.get<GetAdminSiteCommentsResponseDto>(
			this.config.endpoints.getAdminSiteComments,
			query,
			this.adminOpts(fetch)
		);

		if (ok && getAdminSiteCommentsDto?.success && Array.isArray(getAdminSiteCommentsDto.data?.commentsResult)) {
			return getAdminSiteCommentsDto.data.commentsResult;
		}
		return [];
	}

	async approveAdminSiteComment(
		commentId: string,
		fetch?: typeof globalThis.fetch
	): Promise<LinkDirectoryUpsertResult> {
		try {
			const { data: approveSiteCommentDto, ok } = await this.httpGateway.request<ApproveSiteCommentResponseDto>({
				method: HttpMethod.PATCH,
				url: this.config.endpoints.approveSiteComment(commentId),
				...this.adminOpts(fetch)
			});
			if (ok && approveSiteCommentDto?.success) {
				return { ok: true, id: approveSiteCommentDto.data?.id ?? commentId };
			}
			return { ok: false, error: approveSiteCommentDto?.message ?? 'Failed to approve comment.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async deleteAdminSiteComment(
		commentId: string,
		fetch?: typeof globalThis.fetch
	): Promise<LinkDirectoryUpsertResult> {
		try {
			const { data: deleteSiteCommentDto, ok } = await this.httpGateway.delete<MessageResponseDto>(
				this.config.endpoints.deleteSiteComment(commentId),
				this.adminOpts(fetch)
			);
			if (ok && deleteSiteCommentDto?.success) return { ok: true };
			return { ok: false, error: deleteSiteCommentDto?.message ?? 'Failed to delete comment.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async reviewSubmission(
		submissionId: string,
		status: 'approved' | 'rejected',
		fetch?: typeof globalThis.fetch
	): Promise<LinkDirectoryUpsertResult> {
		try {
			const { data: reviewDto, ok } = await this.httpGateway.request<MessageResponseDto>({
				method: HttpMethod.PATCH,
				url: this.config.endpoints.reviewSubmission(submissionId),
				data: { status },
				...this.adminOpts(fetch)
			});
			if (ok && reviewDto?.success) return { ok: true };
			return { ok: false, error: reviewDto?.message ?? 'Failed to update submission.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async getSiteComments(
		siteId: string,
		fetch?: typeof globalThis.fetch
	): Promise<LinkDirectorySiteCommentDto[]> {
		const { data: siteCommentsDto, ok } = await this.httpGateway.get<SiteCommentsResponseDto>(
			this.config.endpoints.getSiteComments(siteId),
			undefined,
			publicCmsServerRequestOptions(fetch)
		);
		if (ok && siteCommentsDto?.success && Array.isArray(siteCommentsDto.data)) {
			return siteCommentsDto.data;
		}
		return [];
	}

	async createSiteComment(params: {
		siteId: string;
		content: string;
		parentId: string | null;
		fetch?: typeof globalThis.fetch;
	}): Promise<LinkDirectorySiteEngagementMutationResult> {
		try {
			const { data: createSiteCommentDto, ok } = await this.httpGateway.post<SiteEngagementMutationResponseDto>(
				this.config.endpoints.createSiteComment(params.siteId),
				{
					content: params.content,
					parentId: params.parentId
				},
				{ withCredentials: true, fetch: params.fetch }
			);
			if (ok && createSiteCommentDto?.success && createSiteCommentDto.data?.id) {
				return { ok: true, id: createSiteCommentDto.data.id };
			}
			return {
				ok: false,
				error: createSiteCommentDto?.message ?? 'Failed to submit comment.'
			};
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async upsertSiteRating(
		siteId: string,
		rating: number,
		fetch?: typeof globalThis.fetch
	): Promise<LinkDirectorySiteEngagementMutationResult> {
		try {
			const { data: upsertSiteRatingDto, ok } = await this.httpGateway.put<SiteEngagementMutationResponseDto>(
				this.config.endpoints.upsertSiteRating(siteId),
				{ rating },
				{ withCredentials: true, fetch }
			);
			if (ok && upsertSiteRatingDto?.success) {
				return { ok: true, id: upsertSiteRatingDto.data?.id };
			}
			return { ok: false, error: upsertSiteRatingDto?.message ?? 'Failed to save rating.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async incrementSiteViews(
		siteId: string,
		fetch?: typeof globalThis.fetch
	): Promise<LinkDirectorySiteEngagementMutationResult> {
		try {
			const { data: incrementViewsDto, ok } = await this.httpGateway.post<SiteEngagementMutationResponseDto>(
				this.config.endpoints.postSiteViews(siteId),
				undefined,
				{ withCredentials: true, fetch }
			);
			if (ok && incrementViewsDto?.success) return { ok: true };
			return { ok: false, error: incrementViewsDto?.message ?? 'Failed to record view.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async incrementSiteLikes(
		siteId: string,
		fetch?: typeof globalThis.fetch
	): Promise<LinkDirectorySiteEngagementMutationResult> {
		try {
			const { data: incrementLikesDto, ok } = await this.httpGateway.post<SiteEngagementMutationResponseDto>(
				this.config.endpoints.postSiteLikes(siteId),
				undefined,
				{ withCredentials: true, fetch }
			);
			if (ok && incrementLikesDto?.success) return { ok: true };
			return { ok: false, error: incrementLikesDto?.message ?? 'Failed to record like.' };
		} catch (err) {
			return { ok: false, error: this.extractErrorMessage(err) };
		}
	}

	async createSubmission(
		payload: LinkDirectorySubmissionFormValues,
		fetch?: typeof globalThis.fetch
	): Promise<{ ok: boolean; message?: string }> {
		try {
			const { data: submissionDto, ok } = await this.httpGateway.post<SubmissionResponseDto>(
				this.config.endpoints.createSubmission,
				{
					email: payload.email,
					site_url: payload.site_url,
					proposed_title: payload.proposed_title?.trim() || null,
					notes: payload.notes?.trim() || null
				},
				{ fetch }
			);
			if (ok && submissionDto?.success) {
				return { ok: true, message: submissionDto.message };
			}
			return { ok: false, message: submissionDto?.message ?? 'Submission failed.' };
		} catch {
			return { ok: false, message: 'Submission failed.' };
		}
	}
}
