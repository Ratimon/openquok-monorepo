import type {
	CreateSocialPostChannelViewModel,
	ProtectedDashboardPagePresenter
} from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
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
 * - Channel rows come from {@link ProtectedDashboardPagePresenter}; aggregation uses {@link GetAnalyticsPresenter}.
 * - Prefer **`syncWorkspaceDashboardLists`** + **`loadMergedAnalytics`** from route **`$effect`** blocks (see analytics `+page.svelte`).
 */
export class ProtectedAnalyticsPagePresenter {
	// --- Merged metrics (GET analytics → VM merge on client) ---
	loading = $state(false);
	error = $state<string | null>(null);
	mergedSeriesVm = $state<AnalyticsSeriesViewModel[]>([]);
	mergedTotalsVm = $state<string[]>([]);

	// --- Targeted channels: supported providers + SocialChannelFilter VM ---
	/** Provider identifiers that support analytics (empty-state copy + channel filtering). */
	supportedIntegrations = $derived.by(() => [...SUPPORTED_ANALYTICS_PROVIDER_IDENTIFIERS]);

	platformFilterVm = $state<SocialPlatformFilterVm>({
		allSocialPlatforms: true,
		selectedSocialPlatformIdentifiers: []
	});

	filteredIntegrationsVm = $derived.by(() => {
		const supportedIntegrationSet = new Set<string>(this.supportedIntegrations);
		const list = this.dashboardPagePresenter.connectedChannelsVm.filter((c) =>
			supportedIntegrationSet.has(String(c.identifier ?? '').trim())
		);
		const pf = this.platformFilterVm;
		if (pf.allSocialPlatforms) return list;
		const allowed = new Set(pf.selectedSocialPlatformIdentifiers);
		return list.filter((c) => allowed.has(String(c.identifier ?? '')));
	});

	constructor(
		private readonly dashboardPagePresenter: ProtectedDashboardPagePresenter,
		private readonly workspaceSettings: WorkspaceSettingsPresenter,
		private readonly getAnalyticsPresenter: GetAnalyticsPresenter,
		private readonly integrationsRepository: IntegrationsRepository
	) {}

	// --- OAuth / navigation helpers ---
	providerIcon(identifier: string): IconName {
		return socialProviderIcon(identifier);
	}

	/** Delegates to dashboard presenter with OAuth `returnTo` set to the analytics route. */
	continueSetupHref(integration: CreateSocialPostChannelViewModel): string {
		return this.dashboardPagePresenter.continueSetupHref(integration, url('/account/analytics'));
	}

	/**
	 * Validates refresh via authorize-url API, then redirects to {@link continueSetupHref}.
	 * Note: uses `toast` for API errors (same as some feature flows; account routes otherwise use Pattern B).
	 */
	async refreshIntegrationForAnalytics(integration: CreateSocialPostChannelViewModel): Promise<void> {
		const organizationId = this.workspaceSettings.currentWorkspaceId;
		if (!organizationId) return;
		const r = await this.integrationsRepository.getAuthorizeUrl({
			organizationId,
			provider: integration.identifier,
			refresh: integration.internalId
		});
		if ('error' in r) {
			toast.error(r.error);
			return;
		}
		window.location.href = this.continueSetupHref(integration);
	}

	// --- Workspace list sync + analytics load entry points (called from route `$effect`) ---
	/** When a workspace id is available, ensure integration rows are loaded for filters/chips. */
	syncWorkspaceDashboardLists(): void {
		const orgId = this.workspaceSettings.currentWorkspaceId;
		if (!orgId) return;
		void this.dashboardPagePresenter.loadDashboardLists();
	}

	/** Clears merged series state (e.g. on navigation away if you add teardown later). */
	reset(): void {
		this.loading = false;
		this.error = null;
		this.mergedSeriesVm = [];
		this.mergedTotalsVm = [];
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

