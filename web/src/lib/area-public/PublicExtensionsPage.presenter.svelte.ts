import type {
	ExtensionCardViewModel,
	ExtensionCategoryViewModel,
	ExtensionsHubStatsViewModel,
	ExtensionsHubViewModel,
	ExtensionsTagFilterViewModel,
	GetListingPresenter,
	ListingBookmarkKind,
	ListingBookmarkToggleResultViewModel
} from '$lib/listings/GetListing.presenter.svelte';
import type { ExtensionsHubFilters } from '$lib/listings/listing.types';
import type { ListingRepository } from '$lib/listings/Listing.repository.svelte';

import { buildExtensionsHubNavigationUrl, parseExtensionsHubQueryFiltersFromUrl } from '$lib/listings/utils/buildExtensionsHubNavigationUrl';

export type {
	ExtensionCardViewModel,
	ExtensionCategoryViewModel,
	ExtensionsHubStatsViewModel,
	ExtensionsHubViewModel
};


export class PublicExtensionsPagePresenter {
	public hubVm: ExtensionsHubViewModel | null = $state(null);
	public filtersVm: ExtensionsHubFilters = $state({ type: 'all', sort: 'newest' });
	public filteredExtensionsVm: ExtensionCardViewModel[] = $state([]);
	public statsVm: ExtensionsHubStatsViewModel = $state({
		official: 0,
		community: 0,
		categories: 0
	});

	constructor(
		private readonly getListingPresenter: GetListingPresenter,
		private readonly listingRepository: ListingRepository
	) {}

	parseFiltersFromUrl(searchParams: URLSearchParams): ExtensionsHubFilters {
		return parseExtensionsHubQueryFiltersFromUrl(searchParams);
	}

	buildFilterUrl(
		current: ExtensionsHubFilters,
		overrides: Partial<ExtensionsHubFilters>
	): string {
		return buildExtensionsHubNavigationUrl(current, overrides);
	}

	applyClientFilters(
		extensions: ExtensionCardViewModel[],
		filters: ExtensionsHubFilters,
		tagFilterVm?: ExtensionsTagFilterViewModel
	): ExtensionCardViewModel[] {
		return this.getListingPresenter.filterAndSortExtensions(extensions, filters, tagFilterVm);
	}

	/** Stateless — safe for `+page.server.ts` (SSR). */
	async loadExtensionsHubStateless(params: {
		fetch?: typeof globalThis.fetch;
		limit?: number;
	}): Promise<ExtensionsHubViewModel> {
		return this.getListingPresenter.loadExtensionsHubStateless(params);
	}

	/** Stateful — assigns hub, filters, filtered list, and stats. */
	syncHubFromLoad(params: {
		hub: ExtensionsHubViewModel;
		filters: ExtensionsHubFilters;
	}): void {
		this.hubVm = params.hub;
		this.filtersVm = params.filters;
		this.filteredExtensionsVm = this.applyClientFilters(params.hub.extensions, params.filters);
		this.statsVm = this.getListingPresenter.computeHubStats(
			params.hub.extensions,
			params.hub.categories
		);
	}

	/** Update filters and recompute filtered extensions (client-side). */
	updateFilters(overrides: Partial<ExtensionsHubFilters>): string {
		const nextFilters: ExtensionsHubFilters = { ...this.filtersVm, ...overrides };
		this.filtersVm = nextFilters;
		if (this.hubVm) {
			this.filteredExtensionsVm = this.applyClientFilters(this.hubVm.extensions, nextFilters);
		}
		return this.buildFilterUrl(nextFilters, {});
	}

	async loadBookmarkedIdsMap(fetch?: typeof globalThis.fetch): Promise<Record<string, boolean>> {
		const listings = await this.listingRepository.getMyBookmarks(fetch);
		return Object.fromEntries(listings.map((listing) => [listing.id, true]));
	}

	async toggleBookmark(
		listingId: string,
		nextBookmarked: boolean,
		_listingKind: ListingBookmarkKind = 'extension'
	): Promise<ListingBookmarkToggleResultViewModel> {
		const resultPm = nextBookmarked
			? await this.listingRepository.addBookmark(listingId)
			: await this.listingRepository.removeBookmark(listingId);
		if (!resultPm.ok) return { ok: false, error: resultPm.error };
		return { ok: true, bookmarked: nextBookmarked };
	}
}
