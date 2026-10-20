import type { AutoLaunchProductProfileDto } from '$lib/auto-launch/auto-launch.types';
import {
	buildDirectorySeoHistoryChartSeries,
	type DirectorySeoHistoryChartSeriesViewModel
} from '$lib/directory-seo/buildDirectorySeoHistoryChartSeries';
import type { DirectorySeoRepository } from '$lib/directory-seo/DirectorySeo.repository';
import type {
	DirectorySeoCompetitorDto,
	DirectorySeoWorkspaceHistoryDto,
	DirectorySeoWorkspaceOverviewDto
} from '$lib/directory-seo/directory-seo.types';
import { emptyDirectorySeoWorkspaceHistory } from '$lib/directory-seo/directory-seo.types';

/** Wire-aligned read models (repository DTOs exposed as VMs at the Get* boundary). */
export type DirectorySeoWorkspaceOverviewViewModel = DirectorySeoWorkspaceOverviewDto;
export type DirectorySeoWorkspaceHistoryViewModel = DirectorySeoWorkspaceHistoryDto;

export type DirectorySeoWorkspaceAnalyticsViewModel = {
	overviewVm: DirectorySeoWorkspaceOverviewViewModel | null;
	historyVm: DirectorySeoWorkspaceHistoryViewModel;
};

export type DirectorySeoHistoryCompareOptionViewModel = {
	domain: string;
	label: string;
	selected: boolean;
};

export type DirectorySeoRefreshControlsViewModel = {
	missingWebsiteUrl: boolean;
	manualRefreshBlocked: boolean;
	canRefreshRatings: boolean;
	refreshButtonHint: string | undefined;
};

export class GetDirectorySeoPresenter {
	constructor(private readonly directorySeoRepository: DirectorySeoRepository) {}

	filterMainProductProfilesVm(
		profiles: readonly AutoLaunchProductProfileDto[]
	): AutoLaunchProductProfileDto[] {
		return profiles.filter((profile) => profile.profileKind === 'main');
	}

	resolveSelectedMainProfileVm(
		profiles: readonly AutoLaunchProductProfileDto[],
		selectedProfileId: string | null
	): AutoLaunchProductProfileDto | null {
		if (!selectedProfileId) return null;
		return profiles.find((profile) => profile.id === selectedProfileId) ?? null;
	}

	isMissingWebsiteUrlVm(
		selectedProfileId: string | null,
		profile: AutoLaunchProductProfileDto | null
	): boolean {
		return Boolean(selectedProfileId && profile && !profile.websiteUrl?.trim());
	}

	isManualRefreshBlockedVm(overview: DirectorySeoWorkspaceOverviewViewModel | null): boolean {
		const nextAt = overview?.manualRefreshAvailableAt;
		if (!nextAt) return false;
		const ms = Date.parse(nextAt);
		return Number.isFinite(ms) && Date.now() < ms;
	}

	buildRefreshControlsVm(params: {
		overview: DirectorySeoWorkspaceOverviewViewModel | null;
		selectedProfileId: string | null;
		missingWebsiteUrl: boolean;
		refreshing: boolean;
	}): DirectorySeoRefreshControlsViewModel {
		const { overview, selectedProfileId, missingWebsiteUrl, refreshing } = params;
		const manualRefreshBlocked = this.isManualRefreshBlockedVm(overview);

		const canRefreshRatings = Boolean(
			selectedProfileId &&
				!missingWebsiteUrl &&
				!refreshing &&
				!manualRefreshBlocked &&
				(overview?.providerConfigured ?? true)
		);

		let refreshButtonHint: string | undefined;
		if (canRefreshRatings) {
			refreshButtonHint = undefined;
		} else if (missingWebsiteUrl) {
			refreshButtonHint =
				'Add a website URL to your product profile before refreshing domain rating';
		} else if (overview?.manualRefreshAvailableAt && manualRefreshBlocked) {
			refreshButtonHint = `You can refresh again after ${new Date(
				overview.manualRefreshAvailableAt
			).toLocaleString()}`;
		} else if (refreshing) {
			refreshButtonHint = 'Refresh in progress…';
		} else if (!selectedProfileId) {
			refreshButtonHint = 'Select a product profile first';
		} else if (overview?.providerConfigured === false) {
			refreshButtonHint = 'Domain rating lookup is not configured on this server';
		}

		return {
			missingWebsiteUrl,
			manualRefreshBlocked,
			canRefreshRatings,
			refreshButtonHint
		};
	}

	buildHistoryChartSeriesVm(params: {
		overview: DirectorySeoWorkspaceOverviewViewModel | null;
		history: DirectorySeoWorkspaceHistoryViewModel;
		selectedCompetitorDomains: ReadonlySet<string>;
	}): DirectorySeoHistoryChartSeriesViewModel[] {
		return buildDirectorySeoHistoryChartSeries({
			productDomain: params.overview?.productDomain ?? null,
			history: params.history,
			competitors: params.overview?.competitors ?? [],
			selectedCompetitorDomains: params.selectedCompetitorDomains
		});
	}

	buildHistoryCompareOptionsVm(
		competitors: readonly DirectorySeoCompetitorDto[],
		selectedCompetitorDomains: ReadonlySet<string>
	): DirectorySeoHistoryCompareOptionViewModel[] {
		return competitors.map((competitor) => ({
			domain: competitor.domain,
			label: competitor.label?.trim() || competitor.domain,
			selected: selectedCompetitorDomains.has(competitor.domain)
		}));
	}

	pruneHistoryChartCompetitorDomains(
		selectedCompetitorDomains: ReadonlySet<string>,
		allowedDomains: readonly string[]
	): Set<string> {
		const allowed = new Set(allowedDomains);
		const next = new Set<string>();
		for (const domain of selectedCompetitorDomains) {
			if (allowed.has(domain)) next.add(domain);
		}
		return next;
	}

	async loadWorkspaceAnalyticsVm(params: {
		organizationId: string;
		productProfileId: string;
		days: number;
	}): Promise<DirectorySeoWorkspaceAnalyticsViewModel> {
		const [overviewVm, historyVm] = await Promise.all([
			this.directorySeoRepository.getWorkspaceOverview({
				organizationId: params.organizationId,
				productProfileId: params.productProfileId
			}),
			this.directorySeoRepository.getWorkspaceHistory({
				organizationId: params.organizationId,
				productProfileId: params.productProfileId,
				days: params.days
			})
		]);

		return {
			overviewVm,
			historyVm: historyVm ?? emptyDirectorySeoWorkspaceHistory()
		};
	}

	async loadWorkspaceHistoryVm(params: {
		organizationId: string;
		productProfileId: string;
		days: number;
	}): Promise<DirectorySeoWorkspaceHistoryViewModel> {
		const historyVm = await this.directorySeoRepository.getWorkspaceHistory(params);
		return historyVm ?? emptyDirectorySeoWorkspaceHistory();
	}
}
