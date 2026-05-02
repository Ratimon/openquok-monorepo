import type {
	CreateSocialPostPresenter,
	CreateSocialPostPrepareOpenOptions
} from '$lib/posts/CreateSocialPostPresenter.svelte';
import type { SchedulerPresenter } from '$lib/posts/SchedulerPresenter.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';
import type {
	CreateSocialPostChannelViewModel,
	DashboardChannelMutationViewModel,
	ProtectedDashboardPagePresenter
} from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
import type { IconName } from '$data/icons';
import type {
	GetAnalyticsPresenter,
	PostStatisticsAnalyticsViewModel
} from '$lib/platform-analytics/GetAnalytics.presenter.svelte';
import type { PostsRepository } from '$lib/posts/Post.repository.svelte';

import { url } from '$lib/utils/path';
import { socialProviderIcon } from '$data/social-providers';

/** One provider-published asset the user can link to a scheduled post (missing-release flow). */
export interface MissingPublishCandidateViewModel {
	id: string;
	url: string;
}

export type LoadMissingPublishCandidatesResultViewModel =
	| { ok: true; items: MissingPublishCandidateViewModel[] }
	| { ok: false; error: string };

export type UpdatePostReleaseIdResultViewModel = { ok: true } | { ok: false; error: string };

/**
 * Account `/account/calendar`: targeted channels, Schedule‑X reload fingerprint, composer scope.
 *
 * Delegates channel CRUD + OAuth URLs to {@link ProtectedDashboardPagePresenter}; bumps {@link calendarRefreshKey}
 * after mutations so {@link SchedulerPresenter} reloads.
 */
export class ProtectedCalendarPagePresenter {
	// --- Scheduler header chips / reload ---
	targetedChannelsVm = $state<CreateSocialPostChannelViewModel[]>([]);
	calendarRefreshKey = $state(0);

	constructor(
		private readonly dashboardPagePresenter: ProtectedDashboardPagePresenter,
		private readonly workspaceSettings: WorkspaceSettingsPresenter,
		readonly schedulerPresenter: SchedulerPresenter,
		readonly createSocialPostPresenter: CreateSocialPostPresenter,
		private readonly getAnalyticsPresenter: GetAnalyticsPresenter,
		private readonly postsRepository: PostsRepository
	) {}

	// --- OAuth / icons ---
	providerIcon(identifier: string): IconName {
		return socialProviderIcon(identifier);
	}

	continueSetupHref(integration: CreateSocialPostChannelViewModel): string {
		return this.dashboardPagePresenter.continueSetupHref(integration, url('/account/calendar'));
	}

	// --- Targeted channel list (filled by Scheduler via callback) ---
	setTargetedChannels(channels: CreateSocialPostChannelViewModel[]): void {
		this.targetedChannelsVm = channels;
	}

	bumpCalendarRefresh(): void {
		this.calendarRefreshKey += 1;
	}

	/**
	 * Run in `$effect`: when a workspace id is available, load dashboard lists for channel rows.
	 */
	syncWorkspaceDashboardLists(): void {
		const orgId = this.workspaceSettings.currentWorkspaceId;
		if (!orgId) return;
		void this.dashboardPagePresenter.loadDashboardLists();
	}

	// --- Create-post composer scope from current targeted channels ---
	/** Composer open options for the current calendar channel scope (route applies via {@link CreateSocialPostPresenter.prepareOpen}). */
	getCreatePostPrepareOpenOptions():
		| { ok: true; options: CreateSocialPostPrepareOpenOptions }
		| { ok: false; error: string } {

		const workspaceId = this.workspaceSettings.currentWorkspaceId;
		if (!workspaceId) {
			return { ok: false, error: 'Create or select a workspace first.' };
		}
		const targetedChannelsVm = this.targetedChannelsVm;
		const connectedChannelsVm = this.dashboardPagePresenter.connectedChannelsVm;
		const ids = targetedChannelsVm.filter((c) => c.schedulable).map((c) => c.id);
		if (targetedChannelsVm.length > 0 && ids.length === 0) {
			return { ok: false, error: 'All targeted channels need reconnecting before you can schedule posts.' };
		}
		const isAllTargeted =
			targetedChannelsVm.length > 0 && targetedChannelsVm.length === connectedChannelsVm.length;
		const uniqueGroupIds = new Set(
			targetedChannelsVm.map((c) => c.group?.id ?? null).filter((g): g is string => Boolean(g))
		);
		const hasUngrouped = targetedChannelsVm.some((c) => !c.group?.id);
		const singleGroupId =
			!hasUngrouped && uniqueGroupIds.size === 1 ? [...uniqueGroupIds][0]! : null;
		const options: CreateSocialPostPrepareOpenOptions = {
			preselectIntegrationId: null,
			preselectGroupId: singleGroupId,
			preselectIntegrationIds: singleGroupId ? null : ids.length ? ids : null,
			autoCustomizeFirstSelected: !isAllTargeted
		};
		return { ok: true, options };
	}

	// --- Channel mutations (delegate + bump scheduler refresh on success) ---
	async removeChannel(id: string): Promise<DashboardChannelMutationViewModel> {
		const removeChannelResult = await this.dashboardPagePresenter.removeChannel(id);
		if (removeChannelResult.ok) this.bumpCalendarRefresh();
		return removeChannelResult;
	}

	async setChannelDisabled(id: string, disabled: boolean): Promise<DashboardChannelMutationViewModel> {
		const setChannelDisabledResult = await this.dashboardPagePresenter.setChannelDisabled(id, disabled);
		if (setChannelDisabledResult.ok) this.bumpCalendarRefresh();
		return setChannelDisabledResult;
	}

	// --- Post statistics: delegate to {@link GetAnalyticsPresenter} (PM→VM in Get*; modal stays dumb) ---

	loadPostStatisticsAnalyticsVm(params: {
		organizationId: string;
		postId: string;
		date: number;
	}): Promise<PostStatisticsAnalyticsViewModel> {
		return this.getAnalyticsPresenter.loadPostStatisticsAnalyticsVm(params);
	}

	async loadMissingPublishCandidatesForPost(params: {
		postId: string;
		organizationId: string;
	}): Promise<LoadMissingPublishCandidatesResultViewModel> {
		const resultPm = await this.postsRepository.getMissingPublishCandidates(params);
		if (!resultPm.ok) {
			return { ok: false, error: resultPm.error };
		}
		const itemsVm: MissingPublishCandidateViewModel[] = resultPm.items.map((itemPm) => ({
			id: itemPm.id,
			url: itemPm.url
		}));
		return { ok: true, items: itemsVm };
	}

	async updatePostReleaseIdForStatistics(params: {
		postId: string;
		organizationId: string;
		releaseId: string;
	}): Promise<UpdatePostReleaseIdResultViewModel> {
		const resultPm = await this.postsRepository.updatePostReleaseId(params);
		if (!resultPm.ok) {
			return { ok: false, error: resultPm.error };
		}
		return { ok: true };
	}
}
