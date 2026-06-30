import type { ExtensionCardViewModel } from '$lib/listings/GetListing.presenter.svelte';
import type { GetListingPresenter } from '$lib/listings/GetListing.presenter.svelte';
import type { ListingRepository, ListingUpsertProgrammerModel } from '$lib/listings/Listing.repository.svelte';
import type { GetBillingPresenter } from '$lib/billing/GetBilling.presenter.svelte';

import { isPaidSubscriptionTier } from 'openquok-common';

export type AccountExtensionsBookmarkMutationViewModel =
	| { ok: true; bookmarked: boolean }
	| { ok: false; error: string };

function mutationPmToVm(
	pm: ListingUpsertProgrammerModel,
	bookmarked: boolean
): AccountExtensionsBookmarkMutationViewModel {
	if (!pm.ok) return { ok: false, error: pm.error };
	return { ok: true, bookmarked };
}

export class ProtectedAccountExtensionsPagePresenter {
	public extensionsVm: ExtensionCardViewModel[] = $state([]);
	public loading = $state(false);
	public bookmarksPaidEnabled = $state<boolean | null>(null);
	public togglingBookmarkId = $state<string | null>(null);

	constructor(
		private readonly getListingPresenter: GetListingPresenter,
		private readonly listingRepository: ListingRepository,
		private readonly getBillingPresenter: GetBillingPresenter
	) {}

	get bookmarkCount(): number {
		return this.extensionsVm.length;
	}

	get lastUpdatedLabel(): string | null {
		if (!this.extensionsVm.length) return null;
		const latest = this.extensionsVm.reduce((max, row) =>
			row.createdAt > max ? row.createdAt : max
		, this.extensionsVm[0].createdAt);
		return latest;
	}

	isBookmarked(listingId: string): boolean {
		return this.extensionsVm.some((row) => row.id === listingId);
	}

	async loadBillingGateStateless(): Promise<boolean> {
		const vm = await this.getBillingPresenter.loadOwnedAccountBillingVmStateless();
		const paid = vm ? isPaidSubscriptionTier(vm.tier) : false;
		this.bookmarksPaidEnabled = paid;
		return paid;
	}

	async loadBookmarks(): Promise<void> {
		if (this.bookmarksPaidEnabled !== true) return;
		this.loading = true;
		try {
			const listings = await this.listingRepository.getMyBookmarks();
			this.extensionsVm = listings.map((listing) =>
				this.getListingPresenter.toExtensionCardVmStateless(listing)
			);
		} finally {
			this.loading = false;
		}
	}

	async toggleBookmark(listingId: string, bookmarked: boolean): Promise<AccountExtensionsBookmarkMutationViewModel> {
		this.togglingBookmarkId = listingId;
		try {
			const resultPm = bookmarked
				? await this.listingRepository.addBookmark(listingId)
				: await this.listingRepository.removeBookmark(listingId);
			const resultVm = mutationPmToVm(resultPm, bookmarked);
			if (resultVm.ok) {
				if (bookmarked) {
					const existing = this.extensionsVm.find((row) => row.id === listingId);
					if (!existing) {
						await this.loadBookmarks();
					}
				} else {
					this.extensionsVm = this.extensionsVm.filter((row) => row.id !== listingId);
				}
			}
			return resultVm;
		} finally {
			this.togglingBookmarkId = null;
		}
	}
}
