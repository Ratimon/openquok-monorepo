import type {
	ExtensionDetailViewModel,
	ExtensionsTagFilterViewModel,
	GetListingPresenter,
	ListingBookmarkKind,
	ListingBookmarkToggleResultViewModel,
	StackCardViewModel,
	StackDetailViewModel,
	StacksHubViewModel
} from '$lib/listings/GetListing.presenter.svelte';
import type { StacksHubFilters } from '$lib/listings/listing.types';
import type { ListingRepository } from '$lib/listings/Listing.repository.svelte';

import {
	buildPlaybooksHubNavigationUrl,
	parsePlaybooksHubQueryFiltersFromUrl
} from '$lib/listings/utils/buildPlaybooksHubNavigationUrl';

export type { StackCardViewModel, StacksHubViewModel };

export class PublicStacksPagePresenter {
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
		stacks: StackCardViewModel[],
		filters: StacksHubFilters,
		tagFilterVm?: ExtensionsTagFilterViewModel
	): StackCardViewModel[] {
		return this.getListingPresenter.filterAndSortStacks(stacks, filters, tagFilterVm);
	}

	async loadStacksHubStateless(params: {
		fetch?: typeof globalThis.fetch;
		limit?: number;
	}): Promise<StacksHubViewModel> {
		return this.getListingPresenter.loadStacksHubStateless(params);
	}

	async loadPublishedStacksStateless(params: {
		fetch?: typeof globalThis.fetch;
		limit?: number;
		searchTerm?: string | null;
	}): Promise<{ stacks: StackCardViewModel[]; count: number }> {
		return this.getListingPresenter.loadPublishedStacksVm({
			limit: params.limit ?? 50,
			fetch: params.fetch,
			searchTerm: params.searchTerm
		});
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

export class PublicStackBySlugPagePresenter {
	constructor(private readonly getListingPresenter: GetListingPresenter) {}

	async loadStackBySlugStateless(params: {
		slug: string;
		userSlug?: string;
		fetch?: typeof globalThis.fetch;
	}): Promise<StackDetailViewModel | null> {
		const stackVm = await this.getListingPresenter.loadPublishedStackBySlugVm(params.slug, params.fetch);
		if (!stackVm) return null;

		const ownerUsername = stackVm.owner?.username?.trim() ?? '';
		const requestedUserSlug = params.userSlug?.trim() ?? '';
		if (requestedUserSlug) {
			if (!ownerUsername || ownerUsername !== requestedUserSlug) {
				return null;
			}
		}

		return stackVm;
	}
}

export type { ExtensionDetailViewModel };
