import type {
	ListingRepository,
	ListingTagGroupProgrammerModel
} from '$lib/listings/Listing.repository.svelte';
import type { ListingTagViewModel } from '$lib/listings/GetListing.presenter.svelte';
import type { CatalogListingTagDraftViewModel } from '$lib/listings/utils/catalogListingTags';
import { filterMissingCatalogListingTags } from '$lib/listings/utils/catalogListingTags';

export class AdminListingTagsManagerPagePresenter {
	public allTagsToManageVm: ListingTagViewModel[] = $state([]);
	public allTagGroupsToManageVm: ListingTagGroupProgrammerModel[] = $state([]);
	public loading = $state(false);

	constructor(private readonly listingRepository: ListingRepository) {}

	public async loadAllTags(fetch?: typeof globalThis.fetch): Promise<ListingTagViewModel[]> {
		this.loading = true;
		try {
			const [tags, groups] = await Promise.all([
				this.listingRepository.getAllTags(fetch),
				this.listingRepository.getAllTagGroups(fetch)
			]);
			this.allTagsToManageVm = [...tags].sort((a, b) => a.name.localeCompare(b.name));
			this.allTagGroupsToManageVm = [...groups].sort((a, b) => a.name.localeCompare(b.name));
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

	public addListingTagGroup(vm: ListingTagGroupProgrammerModel): void {
		this.allTagGroupsToManageVm = [...this.allTagGroupsToManageVm, vm].sort((a, b) =>
			a.name.localeCompare(b.name)
		);
	}

	public updateListingTagGroup(vm: ListingTagGroupProgrammerModel): void {
		const existingIndex = this.allTagGroupsToManageVm.findIndex((g) => g.id === vm.id);
		if (existingIndex < 0) {
			this.addListingTagGroup(vm);
			return;
		}
		this.allTagGroupsToManageVm = [
			...this.allTagGroupsToManageVm.slice(0, existingIndex),
			vm,
			...this.allTagGroupsToManageVm.slice(existingIndex + 1)
		].sort((a, b) => a.name.localeCompare(b.name));

		this.allTagsToManageVm = this.allTagsToManageVm.map((tag) => ({
			...tag,
			tagGroups: tag.tagGroups.map((group) =>
				group.id === vm.id ? { id: vm.id, name: vm.name } : group
			)
		}));
	}

	public removeListingTagGroup(tagGroupId: string): void {
		this.allTagGroupsToManageVm = this.allTagGroupsToManageVm.filter((g) => g.id !== tagGroupId);
		this.allTagsToManageVm = this.allTagsToManageVm.map((tag) => ({
			...tag,
			tagGroups: tag.tagGroups.filter((group) => group.id !== tagGroupId)
		}));
	}

	public listMissingCatalogTagsVm(): CatalogListingTagDraftViewModel[] {
		return filterMissingCatalogListingTags(this.allTagsToManageVm);
	}
}
