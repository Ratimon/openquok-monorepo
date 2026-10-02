import type { LinkDirectoryRepository } from '$lib/link-directory/LinkDirectory.repository';
import type { LinkDirectoryCategoryDto } from '$lib/link-directory/link-directory.types';

export class AdminLinkDirectoryCategoriesManagerPagePresenter {
	public allCategoriesToManageVm: LinkDirectoryCategoryDto[] = $state([]);
	public loading = $state(false);

	constructor(private readonly linkDirectoryRepository: LinkDirectoryRepository) {}

	public async loadAllCategories(fetch?: typeof globalThis.fetch): Promise<LinkDirectoryCategoryDto[]> {
		this.loading = true;
		try {
			const categories = await this.linkDirectoryRepository.getAllCategories(fetch);
			this.allCategoriesToManageVm = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
			return this.allCategoriesToManageVm;
		} finally {
			this.loading = false;
		}
	}

	public addCategory(vm: LinkDirectoryCategoryDto): void {
		this.allCategoriesToManageVm = [...this.allCategoriesToManageVm, vm].sort(
			(a, b) => a.sortOrder - b.sortOrder
		);
	}

	public updateCategory(vm: LinkDirectoryCategoryDto): void {
		const index = this.allCategoriesToManageVm.findIndex((c) => c.id === vm.id);
		if (index < 0) {
			this.addCategory(vm);
			return;
		}
		this.allCategoriesToManageVm = [
			...this.allCategoriesToManageVm.slice(0, index),
			vm,
			...this.allCategoriesToManageVm.slice(index + 1)
		].sort((a, b) => a.sortOrder - b.sortOrder);
	}

	public removeCategory(categoryId: string): void {
		this.allCategoriesToManageVm = this.allCategoriesToManageVm.filter((c) => c.id !== categoryId);
	}
}
