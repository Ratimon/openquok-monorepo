import type { LinkDirectoryRepository } from '$lib/link-directory/LinkDirectory.repository';
import type {
	LinkDirectoryCategoryDto,
	LinkDirectoryOpportunityDto,
	LinkDirectoryOpportunityTypeDto,
	LinkDirectorySiteDto,
	LinkDirectoryTagDto
} from '$lib/link-directory/link-directory.types';

export class AdminLinkDirectorySiteEditorPagePresenter {
	public siteVm: LinkDirectorySiteDto | null = $state(null);
	public categoriesVm: LinkDirectoryCategoryDto[] = $state([]);
	public tagsVm: LinkDirectoryTagDto[] = $state([]);
	public opportunityTypesVm: LinkDirectoryOpportunityTypeDto[] = $state([]);
	public loading = $state(false);
	public saving = $state(false);

	constructor(private readonly linkDirectoryRepository: LinkDirectoryRepository) {}

	public async loadEditor(siteId: string, fetch?: typeof globalThis.fetch): Promise<void> {
		this.loading = true;
		try {
			const [site, categories, tags, types] = await Promise.all([
				this.linkDirectoryRepository.getSiteById(siteId, fetch),
				this.linkDirectoryRepository.getAllCategories(fetch),
				this.linkDirectoryRepository.getAllTags(fetch),
				this.linkDirectoryRepository.getOpportunityTypes(fetch)
			]);
			this.siteVm = site;
			this.categoriesVm = categories;
			this.tagsVm = tags;
			this.opportunityTypesVm = types;
		} finally {
			this.loading = false;
		}
	}

	public async loadNewEditor(fetch?: typeof globalThis.fetch): Promise<void> {
		this.loading = true;
		try {
			this.siteVm = null;
			const [categories, tags, types] = await Promise.all([
				this.linkDirectoryRepository.getAllCategories(fetch),
				this.linkDirectoryRepository.getAllTags(fetch),
				this.linkDirectoryRepository.getOpportunityTypes(fetch)
			]);
			this.categoriesVm = categories;
			this.tagsVm = tags;
			this.opportunityTypesVm = types;
		} finally {
			this.loading = false;
		}
	}

	public setSiteVm(site: LinkDirectorySiteDto): void {
		this.siteVm = site;
	}

	public replaceOpportunity(opportunity: LinkDirectoryOpportunityDto): void {
		if (!this.siteVm) return;
		const index = this.siteVm.opportunities.findIndex((o) => o.id === opportunity.id);
		const opportunities =
			index < 0
				? [...this.siteVm.opportunities, opportunity]
				: [
						...this.siteVm.opportunities.slice(0, index),
						opportunity,
						...this.siteVm.opportunities.slice(index + 1)
					];
		this.siteVm = { ...this.siteVm, opportunities };
	}

	public removeOpportunity(opportunityId: string): void {
		if (!this.siteVm) return;
		this.siteVm = {
			...this.siteVm,
			opportunities: this.siteVm.opportunities.filter((o) => o.id !== opportunityId)
		};
	}
}
