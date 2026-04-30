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

import type { IconName } from '$data/icon';

import { socialProviderIcon } from '$lib/posts/constants/socialProviderIcons';

import { integrationOAuthCallbackPath } from '$lib/integration/oauthCallbackPath';
import { route } from '$lib/utils/path';
import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';

/**
 * Account calendar screen: scoped channel targeting, scheduler refresh, and create-post preparation
 * on top of {@link ProtectedDashboardPagePresenter} workspace channel data.
 */
export class ProtectedCalendarPagePresenter {
	targetedChannelsVm = $state<CreateSocialPostChannelViewModel[]>([]);
	calendarRefreshKey = $state(0);

	constructor(
		private readonly dashboardPagePresenter: ProtectedDashboardPagePresenter,
		private readonly workspaceSettings: WorkspaceSettingsPresenter,
		readonly schedulerPresenter: SchedulerPresenter,
		readonly createSocialPostPresenter: CreateSocialPostPresenter
	) {}

	providerIcon(identifier: string): IconName {
		return socialProviderIcon(identifier);
	}

	continueSetupHref(integration: CreateSocialPostChannelViewModel): string {
		const accountRoot = route(getRootPathAccount());
		const workspaceId = this.workspaceSettings.currentWorkspaceId;
		if (!workspaceId) return accountRoot;
		if (integration.identifier === 'instagram-business') {
			const qs = new URLSearchParams({
				organizationId: workspaceId,
				integrationId: integration.id,
				returnTo: accountRoot
			});
			return `${integrationOAuthCallbackPath('instagram-business')}?${qs}`;
		}
		const qs = new URLSearchParams({
			organizationId: workspaceId,
			returnTo: accountRoot,
			refresh: integration.internalId
		});
		return `${integrationOAuthCallbackPath(integration.identifier)}?${qs}`;
	}

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
}
