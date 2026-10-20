import type { AutoLaunchProductProfileDto } from '$lib/auto-launch/auto-launch.types';
import type { AutoLaunchRepository } from '$lib/auto-launch/AutoLaunch.repository';
import type { GetBillingPresenter } from '$lib/billing/GetBilling.presenter.svelte';
import type {
	DirectorySeoHistoryPointDto,
	DirectorySeoWorkspaceOverviewDto
} from '$lib/directory-seo/directory-seo.types';
import type { DirectorySeoRepository } from '$lib/directory-seo/DirectorySeo.repository';
import type {
	CreateSocialPostChannelViewModel,
	ProtectedHomePagePresenter
} from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
import { planLimitsForTier } from 'openquok-common';
import {
	formatAnalyticsSeriesTotalsVm,
	type AnalyticsSeriesViewModel,
	type GetAnalyticsPresenter
} from '$lib/platform-analytics/GetAnalytics.presenter.svelte';
import type { IntegrationsRepository } from '$lib/integrations/Integrations.repository.svelte';
import type { SocialPlatformFilterVm } from '$lib/posts';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';
import type { IconName } from '$data/icons';

import { url } from '$lib/utils/path';
import { toast } from '$lib/ui/sonner';
import { socialProviderIcon, SUPPORTED_ANALYTICS_PROVIDER_IDENTIFIERS } from '$data/social-providers';

/**
 * Account `/account/analytics`: platform filter + merged analytics series for targeted channels.
 *
 * - Channel rows come from {@link ProtectedHomePagePresenter}; aggregation uses {@link GetAnalyticsPresenter}.
 * - Prefer **`syncWorkspaceHomeLists`** + **`loadMergedAnalytics`** from route **`$effect`** blocks (see analytics `+page.svelte`).
 */
export type AnalyticsScopeTab = 'social' | 'directory';

export class ProtectedAnalyticsPagePresenter {
	analyticsScopeTab = $state<AnalyticsScopeTab>('social');

	// --- Merged metrics (GET analytics → VM merge on client) ---
	loading = $state(false);
	error = $state<string | null>(null);
	mergedSeriesVm = $state<AnalyticsSeriesViewModel[]>([]);
	mergedTotalsVm = $state<string[]>([]);

	// --- Directory SEO (product domain DR + competitors) ---
	directorySeoEnabled = $state(false);
	directoryMainProfilesVm = $state<AutoLaunchProductProfileDto[]>([]);
	selectedDirectoryProfileId = $state<string | null>(null);
	directoryOverviewVm = $state<DirectorySeoWorkspaceOverviewDto | null>(null);
	directoryHistoryVm = $state<DirectorySeoHistoryPointDto[]>([]);
	directoryHistoryWindowDays = $state<7 | 30 | 90>(30);
	directorySeoLoading = $state(false);
	directorySeoRefreshing = $state(false);
	directorySeoError = $state<string | null>(null);
	directoryCompetitorCap = $state(0);
	competitorDomainDraft = $state('');
	competitorLabelDraft = $state('');
	directoryCompetitorAdding = $state(false);

	// --- Targeted channels: supported providers + SocialChannelFilter VM ---
	/** Provider identifiers that support analytics (empty-state copy + channel filtering). */
	supportedIntegrations = $derived.by(() => [...SUPPORTED_ANALYTICS_PROVIDER_IDENTIFIERS]);

	platformFilterVm = $state<SocialPlatformFilterVm>({
		allSocialPlatforms: true,
		selectedSocialPlatformIdentifiers: []
	});

	filteredIntegrationsVm = $derived.by(() => {
		const supportedIntegrationSet = new Set<string>(this.supportedIntegrations);
		const list = this.homePagePresenter.connectedChannelsVm.filter((c) =>
			supportedIntegrationSet.has(String(c.identifier ?? '').trim())
		);
		const pf = this.platformFilterVm;
		if (pf.allSocialPlatforms) return list;
		const allowed = new Set(pf.selectedSocialPlatformIdentifiers);
		return list.filter((c) => allowed.has(String(c.identifier ?? '')));
	});

