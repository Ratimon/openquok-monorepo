import type { GetListingPresenter } from '$lib/listings/GetListing.presenter.svelte';
import type { ListingRepository } from '$lib/listings/Listing.repository.svelte';

import type { ListingViewModel } from '$lib/listings/GetListing.presenter.svelte';

export class UserListingsManagerPagePresenter {
	public allListingsToManageVm: ListingViewModel[] = $state([]);
	public loading = $state(false);

	constructor(
		private readonly getListingPresenter: GetListingPresenter,
		private readonly listingRepository: ListingRepository
	) {}

	async loadAllListings(listingKind: 'extension' | 'stack', fetch?: typeof globalThis.fetch): Promise<void> {
		this.loading = true;
		try {
			this.allListingsToManageVm = await this.getListingPresenter.loadMyListings(listingKind, fetch);
		} finally {
			this.loading = false;
		}
	}

	removeListing(listingId: string): void {
		this.allListingsToManageVm = this.allListingsToManageVm.filter((listing) => listing.id !== listingId);
	}

	async deleteListing(listingId: string, fetch?: typeof globalThis.fetch): Promise<{ ok: boolean; error?: string }> {
		const result = await this.listingRepository.deleteMyListing(listingId, fetch);
		if (result.ok) {
			this.removeListing(listingId);
			return { ok: true };
		}
		return { ok: false, error: result.error };
	}
}
