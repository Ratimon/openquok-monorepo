import type { ListingRepository } from '$lib/listings/Listing.repository.svelte';
import type { ListingTagViewModel } from '$lib/listings/GetListing.presenter.svelte';

export class AdminListingTagsManagerPagePresenter {
	public allTagsToManageVm: ListingTagViewModel[] = $state([]);
	public loading = $state(false);

	constructor(private readonly listingRepository: ListingRepository) {}

	public async loadAllTags(fetch?: typeof globalThis.fetch): Promise<ListingTagViewModel[]> {
		this.loading = true;
		try {
			const tags = await this.listingRepository.getAllTags(fetch);
			this.allTagsToManageVm = [...tags].sort((a, b) => a.name.localeCompare(b.name));
			return this.allTagsToManageVm;
		} finally {
			this.loading = false;
		}
	}

	public addListingTag(vm: ListingTagViewModel): void {
		this.allTagsToManageVm = [...this.allTagsToManageVm, vm].sort((a, b) => a.name.localeCompare(b.name));
	}

	public updateListingTag(vm: ListingTagViewModel): void {
		const existingIndex = this.allTagsToManageVm.findIndex((t) => t.id === vm.id);
		if (existingIndex < 0) {
			this.addListingTag(vm);
			return;
		}
		this.allTagsToManageVm = [
			...this.allTagsToManageVm.slice(0, existingIndex),
			vm,
			...this.allTagsToManageVm.slice(existingIndex + 1)
		].sort((a, b) => a.name.localeCompare(b.name));
	}

	public removeListingTag(tagId: string): void {
		this.allTagsToManageVm = this.allTagsToManageVm.filter((t) => t.id !== tagId);
	}
}
