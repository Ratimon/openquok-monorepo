import type {
	ExtensionCardViewModel,
	ExtensionCategoryViewModel,
	ExtensionsHubStatsViewModel,
	ExtensionsHubViewModel,
	GetListingPresenter
} from '$lib/listings/GetListing.presenter.svelte';
import type { ExtensionsHubFilters } from '$lib/listings/listing.types';

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
		total: 0,
		official: 0,
		skills: 0,
		mcp: 0,
		both: 0
	});

	constructor(private readonly getListingPresenter: GetListingPresenter) {}

	parseFiltersFromUrl(searchParams: URLSearchParams): ExtensionsHubFilters {
		return this.getListingPresenter.parseHubFiltersFromUrl(searchParams);
	}

	buildFilterUrl(
		pathname: string,
		current: ExtensionsHubFilters,
		overrides: Partial<ExtensionsHubFilters>
	): string {
		return this.getListingPresenter.buildHubFilterUrl(pathname, current, overrides);
	}

	applyClientFilters(
		extensions: ExtensionCardViewModel[],
		filters: ExtensionsHubFilters
	): ExtensionCardViewModel[] {
		return this.getListingPresenter.filterAndSortExtensions(extensions, filters);
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
		this.statsVm = this.getListingPresenter.computeHubStats(params.hub.extensions);
	}

	/** Update filters and recompute filtered extensions (client-side). */
	updateFilters(pathname: string, overrides: Partial<ExtensionsHubFilters>): string {
		const nextFilters: ExtensionsHubFilters = { ...this.filtersVm, ...overrides };
		this.filtersVm = nextFilters;
		if (this.hubVm) {
			this.filteredExtensionsVm = this.applyClientFilters(this.hubVm.extensions, nextFilters);
		}
		return this.buildFilterUrl(pathname, nextFilters, {});
	}
}
