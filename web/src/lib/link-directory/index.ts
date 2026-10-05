import { ActionVerificationModalPresenter } from '$lib/core/ActionVerificationModal.presenter.svelte';
import { httpGateway } from '$lib/core/index';

import type { LinkDirectoryConfig } from '$lib/link-directory/constants/config';
import { LinkDirectoryRepository } from '$lib/link-directory/LinkDirectory.repository';
import { PublicBuildBacklinksBookmarksPresenter } from '$lib/link-directory/PublicBuildBacklinksBookmarks.presenter.svelte';
import { PublicBuildBacklinksPagePresenter } from '$lib/link-directory/PublicBuildBacklinksPage.presenter.svelte';
import { PublicBuildBacklinksSiteBySlugPagePresenter } from '$lib/link-directory/PublicBuildBacklinksSiteBySlugPage.presenter.svelte';

const linkDirectoryConfig: LinkDirectoryConfig = {
	endpoints: {
		getPublishedSites: '/api/v1/link-directory/published',
		getPublishedHubStats: '/api/v1/link-directory/published/stats',
		getPublishedSiteBySlug: (siteSlug: string) =>
			`/api/v1/link-directory/published/${encodeURIComponent(siteSlug)}`,
		getActiveCategories: '/api/v1/link-directory/categories/active',
		getActiveTags: '/api/v1/link-directory/tags/active',
		getOpportunityTypes: '/api/v1/link-directory/opportunity-types',
		createSubmission: '/api/v1/link-directory/submissions',
		getMySavedSites: '/api/v1/link-directory/me/saved-sites',
		putMySavedSites: '/api/v1/link-directory/me/saved-sites',
		putMySavedSitesOrder: '/api/v1/link-directory/me/saved-sites/order',
		patchSavedSiteOutreachCompletion: (siteId: string) =>
			`/api/v1/link-directory/me/saved-sites/${encodeURIComponent(siteId)}/outreach-completion`,
		getAdminSites: '/api/v1/link-directory/all-full',
		getSiteById: (siteId: string) => `/api/v1/link-directory/sites/${siteId}`,
		createSite: '/api/v1/link-directory/sites',
		updateSite: (siteId: string) => `/api/v1/link-directory/sites/${siteId}`,
		deleteSite: (siteId: string) => `/api/v1/link-directory/sites/${siteId}`,
		createOpportunity: (siteId: string) => `/api/v1/link-directory/sites/${siteId}/opportunities`,
		updateOpportunity: (opportunityId: string) => `/api/v1/link-directory/opportunities/${opportunityId}`,
		deleteOpportunity: (opportunityId: string) => `/api/v1/link-directory/opportunities/${opportunityId}`,
		getAllCategories: '/api/v1/link-directory/categories/all-full',
		createCategory: '/api/v1/link-directory/categories',
		updateCategory: (categoryId: string) => `/api/v1/link-directory/categories/${categoryId}`,
		deleteCategory: (categoryId: string) => `/api/v1/link-directory/categories/${categoryId}`,
		getAllTags: '/api/v1/link-directory/tags/all-full',
		getTagGroups: '/api/v1/link-directory/tags/groups',
		createTagGroup: '/api/v1/link-directory/tags/groups',
		updateTagGroup: (tagGroupId: string) => `/api/v1/link-directory/tags/groups/${tagGroupId}`,
		deleteTagGroup: (tagGroupId: string) => `/api/v1/link-directory/tags/groups/${tagGroupId}`,
		createTag: '/api/v1/link-directory/tags',
		updateTag: (tagId: string) => `/api/v1/link-directory/tags/${tagId}`,
		deleteTag: (tagId: string) => `/api/v1/link-directory/tags/${tagId}`,
		getAdminSubmissions: '/api/v1/link-directory/admin/submissions',
		reviewSubmission: (submissionId: string) => `/api/v1/link-directory/admin/submissions/${submissionId}`,
		postSiteViews: (siteId: string) =>
			`/api/v1/link-directory/sites/${encodeURIComponent(siteId)}/views`,
		postSiteLikes: (siteId: string) =>
			`/api/v1/link-directory/sites/${encodeURIComponent(siteId)}/likes`,
		getSiteComments: (siteId: string) =>
			`/api/v1/link-directory/sites/${encodeURIComponent(siteId)}/comments`,
		createSiteComment: (siteId: string) =>
			`/api/v1/link-directory/sites/${encodeURIComponent(siteId)}/comments`,
		upsertSiteRating: (siteId: string) =>
			`/api/v1/link-directory/sites/${encodeURIComponent(siteId)}/ratings`,
		getAdminSiteComments: '/api/v1/link-directory/admin/site-comments',
		approveSiteComment: (commentId: string) =>
			`/api/v1/link-directory/admin/site-comments/${encodeURIComponent(commentId)}/approve`,
		deleteSiteComment: (commentId: string) =>
			`/api/v1/link-directory/admin/site-comments/${encodeURIComponent(commentId)}`
	}
};

export const linkDirectoryRepository = new LinkDirectoryRepository(httpGateway, linkDirectoryConfig);

const deleteLinkDirectorySiteCommentVerificationPresenter = new ActionVerificationModalPresenter(
	async (data: unknown) => {
		const d = data as { commentId: string };
		const result = await linkDirectoryRepository.deleteAdminSiteComment(d.commentId);
		if (result.ok) return { success: true, message: 'Comment deleted.' };
		return { success: false, message: result.error ?? 'Failed to delete comment.' };
	}
);

export const publicBuildBacklinksPagePresenter = new PublicBuildBacklinksPagePresenter(
	linkDirectoryRepository
);

export const publicBuildBacklinksBookmarksPresenter = new PublicBuildBacklinksBookmarksPresenter(
	linkDirectoryRepository
);

export const publicBuildBacklinksSiteBySlugPagePresenter = new PublicBuildBacklinksSiteBySlugPagePresenter(
	linkDirectoryRepository
);

export { deleteLinkDirectorySiteCommentVerificationPresenter };

export type {
	BuildBacklinksHubFilters,
	BuildBacklinksSort,
	LinkDirectorySavedSiteDto,
	LinkDirectoryCategoryDto,
	LinkDirectoryOpportunityDto,
	LinkDirectorySiteCommentDto,
	LinkDirectorySiteDto,
	LinkDirectoryTagDto
} from '$lib/link-directory/link-directory.types';

export { linkDirectorySubmissionFormSchema } from '$lib/link-directory/link-directory.types';
