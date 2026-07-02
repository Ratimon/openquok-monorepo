import type { ListingRepository } from '$lib/listings/Listing.repository.svelte';
import type { ListingCategoryViewModel } from '$lib/listings/GetListing.presenter.svelte';
import { sortCategories } from '$lib/listings/utils/listingCategories';

export class AdminListingCategoriesManagerPagePresenter {
	public allCategoriesToManageVm: ListingCategoryViewModel[] = $state([]);
	public loading = $state(false);

	constructor(private readonly listingRepository: ListingRepository) {}

	public async loadAllCategories(fetch?: typeof globalThis.fetch): Promise<ListingCategoryViewModel[]> {
		this.loading = true;
		try {
			const categories = await this.listingRepository.getAllCategories(fetch);
			this.allCategoriesToManageVm = sortCategories(categories);
			return this.allCategoriesToManageVm;
		} finally {
			this.loading = false;
		}
	}

	public addListingCategory(vm: ListingCategoryViewModel): void {
		this.allCategoriesToManageVm = sortCategories([...this.allCategoriesToManageVm, vm]);
	}

	public updateListingCategory(vm: ListingCategoryViewModel): void {
		const existingIndex = this.allCategoriesToManageVm.findIndex((c) => c.id === vm.id);
		if (existingIndex < 0) {
			this.addListingCategory(vm);
			return;
		}
		this.allCategoriesToManageVm = sortCategories([
			...this.allCategoriesToManageVm.slice(0, existingIndex),
			vm,
			...this.allCategoriesToManageVm.slice(existingIndex + 1)
		]);
	}

	public removeListingCategory(categoryId: string): void {
		this.allCategoriesToManageVm = this.allCategoriesToManageVm.filter((c) => c.id !== categoryId);
	}
}
