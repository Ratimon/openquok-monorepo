import type {
	ExtensionDetailViewModel,
	ExtensionsTagFilterViewModel,
	GetListingPresenter,
	ListingBookmarkKind,
	ListingBookmarkToggleResultViewModel,
	ListingCommentViewModel,
	StackCardViewModel,
	StackDetailViewModel,
	StacksHubViewModel
} from '$lib/listings/GetListing.presenter.svelte';
import type { ListingRepository, ListingUpsertProgrammerModel } from '$lib/listings/Listing.repository.svelte';
import type { StacksHubFilters } from '$lib/listings/listing.types';

import {
	buildPlaybooksHubNavigationUrl,
	parsePlaybooksHubQueryFiltersFromUrl
} from '$lib/listings/utils/buildPlaybooksHubNavigationUrl';

import type { PublicListingDetailMutationResultViewModel } from '$lib/area-public/PublicBuildingBlockBySlugPage.presenter.svelte';

export type { StackCardViewModel, StacksHubViewModel };

function mutationPmToVm(pm: ListingUpsertProgrammerModel): PublicListingDetailMutationResultViewModel {
	if (!pm.ok) return { ok: false, error: pm.error };
	return { ok: true };
}

export class PublicPlaybooksPagePresenter {
	constructor(
		private readonly getListingPresenter: GetListingPresenter,
		private readonly listingRepository: ListingRepository
	) {}

	parseFiltersFromUrl(searchParams: URLSearchParams): StacksHubFilters {
		return parsePlaybooksHubQueryFiltersFromUrl(searchParams);
	}

	buildFilterUrl(current: StacksHubFilters, overrides: Partial<StacksHubFilters>): string {
		return buildPlaybooksHubNavigationUrl(current, overrides);
	}

	applyClientFilters(
		playbooks: StackCardViewModel[],
		filters: StacksHubFilters,
		tagFilterVm?: ExtensionsTagFilterViewModel
	): StackCardViewModel[] {
		return this.getListingPresenter.filterAndSortStacks(playbooks, filters, tagFilterVm);
	}

	async loadPlaybooksHubStateless(params: {
		fetch?: typeof globalThis.fetch;
		limit?: number;
	}): Promise<StacksHubViewModel> {
		return this.getListingPresenter.loadStacksHubStateless(params);
	}

	async loadPublishedPlaybooksStateless(params: {
		fetch?: typeof globalThis.fetch;
		limit?: number;
		searchTerm?: string | null;
	}): Promise<{ playbooks: StackCardViewModel[]; count: number }> {
		const result = await this.getListingPresenter.loadPublishedStacksVm({
			limit: params.limit ?? 50,
			fetch: params.fetch,
			searchTerm: params.searchTerm
		});
		return { playbooks: result.stacks, count: result.count };
	}

	async loadBookmarkedIdsMap(fetch?: typeof globalThis.fetch): Promise<Record<string, boolean>> {
		const listings = await this.listingRepository.getMyBookmarks(fetch);
		return Object.fromEntries(listings.map((listing) => [listing.id, true]));
	}

	async toggleBookmark(
		listingId: string,
		nextBookmarked: boolean,
		_listingKind: ListingBookmarkKind = 'stack'
	): Promise<ListingBookmarkToggleResultViewModel> {
		const resultPm = nextBookmarked
			? await this.listingRepository.addBookmark(listingId)
			: await this.listingRepository.removeBookmark(listingId);
		if (!resultPm.ok) return { ok: false, error: resultPm.error };
		return { ok: true, bookmarked: nextBookmarked };
	}
}

export class PublicPlaybookBySlugPagePresenter {
	public submittingLike = $state(false);
	public submittingComment = $state(false);
	public submittingRating = $state(false);
	public submittingBookmark = $state(false);

	constructor(
		private readonly getListingPresenter: GetListingPresenter,
		private readonly listingRepository: ListingRepository
	) {}

	async loadPlaybookBySlugStateless(params: {
		slug: string;
		userSlug?: string;
		fetch?: typeof globalThis.fetch;
	}): Promise<StackDetailViewModel | null> {
		const playbookVm = await this.getListingPresenter.loadPublishedStackBySlugVm(params.slug, params.fetch);
		if (!playbookVm) return null;

		const ownerUsername = playbookVm.owner?.username?.trim() ?? '';
		const requestedUserSlug = params.userSlug?.trim() ?? '';
		if (requestedUserSlug) {
			if (!ownerUsername || ownerUsername !== requestedUserSlug) {
				return null;
			}
		}

		return playbookVm;
	}

	async trackPlaybookView(listingId: string): Promise<PublicListingDetailMutationResultViewModel> {
		const resultPm = await this.listingRepository.trackView(listingId);
		return mutationPmToVm(resultPm);
	}

	async trackPlaybookLike(listingId: string): Promise<PublicListingDetailMutationResultViewModel> {
		this.submittingLike = true;
		try {
			const resultPm = await this.listingRepository.incrementLikes(listingId);
			return mutationPmToVm(resultPm);
		} finally {
			this.submittingLike = false;
		}
	}

	async loadListingCommentsStateless(params: {
		listingId: string;
		fetch?: typeof globalThis.fetch;
	}): Promise<ListingCommentViewModel[]> {
		return this.getListingPresenter.loadListingCommentsVm(params.listingId, params.fetch);
	}

	async submitListingComment(params: {
		listingId: string;
		content: string;
		parentId: string | null;
	}): Promise<PublicListingDetailMutationResultViewModel> {
		this.submittingComment = true;
		try {
			const resultPm = await this.listingRepository.createListingComment({
				listingId: params.listingId,
				content: params.content,
				parentId: params.parentId
			});
			return mutationPmToVm(resultPm);
		} finally {
			this.submittingComment = false;
		}
	}

	async submitListingRating(
		listingId: string,
		rating: number
	): Promise<PublicListingDetailMutationResultViewModel> {
		this.submittingRating = true;
		try {
			const resultPm = await this.listingRepository.upsertListingRating(listingId, rating);
			return mutationPmToVm(resultPm);
		} finally {
			this.submittingRating = false;
		}
	}

	async toggleBookmark(
		listingId: string,
		nextBookmarked: boolean
	): Promise<PublicListingDetailMutationResultViewModel & { bookmarked?: boolean }> {
		this.submittingBookmark = true;
		try {
			const resultPm = nextBookmarked
				? await this.listingRepository.addBookmark(listingId)
				: await this.listingRepository.removeBookmark(listingId);
			const resultVm = mutationPmToVm(resultPm);
			if (resultVm.ok) {
				return { ...resultVm, bookmarked: nextBookmarked };
			}
			return resultVm;
		} finally {
			this.submittingBookmark = false;
		}
	}
}

export type { ExtensionDetailViewModel };
