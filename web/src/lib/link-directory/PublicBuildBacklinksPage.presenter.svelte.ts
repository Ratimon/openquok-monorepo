import type { LinkDirectoryRepository } from '$lib/link-directory/LinkDirectory.repository';
import type { BuildBacklinksHubFilters } from '$lib/link-directory/link-directory.types';
import {
	buildBuildBacklinksHubNavigationUrl,
	parseBuildBacklinksHubQueryFiltersFromUrl
} from '$lib/link-directory/utils/buildBuildBacklinksHubNavigationUrl';

export class PublicBuildBacklinksPagePresenter {
	constructor(private readonly linkDirectoryRepository: LinkDirectoryRepository) {}

	parseFiltersFromUrl(searchParams: URLSearchParams): Pick<
		BuildBacklinksHubFilters,
		'sort' | 'search' | 'costTiers' | 'dofollow' | 'effort' | 'approvalMode'
	> {
		return parseBuildBacklinksHubQueryFiltersFromUrl(searchParams);
	}

	buildFilterUrl(
		current: BuildBacklinksHubFilters,
		overrides: Partial<BuildBacklinksHubFilters>
	): string {
		return buildBuildBacklinksHubNavigationUrl(current, overrides);
	}

	async submitSiteProposal(
		payload: Parameters<LinkDirectoryRepository['createSubmission']>[0],
		fetch?: typeof globalThis.fetch
	): Promise<{ ok: boolean; message?: string }> {
		return this.linkDirectoryRepository.createSubmission(payload, fetch);
	}
}
