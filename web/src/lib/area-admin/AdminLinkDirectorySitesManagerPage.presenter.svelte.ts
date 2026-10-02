import type { LinkDirectoryRepository } from '$lib/link-directory/LinkDirectory.repository';
import type { LinkDirectorySiteDto } from '$lib/link-directory/link-directory.types';

export class AdminLinkDirectorySitesManagerPagePresenter {
	public allSitesToManageVm: LinkDirectorySiteDto[] = $state([]);
	public loading = $state(false);

	constructor(private readonly linkDirectoryRepository: LinkDirectoryRepository) {}

	public async loadAllSites(fetch?: typeof globalThis.fetch): Promise<LinkDirectorySiteDto[]> {
		this.loading = true;
		try {
			const { sites } = await this.linkDirectoryRepository.getAdminSites({ limit: 500 }, fetch);
			this.allSitesToManageVm = [...sites].sort((a, b) => (b.domainRating ?? 0) - (a.domainRating ?? 0));
			return this.allSitesToManageVm;
		} finally {
			this.loading = false;
		}
	}

	public removeSite(siteId: string): void {
		this.allSitesToManageVm = this.allSitesToManageVm.filter((s) => s.id !== siteId);
	}
}
