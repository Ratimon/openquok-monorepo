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
		syncFromGithub: (id: string) => `/api/v1/listings/${id}/sync-github`
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
	ListingDetailPublicViewModel,
	ListingEditorViewModel,
	ListingPublicViewModel,
	ListingTagViewModel,
	ListingViewModel,
	TagViewModel
} from '$lib/listings/GetListing.presenter.svelte';
export { CONFIG_SCHEMA_LISTINGS, LISTING_IMAGES_BUCKET } from '$lib/config/constants/config';
export { markdownToHtml } from '$lib/listings/utils/markdownToHtml';
export { mergeListingSchemaIntoGraph } from '$lib/listings/utils/mergeListingSchemaJson';
export { createSortedCategoryChoices } from '$lib/listings/utils/parentPathCreator';
