import type { LinkDirectoryRepository } from '$lib/link-directory/LinkDirectory.repository';
import type {
	LinkDirectoryCategoryDto,
	LinkDirectoryOpportunityDto,
	LinkDirectoryOpportunityTypeDto,
	LinkDirectorySiteDto,
	LinkDirectoryTagDto
} from '$lib/link-directory/link-directory.types';
import { apiErrorHttpStatus, userFacingApiErrorMessage } from '$lib/core/HttpGateway';

function settledValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
	return result.status === 'fulfilled' ? result.value : fallback;
}

function settledErrorMessage(result: PromiseSettledResult<unknown>, fallback: string): string | null {
	if (result.status === 'fulfilled') return null;
	return userFacingApiErrorMessage(result.reason, fallback);
}

export class AdminLinkDirectorySiteEditorPagePresenter {
	public siteVm: LinkDirectorySiteDto | null = $state(null);
	public categoriesVm: LinkDirectoryCategoryDto[] = $state([]);
	public tagsVm: LinkDirectoryTagDto[] = $state([]);
	public opportunityTypesVm: LinkDirectoryOpportunityTypeDto[] = $state([]);
	public loading = $state(false);
	public saving = $state(false);
	/** True when the site GET threw (network, 429, 5xx) — not a missing row. */
	public siteLoadFailed = $state(false);
	public showToastMessage = $state(false);
	public toastMessage = $state('');
	public toastIsError = $state(false);

	constructor(private readonly linkDirectoryRepository: LinkDirectoryRepository) {}

	private pushToast(message: string, isError: boolean): void {
		this.toastMessage = message;
		this.toastIsError = isError;
		this.showToastMessage = true;
	}

	private mergeLoadWarnings(...messages: Array<string | null>): void {
		const parts = messages.filter((m): m is string => Boolean(m?.trim()));
		if (parts.length === 0) return;
		this.pushToast(parts.join(' '), true);
	}

	public async loadEditor(siteId: string, fetch?: typeof globalThis.fetch): Promise<void> {
		this.loading = true;
		this.showToastMessage = false;
		this.siteLoadFailed = false;
		try {
			const [siteResult, categoriesResult, tagsResult, typesResult] = await Promise.allSettled([
				this.linkDirectoryRepository.getSiteById(siteId, fetch),
				this.linkDirectoryRepository.getAllCategories(fetch),
				this.linkDirectoryRepository.getAllTags(fetch),
				this.linkDirectoryRepository.getOpportunityTypesForAdmin(fetch)
			]);

			this.siteVm = settledValue(siteResult, null);
			this.categoriesVm = settledValue(categoriesResult, []);
			this.tagsVm = settledValue(tagsResult, []);
			this.opportunityTypesVm = settledValue(typesResult, []);

			if (siteResult.status === 'rejected') {
				this.siteLoadFailed = true;
				this.pushToast(
					userFacingApiErrorMessage(siteResult.reason, 'Could not load this site.'),
					true
				);
			}

			this.mergeLoadWarnings(
				settledErrorMessage(categoriesResult, 'Could not load categories.'),
				settledErrorMessage(tagsResult, 'Could not load tags.'),
				typesResult.status === 'rejected'
					? userFacingApiErrorMessage(
							typesResult.reason,
							apiErrorHttpStatus(typesResult.reason) === 429
								? 'Opportunity types are rate limited. Wait a moment and reload the page.'
								: 'Could not load opportunity types.'
						)
					: null
			);
		} finally {
			this.loading = false;
		}
	}

	public async loadNewEditor(fetch?: typeof globalThis.fetch): Promise<void> {
		this.loading = true;
		this.showToastMessage = false;
		try {
			this.siteVm = null;
			const [categoriesResult, tagsResult, typesResult] = await Promise.allSettled([
				this.linkDirectoryRepository.getAllCategories(fetch),
				this.linkDirectoryRepository.getAllTags(fetch),
				this.linkDirectoryRepository.getOpportunityTypesForAdmin(fetch)
			]);

			this.categoriesVm = settledValue(categoriesResult, []);
			this.tagsVm = settledValue(tagsResult, []);
			this.opportunityTypesVm = settledValue(typesResult, []);

			this.mergeLoadWarnings(
				settledErrorMessage(categoriesResult, 'Could not load categories.'),
				settledErrorMessage(tagsResult, 'Could not load tags.'),
				typesResult.status === 'rejected'
					? userFacingApiErrorMessage(
							typesResult.reason,
							apiErrorHttpStatus(typesResult.reason) === 429
								? 'Opportunity types are rate limited. Wait a moment and reload the page.'
								: 'Could not load opportunity types.'
						)
					: null
			);
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