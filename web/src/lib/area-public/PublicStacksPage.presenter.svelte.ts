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
import type { ListingRepository, ListingUpsertProgrammerModel } from '$lib/listings/Listing.repository.svelte';

export type PublicStackMutationResultViewModel =
	| { ok: true; id?: string }
	| { ok: false; error: string };

export type { StackCardViewModel, StacksHubViewModel };

function mutationPmToVm(pm: ListingUpsertProgrammerModel): PublicStackMutationResultViewModel {
	if (!pm.ok) return { ok: false, error: pm.error };
	return pm.id !== undefined ? { ok: true, id: pm.id } : { ok: true };
}

export class PublicStacksPagePresenter {
	constructor(
		private readonly getListingPresenter: GetListingPresenter,
		private readonly listingRepository: ListingRepository
	) {}

	parseFiltersFromUrl(searchParams: URLSearchParams): StacksHubFilters {
		return this.getListingPresenter.parseStacksHubFiltersFromUrl(searchParams);
	}

	buildFilterUrl(
		pathname: string,
		current: StacksHubFilters,
		overrides: Partial<StacksHubFilters>
	): string {
		return this.getListingPresenter.buildStacksHubFilterUrl(pathname, current, overrides);
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
	public submittingClone = $state(false);

	constructor(
		private readonly getListingPresenter: GetListingPresenter,
		private readonly listingRepository: ListingRepository
	) {}

	async loadStackBySlugStateless(params: {
		slug: string;
		fetch?: typeof globalThis.fetch;
	}): Promise<StackDetailViewModel | null> {
		return this.getListingPresenter.loadPublishedStackBySlugVm(params.slug, params.fetch);
	}

	async cloneStack(stackId: string): Promise<PublicStackMutationResultViewModel> {
		this.submittingClone = true;
		try {
			const resultPm = await this.listingRepository.cloneStack(stackId);
			return mutationPmToVm(resultPm);
		} finally {
			this.submittingClone = false;
		}
	}
}

export type { ExtensionDetailViewModel };
