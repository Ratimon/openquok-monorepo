import type { GetListingPresenter } from '$lib/listings/GetListing.presenter.svelte';
import type { ListingViewModel } from '$lib/listings/GetListing.presenter.svelte';

export class AdminListingStacksManagerPagePresenter {
	public allListingsToManageVm: ListingViewModel[] = $state([]);
	public loading = $state(false);

	constructor(private readonly getListingPresenter: GetListingPresenter) {}

	public async loadAllListings(fetch?: typeof globalThis.fetch): Promise<ListingViewModel[]> {
		this.loading = true;
		try {
			const listings = await this.getListingPresenter.loadAdminListings('stack', fetch);
			this.allListingsToManageVm = listings;
			return this.allListingsToManageVm;
		} finally {
			this.loading = false;
		}
	}

	public removeListing(listingId: string): void {
		this.allListingsToManageVm = this.allListingsToManageVm.filter((l) => l.id !== listingId);
	}
}
