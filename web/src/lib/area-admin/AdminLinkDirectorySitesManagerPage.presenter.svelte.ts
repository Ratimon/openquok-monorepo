import type { LinkDirectoryRepository } from '$lib/link-directory/LinkDirectory.repository';
import type { LinkDirectorySiteDto } from '$lib/link-directory/link-directory.types';

export class AdminLinkDirectorySitesManagerPagePresenter {
	public allSitesToManageVm: LinkDirectorySiteDto[] = $state([]);
	public loading = $state(false);
	public refreshingCatalogDr = $state(false);
	public showToastMessage = $state(false);
	public toastMessage = $state('');

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

	public async refreshCatalogDomainRatings(
		options: { force?: boolean; publishedOnly?: boolean } = {},
		fetch?: typeof globalThis.fetch
	): Promise<void> {
		this.refreshingCatalogDr = true;
		try {
			const result = await this.linkDirectoryRepository.refreshCatalogDomainRatings(
				{
					force: options.force ?? true,
					publishedOnly: options.publishedOnly ?? true
				},
				fetch
			);
			if (!result.ok || !result.data) {
				this.toastMessage = result.error ?? 'Failed to refresh catalog DR.';
				this.showToastMessage = true;
				return;
			}
			const { updated, skipped, failed, attempted, providerConfigured } = result.data;
			if (!providerConfigured) {
				this.toastMessage =
					'DataForSEO is not configured on the API. Set DATAFORSEO_API_KEY and enable directory SEO.';
			} else {
				this.toastMessage = `Catalog DR refresh done: ${updated} updated, ${skipped} skipped, ${failed} failed (${attempted} sites).`;
			}
			this.showToastMessage = true;
			await this.loadAllSites(fetch);
		} finally {
			this.refreshingCatalogDr = false;
		}
	}
}