	constructor(
		private readonly homePagePresenter: ProtectedHomePagePresenter,
		private readonly workspaceSettings: WorkspaceSettingsPresenter,
		private readonly getAnalyticsPresenter: GetAnalyticsPresenter,
		private readonly integrationsRepository: IntegrationsRepository,
		private readonly autoLaunchRepository: AutoLaunchRepository,
		private readonly directorySeoRepository: DirectorySeoRepository,
		private readonly getBillingPresenter: GetBillingPresenter
	) {}

	// --- OAuth / navigation helpers ---
	providerIcon(identifier: string): IconName {
		return socialProviderIcon(identifier);
	}

	/** Delegates to home presenter with OAuth `returnTo` set to the analytics route. */
	continueSetupHref(integration: CreateSocialPostChannelViewModel): string {
		return this.homePagePresenter.continueSetupHref(integration, url('/account/analytics'));
	}

	/**
	 * Validates refresh via authorize-url API, then redirects to {@link continueSetupHref}.
	 * Note: uses `toast` for API errors (same as some feature flows; account routes otherwise use Pattern B).
	 */
	async refreshIntegrationForAnalytics(integration: CreateSocialPostChannelViewModel): Promise<void> {
		const organizationId = this.workspaceSettings.currentWorkspaceId;
		if (!organizationId) return;
		const resultPm = await this.integrationsRepository.getAuthorizeUrl({
			organizationId,
			provider: integration.identifier,
			refresh: integration.internalId
		});
		if ('error' in resultPm) {
			toast.error(resultPm.error);
			return;
		}
		window.location.href = this.continueSetupHref(integration);
	}

	// --- Workspace list sync + analytics load entry points (called from route `$effect`) ---
	/** When a workspace id is available, ensure integration rows are loaded for filters/chips. */
	syncWorkspaceHomeLists(): void {
		const orgId = this.workspaceSettings.currentWorkspaceId;
		if (!orgId) return;
		void this.homePagePresenter.loadHomeLists();
	}

	/** Clears merged series state (e.g. on navigation away if you add teardown later). */
	reset(): void {
		this.loading = false;
		this.error = null;
		this.mergedSeriesVm = [];
		this.mergedTotalsVm = [];
	}

	async loadDirectoryEntitlement(organizationId: string | null): Promise<void> {
		if (!organizationId) {
			this.directorySeoEnabled = false;
			this.directoryCompetitorCap = 0;
			return;
		}
		const pricingVm = await this.getBillingPresenter.loadBillingPricingVmStateless(organizationId);
		const tier = pricingVm?.currentVm?.tier ?? 'FREE';
		const limits = planLimitsForTier(tier);
		this.directorySeoEnabled = limits.directory_seo_enabled;
		this.directoryCompetitorCap = limits.directory_seo_competitors_per_workspace;
	}

	async loadDirectoryMainProfiles(organizationId: string | null): Promise<void> {
		if (!organizationId) {
			this.directoryMainProfilesVm = [];
			this.selectedDirectoryProfileId = null;
			return;
		}
		const profiles = await this.autoLaunchRepository.listProfiles(organizationId);
		const mains = profiles.filter((profile) => profile.profileKind === 'main');
		this.directoryMainProfilesVm = mains;
		if (!this.selectedDirectoryProfileId && mains[0]) {
			this.selectedDirectoryProfileId = mains[0].id;
		} else if (
			this.selectedDirectoryProfileId &&
			!mains.some((profile) => profile.id === this.selectedDirectoryProfileId)
		) {
			this.selectedDirectoryProfileId = mains[0]?.id ?? null;
		}
	}

	selectDirectoryProfile(profileId: string): void {
		this.selectedDirectoryProfileId = profileId;
	}

