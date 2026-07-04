import { httpGateway } from '$lib/core/index';
import { ActionVerificationModalPresenter } from '$lib/core/ActionVerificationModal.presenter.svelte';
import { ListingRepository } from '$lib/listings/Listing.repository.svelte';
import { GetListingPresenter } from '$lib/listings/GetListing.presenter.svelte';
import { UpsertListingCategoryModalPresenter } from '$lib/listings/UpsertListingCategoryModal.presenter.svelte';
import { UpsertListingTagModalPresenter } from '$lib/listings/UpsertListingTagModal.presenter.svelte';

const listingConfig = {
	endpoints: {
		getListingInformation: '/api/v1/listings/information',
		getPublishedListings: '/api/v1/listings/published',
		getPublishedBySlug: (slug: string) => `/api/v1/listings/published/${slug}`,
		getPublishedStacks: '/api/v1/listings/stacks/published',
		getPublishedStackBySlug: (slug: string) => `/api/v1/listings/stacks/published/${slug}`,
		getListingCreators: '/api/v1/listings/creators',
		getCreatorListings: (username: string) => `/api/v1/listings/creators/${encodeURIComponent(username)}`,
		getAdminListings: '/api/v1/listings/all-full',
		getListingById: (id: string) => `/api/v1/listings/${id}`,
		createListing: '/api/v1/listings',
		updateListing: (id: string) => `/api/v1/listings/${id}`,
		deleteListing: (id: string) => `/api/v1/listings/${id}`,
		getAllCategories: '/api/v1/listings/categories/all-full',
		getActiveCategories: '/api/v1/listings/categories/active-full',
		createCategory: '/api/v1/listings/categories',
		updateCategory: (id: string) => `/api/v1/listings/categories/${id}`,
		deleteCategory: (id: string) => `/api/v1/listings/categories/${id}`,
		getAllTags: '/api/v1/listings/tags/all-full',
		createTag: '/api/v1/listings/tags',
		updateTag: (id: string) => `/api/v1/listings/tags/${id}`,
		deleteTag: (id: string) => `/api/v1/listings/tags/${id}`,
		getAdminComments: '/api/v1/listings/admin/comments',
		getAdminActivities: '/api/v1/listings/admin/activities',
		approveComment: (id: string) => `/api/v1/listings/comments/${id}/approve`,
		deleteComment: (id: string) => `/api/v1/listings/comments/${id}`,
		trackView: (listingId: string) => `/api/v1/listings/stats/views/${listingId}`,
		trackLike: (listingId: string) => `/api/v1/listings/stats/likes/${listingId}`,
		trackClick: (listingId: string) => `/api/v1/listings/stats/clicks/${listingId}`,
		importFromGithub: '/api/v1/listings/import/github',
		syncFromGithub: (id: string) => `/api/v1/listings/${id}/sync-github`,
		getListingComments: (listingId: string) => `/api/v1/listings/${listingId}/comments`,
		createListingComment: '/api/v1/listings/comments',
		upsertListingRating: (listingId: string) => `/api/v1/listings/${listingId}/ratings`,
		getMyBookmarks: '/api/v1/listings/me/bookmarks',
		getMyListingStats: '/api/v1/listings/me/stats',
		getMyListings: '/api/v1/listings/me/listings',
		getMyListingById: (id: string) => `/api/v1/listings/me/listings/${id}`,
		createMyListing: '/api/v1/listings/me/listings',
		updateMyListing: (id: string) => `/api/v1/listings/me/listings/${id}`,
		deleteMyListing: (id: string) => `/api/v1/listings/me/listings/${id}`,
		addBookmark: (listingId: string) => `/api/v1/listings/${listingId}/bookmark`,
		removeBookmark: (listingId: string) => `/api/v1/listings/${listingId}/bookmark`
	}
};

const listingRepository = new ListingRepository(httpGateway, listingConfig);
const getListingPresenter = new GetListingPresenter(listingRepository);
const upsertListingCategoryModalPresenter = new UpsertListingCategoryModalPresenter(listingRepository);
const upsertListingTagModalPresenter = new UpsertListingTagModalPresenter(listingRepository);

const deleteListingVerificationPresenter = new ActionVerificationModalPresenter(async (data: unknown) => {
	const d = data as { listingId: string; listingTitle: string };
	const resultPm = await listingRepository.deleteListing(d.listingId);
	if (resultPm.ok) return { success: true, message: 'Listing deleted.' };
	return { success: false, message: resultPm.error };
});

