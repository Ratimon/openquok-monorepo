import type {
	ExtensionDetailViewModel,
	GetListingPresenter,
	ListingBookmarkKind,
	ListingBookmarkToggleResultViewModel,
	StackCardViewModel,
	StackDetailViewModel
} from '$lib/listings/GetListing.presenter.svelte';
import type { ListingRepository, ListingUpsertProgrammerModel } from '$lib/listings/Listing.repository.svelte';

export type PublicStackMutationResultViewModel =
	| { ok: true; id?: string }
	| { ok: false; error: string };

function mutationPmToVm(pm: ListingUpsertProgrammerModel): PublicStackMutationResultViewModel {
	if (!pm.ok) return { ok: false, error: pm.error };
	return pm.id !== undefined ? { ok: true, id: pm.id } : { ok: true };
}

export class PublicStacksPagePresenter {
	constructor(
		private readonly getListingPresenter: GetListingPresenter,
		private readonly listingRepository: ListingRepository
	) {}

	async loadStacksHubStateless(params: {
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