	async loadDirectoryAnalytics(organizationId: string | null): Promise<void> {
		this.directorySeoError = null;
		this.directoryOverviewVm = null;
		this.directoryHistoryVm = [];

		if (!organizationId || !this.directorySeoEnabled) return;
		const profileId = this.selectedDirectoryProfileId;
		if (!profileId) return;

		this.directorySeoLoading = true;
		try {
			const [overview, history] = await Promise.all([
				this.directorySeoRepository.getWorkspaceOverview({
					organizationId,
					productProfileId: profileId
				}),
				this.directorySeoRepository.getWorkspaceHistory({
					organizationId,
					productProfileId: profileId,
					days: this.directoryHistoryWindowDays
				})
			]);
			this.directoryOverviewVm = overview;
			this.directoryHistoryVm = history;
		} catch (e) {
			this.directorySeoError =
				e instanceof Error ? e.message : 'Failed to load directory analytics.';
		} finally {
			this.directorySeoLoading = false;
		}
	}

	async refreshDirectoryAnalytics(organizationId: string | null): Promise<void> {
		if (!organizationId || !this.selectedDirectoryProfileId) return;
		const profile = this.directoryMainProfilesVm.find(
			(row) => row.id === this.selectedDirectoryProfileId
		);
		if (!profile?.websiteUrl?.trim()) {
			toast.error('Add a website URL to your product profile before refreshing ratings.');
			return;
		}
		this.directorySeoRefreshing = true;
		try {
			const resultVm = await this.directorySeoRepository.refreshWorkspace({
				organizationId,
				productProfileId: this.selectedDirectoryProfileId
			});
			if (!resultVm.ok) {
				toast.error(resultVm.error);
				return;
			}
			this.directoryOverviewVm = resultVm.overview;
			this.directoryHistoryVm = await this.directorySeoRepository.getWorkspaceHistory({
				organizationId,
				productProfileId: this.selectedDirectoryProfileId,
				days: this.directoryHistoryWindowDays
			});
			toast.success('Directory ratings updated.');
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Could not refresh directory ratings.';
			toast.error(message);
			this.directorySeoError = message;
		} finally {
			this.directorySeoRefreshing = false;
		}
	}

	async addDirectoryCompetitor(organizationId: string | null): Promise<void> {
		if (!organizationId) return;
		const domain = this.competitorDomainDraft.trim();
		if (!domain) return;
		this.directoryCompetitorAdding = true;
		try {
			const resultVm = await this.directorySeoRepository.addCompetitor({
				organizationId,
				domain,
				label: this.competitorLabelDraft.trim() || null
			});
			if (!resultVm.ok) {
				toast.error(resultVm.error);
				return;
			}
			this.competitorDomainDraft = '';
			this.competitorLabelDraft = '';
			await this.loadDirectoryAnalytics(organizationId);
		} finally {
			this.directoryCompetitorAdding = false;
		}
	}

	async removeDirectoryCompetitor(organizationId: string | null, domain: string): Promise<void> {
		if (!organizationId) return;
		const resultVm = await this.directorySeoRepository.deleteCompetitor({ organizationId, domain });
		if (!resultVm.ok) {
			toast.error(resultVm.error ?? 'Could not remove competitor.');
			return;
		}
		await this.loadDirectoryAnalytics(organizationId);
	}

	async loadMergedAnalytics(params: {
		organizationId: string | null;
		integrations: CreateSocialPostChannelViewModel[];
		dateWindowDays: number;
	}): Promise<void> {
		const { organizationId, integrations, dateWindowDays } = params;

		this.error = null;
		this.mergedSeriesVm = [];
		this.mergedTotalsVm = [];

		if (!organizationId) return;
		if (!integrations.length) return;

		this.loading = true;
		try {
			const merged = await this.getAnalyticsPresenter.loadMergedAnalyticsSeriesVm({
				organizationId,
				integrations,
				dateWindowDays
			});
			this.mergedSeriesVm = merged;
			this.mergedTotalsVm = formatAnalyticsSeriesTotalsVm(merged);
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to load analytics.';
		} finally {
			this.loading = false;
		}
	}
}