const deleteMyListingVerificationPresenter = new ActionVerificationModalPresenter(async (data: unknown) => {
	const d = data as { listingId: string; listingTitle: string };
	const resultPm = await listingRepository.deleteMyListing(d.listingId);
	if (resultPm.ok) return { success: true, message: 'Listing deleted.' };
	return { success: false, message: resultPm.error };
});

const deleteListingCategoryVerificationPresenter = new ActionVerificationModalPresenter(async (data: unknown) => {
	const d = data as { categoryId: string; categoryName: string };
	const resultPm = await listingRepository.deleteCategory(d.categoryId);
	if (resultPm.ok) return { success: true, message: 'Category deleted.' };
	return { success: false, message: resultPm.error };
});

const deleteListingTagVerificationPresenter = new ActionVerificationModalPresenter(async (data: unknown) => {
	const d = data as { tagId: string; tagName: string };
	const resultPm = await listingRepository.deleteTag(d.tagId);
	if (resultPm.ok) return { success: true, message: 'Tag deleted.' };
	return { success: false, message: resultPm.error };
});

const deleteListingCommentVerificationPresenter = new ActionVerificationModalPresenter(async (data: unknown) => {
	const d = data as { commentId: string };
	const resultPm = await listingRepository.deleteComment(d.commentId);
	if (resultPm.ok) return { success: true, message: 'Comment deleted.' };
	return { success: false, message: resultPm.error };
});

export {
	deleteListingCategoryVerificationPresenter,
	deleteListingCommentVerificationPresenter,
	deleteListingTagVerificationPresenter,
	deleteListingVerificationPresenter,
	deleteMyListingVerificationPresenter,
	getListingPresenter,
	listingConfig,
	listingRepository,
	upsertListingCategoryModalPresenter,
	upsertListingTagModalPresenter
};
export type {
	AdminListingCommentVm,
	CategoryChoice,
	ExtensionSort,
	ExtensionTypeFilter,
	ExtensionTagFilterChip,
	ExtensionTagGroupFilterChip,
	ExtensionsHubFilters,
	ExtensionsTagFilterViewModel,
	StacksHubFilters,
	ListingCategoryFormSchemaType,
	ListingExtensionFormSchemaType,
	ListingFaqItemProgrammerModel,
	ListingFormSchemaType,
	ListingStackFormSchemaType,
	ListingTagFormSchemaType,
	TagChoice
} from '$lib/listings/listing.types';
export type {
	AdminListingActivityProgrammerModel,
	AdminListingCommentProgrammerModel,
	ListingCategoryProgrammerModel,
	ListingCreatorProgrammerModel,
	ListingConfig,
	ListingGithubImportPreviewProgrammerModel,
	ListingGithubSyncResultProgrammerModel,
	ListingMutationProgrammerModel,
	ListingProgrammerModel,
	ListingTagProgrammerModel,
	ListingTagGroupProgrammerModel,
	ListingUpsertProgrammerModel,
	McpExtensionFieldsProgrammerModel,
	McpToolProgrammerModel,
	McpTransport,
	SkillsExtensionFieldsProgrammerModel
} from '$lib/listings/Listing.repository.svelte';
export type {
	CategoryViewModel,
	ExtensionCardViewModel,
	ExtensionCategoryViewModel,
	ExtensionDetailViewModel,
	ExtensionsHubStatsViewModel,
	ExtensionsHubViewModel,
	ListingCategoryViewModel,
	ListingCreatorViewModel,
	ListingDetailPublicViewModel,
	ListingEditorViewModel,
	ListingPublicViewModel,
	ListingTagViewModel,
	ListingViewModel,
	SkillCommandViewModel,
	StackCardViewModel,
	StackDetailViewModel,
	StacksHubViewModel,
	TagViewModel
} from '$lib/listings/GetListing.presenter.svelte';
export { CONFIG_SCHEMA_LISTINGS, LISTING_IMAGES_BUCKET } from '$lib/config/constants/config';
export { markdownToHtml } from '$lib/listings/utils/listingMarkdown';
export { mergeListingSchemaIntoGraph } from '$lib/listings/utils/listingSchema';
export { createSortedCategoryChoices } from '$lib/listings/utils/listingCategories';
export {
	showListingBookmarkToast,
	type ListingBookmarkKind,
	type ListingBookmarkToggleResultViewModel
} from '$lib/listings/GetListing.presenter.svelte';
