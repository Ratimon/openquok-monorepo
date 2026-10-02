import type { LinkDirectoryRepository } from '$lib/link-directory/LinkDirectory.repository';
import type { LinkDirectoryTagGroupDto } from '$lib/link-directory/link-directory-admin.types';
import type { LinkDirectoryTagDto } from '$lib/link-directory/link-directory.types';

export class AdminLinkDirectoryTagsManagerPagePresenter {
	public allTagsToManageVm: LinkDirectoryTagDto[] = $state([]);
	public allTagGroupsToManageVm: LinkDirectoryTagGroupDto[] = $state([]);
	public loading = $state(false);

	constructor(private readonly linkDirectoryRepository: LinkDirectoryRepository) {}

	public async loadAllTags(fetch?: typeof globalThis.fetch): Promise<LinkDirectoryTagDto[]> {
		this.loading = true;
		try {
			const [tags, groups] = await Promise.all([
				this.linkDirectoryRepository.getAllTags(fetch),
				this.linkDirectoryRepository.getAllTagGroups(fetch)
			]);
			this.allTagsToManageVm = [...tags].sort((a, b) => a.name.localeCompare(b.name));
			this.allTagGroupsToManageVm = [...groups].sort((a, b) => a.name.localeCompare(b.name));
			return this.allTagsToManageVm;
		} finally {
			this.loading = false;
		}
	}

	public addTag(vm: LinkDirectoryTagDto): void {
		this.allTagsToManageVm = [...this.allTagsToManageVm, vm].sort((a, b) => a.name.localeCompare(b.name));
	}

	public updateTag(vm: LinkDirectoryTagDto): void {
		const index = this.allTagsToManageVm.findIndex((t) => t.id === vm.id);
		if (index < 0) {
			this.addTag(vm);
			return;
		}
		this.allTagsToManageVm = [
			...this.allTagsToManageVm.slice(0, index),
			vm,
			...this.allTagsToManageVm.slice(index + 1)
		].sort((a, b) => a.name.localeCompare(b.name));
	}

	public removeTag(tagId: string): void {
		this.allTagsToManageVm = this.allTagsToManageVm.filter((t) => t.id !== tagId);
	}

	public addTagGroup(vm: LinkDirectoryTagGroupDto): void {
		this.allTagGroupsToManageVm = [...this.allTagGroupsToManageVm, vm].sort((a, b) =>
			a.name.localeCompare(b.name)
		);
	}

	public updateTagGroup(vm: LinkDirectoryTagGroupDto): void {
		const index = this.allTagGroupsToManageVm.findIndex((g) => g.id === vm.id);
		if (index < 0) {
			this.addTagGroup(vm);
			return;
		}
		this.allTagGroupsToManageVm = [
			...this.allTagGroupsToManageVm.slice(0, index),
			vm,
			...this.allTagGroupsToManageVm.slice(index + 1)
		].sort((a, b) => a.name.localeCompare(b.name));
	}

	public removeTagGroup(tagGroupId: string): void {
		this.allTagGroupsToManageVm = this.allTagGroupsToManageVm.filter((g) => g.id !== tagGroupId);
	}
}
