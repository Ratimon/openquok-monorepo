import type { IntegrationsRepository } from '$lib/integrations/Integrations.repository.svelte';
import type { SettingsRepository } from '$lib/settings/Settings.repository.svelte';
import type { CreateSocialPostPresenter } from '$lib/posts/CreateSocialPost.presenter.svelte';
import type { PostKanbanBoardPresenter } from '$lib/posts/PostKanbanBoard.presenter.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';
import {
	GetHomeWorkspacesPresenter,
	type HomeWorkspaceCardViewModel
} from '$lib/area-protected/GetHomeWorkspaces.presenter.svelte';
import type { HomeChannelsGridFilterBuilderPresenter } from '$lib/channels/HomeChannelsGridFilterBuilder.presenter.svelte';
import type { HomeChannelsGridTablePresenter } from '$lib/channels/HomeChannelsGridTable.presenter.svelte';
import type {
	CreateSocialPostChannelViewModel,
	GetChannelPresenter,
	PostingTimeSlotViewModel,
	WorkspaceChannelGroupViewModel
} from '$lib/channels/GetChannel.presenter.svelte';

import { integrationOAuthCallbackPath } from '$lib/integrations/utils/oauthCallbackPath';
import { absoluteUrl, route, url } from '$lib/utils/path';
import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';

export type {
	CreateSocialPostChannelViewModel,
	HomeChannelGroupViewModel,
	HomeChannelsLayoutModeViewModel,
	HomeConnectedChannelMenuGroupViewModel,
	HomePlatformChannelRowViewModel,
	PostingTimeSlotViewModel,
	WorkspaceChannelGroupViewModel
} from '$lib/channels/GetChannel.presenter.svelte';

type HomeIntegrationsLoadStatus = 'idle' | 'loading' | 'ready' | 'error';
type ChannelGroupsLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export type HomeChannelMutationViewModel = { ok: true } | { ok: false; error: string };

export type HomePostConnectQueryViewModel =
	| { handled: false }
	| { handled: true; successToastMessage?: string };

export type { HomeWorkspaceCardViewModel } from '$lib/area-protected/GetHomeWorkspaces.presenter.svelte';

type MyWorkspacesLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

type HomeCurrentUserSnapshot = {
	id?: string | null;
	email?: string | null;
	fullName?: string | null;
};

/**
 * Account `/account` home: workspace channels, channel groups, post-connect query handling, OAuth continue URLs.
 */
export class ProtectedHomePagePresenter {
	// --- Raw list + status (integrations API) ---
	connectedChannelsVm = $state<CreateSocialPostChannelViewModel[]>([]);
	listStatus = $state<HomeIntegrationsLoadStatus>('idle');
	channelGroupsVm = $state<WorkspaceChannelGroupViewModel[]>([]);
	channelGroupsStatus = $state<ChannelGroupsLoadStatus>('idle');
	showOnboardingWelcome = $state(false);

	myWorkspacesCardsVm = $state<HomeWorkspaceCardViewModel[]>([]);
	myWorkspacesStatus = $state<MyWorkspacesLoadStatus>('idle');

	/** Coalesces overlapping list + channel-group loads (same navigation tick, post-connect, etc.). */
	private homeListsInflight: Promise<void> | null = null;
	private myWorkspacesInflight: Promise<void> | null = null;

	// --- Derived rows for menus / sections (built from connectedChannelsVm) ---
	/** Grouped by integration `type` for home menus. */
	menuGroups = $derived.by(() =>
		this.getChannelPresenter.buildHomeChannelMenuGroupsVm(this.connectedChannelsVm)
	);

	/** Grouped by integration `identifier` (one row per provider on the account home). */
	platformChannelRows = $derived.by(() =>
		this.getChannelPresenter.buildPlatformChannelRowsVm(this.connectedChannelsVm)
	);

	/** Channels with a workspace channel group, for collapsible sidebar sections. */
	channelGroupSections = $derived.by(() =>
		this.getChannelPresenter.buildChannelGroupSectionsVm(this.connectedChannelsVm)
	);

	/** Same as {@link platformChannelRows} but only channels not assigned to a channel group. */
	platformChannelRowsUngrouped = $derived.by(() =>
		this.getChannelPresenter.buildPlatformChannelRowsVm(
			this.connectedChannelsVm.filter((c) => !c.group)
		)
	);

	constructor(
		private readonly integrationsRepository: IntegrationsRepository,
		private readonly settingsRepository: SettingsRepository,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter,
		readonly createSocialPostPresenter: CreateSocialPostPresenter,
		readonly postKanbanBoardPresenter: PostKanbanBoardPresenter,
		readonly channelsGridTable: HomeChannelsGridTablePresenter,
		readonly channelsGridFilterBuilder: HomeChannelsGridFilterBuilderPresenter,
		private readonly getChannelPresenter: GetChannelPresenter,
		private readonly getHomeWorkspacesPresenter: GetHomeWorkspacesPresenter
	) {}

	/** Rebuild SVAR grid rows from {@link connectedChannelsVm} (table layout). */
	refreshHomeChannelsGrid(): void {
		this.channelsGridTable.refreshRowsFromChannels(this.connectedChannelsVm);
	}

	// --- OAuth continue URLs (optional `oauthReturnTo` for calendar/analytics) ---
	/**
	 * Absolute OAuth continue URL for a channel.
	 * When `oauthReturnTo` is omitted, `returnTo` is the routed account root (same as home / calendar).
	 */
	continueSetupHref(
		integration: CreateSocialPostChannelViewModel,
		oauthReturnTo?: string
	): string {
		const workspaceId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!workspaceId) return url(`/${getRootPathAccount()}`);
		const returnTo = oauthReturnTo ?? route(getRootPathAccount());
		if (integration.identifier === 'instagram-business') {
			const qs = new URLSearchParams({
				organizationId: workspaceId,
				integrationId: integration.id,
				returnTo
			});
			return absoluteUrl(`${integrationOAuthCallbackPath('instagram-business')}?${qs}`);
		}
		const qs = new URLSearchParams({
			organizationId: workspaceId,
			returnTo,
			refresh: integration.internalId
		});
		return absoluteUrl(`${integrationOAuthCallbackPath(integration.identifier)}?${qs}`);
	}

	// --- Integration list + channel groups ---
	/**
	 * Loads integrations list and channel groups for the current workspace in one coordinated pass.
	 * Prefer this over separate `loadConnectedIntegrations` / `loadChannelGroups` from UI to avoid duplicate HTTP.
	 */
	/**
	 * Loads team + social channels for every workspace the user belongs to (account home cards).
	 */
	async loadMyWorkspacesOverview(currentUser: HomeCurrentUserSnapshot | null): Promise<void> {
		const workspaces = this.workspaceSettingsPresenter.workspacesVm;
		if (workspaces.length === 0) {
			this.myWorkspacesCardsVm = [];
			this.myWorkspacesStatus = 'ready';
			return;
		}
		if (this.myWorkspacesInflight) return this.myWorkspacesInflight;
		const currentWorkspaceId = this.workspaceSettingsPresenter.currentWorkspaceId;
		this.myWorkspacesStatus = 'loading';
		this.myWorkspacesInflight = (async () => {
			try {
				const cards = await Promise.all(
					workspaces.map(async (workspace) => {
						const [membersPm, integrationsPm] = await Promise.all([
							this.settingsRepository.getTeam(workspace.id),
							this.integrationsRepository.listConnectedIntegrations(workspace.id)
						]);
						return this.getHomeWorkspacesPresenter.toWorkspaceCardVm({
							workspace,
							membersPm,
							integrationsPm,
							currentUser,
							isCurrent: workspace.id === currentWorkspaceId,
							getChannelPresenter: this.getChannelPresenter
						});
					})
				);
				this.myWorkspacesCardsVm = cards;
				this.myWorkspacesStatus = 'ready';
			} catch {
				this.myWorkspacesCardsVm = [];
				this.myWorkspacesStatus = 'error';
			}
		})();
		try {
			await this.myWorkspacesInflight;
		} finally {
			this.myWorkspacesInflight = null;
		}
	}

	async loadHomeLists(): Promise<void> {
		if (this.homeListsInflight) return this.homeListsInflight;
		const orgId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			this.connectedChannelsVm = [];
			this.listStatus = 'idle';
			this.channelGroupsVm = [];
			this.channelGroupsStatus = 'idle';
			return;
		}
		this.homeListsInflight = (async () => {
			await Promise.all([this.loadConnectedIntegrations(), this.loadChannelGroups()]);
		})();
		try {
			await this.homeListsInflight;
		} finally {
			this.homeListsInflight = null;
		}
	}

	async loadConnectedIntegrations(): Promise<void> {
		const orgId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			this.connectedChannelsVm = [];
			this.listStatus = 'idle';
			this.channelGroupsVm = [];
			this.channelGroupsStatus = 'idle';
			this.channelsGridTable.resetForNoWorkspace();
			return;
		}
		this.listStatus = 'loading';
		try {
			const rows = await this.integrationsRepository.listConnectedIntegrations(orgId);
			this.connectedChannelsVm = rows.map((pm) =>
				this.getChannelPresenter.toCreateSocialPostChannelViewModel(pm)
			);
			this.listStatus = 'ready';
			this.refreshHomeChannelsGrid();
		} catch {
			this.listStatus = 'error';
			this.connectedChannelsVm = [];
			this.channelGroupsVm = [];
			this.channelGroupsStatus = 'error';
			this.channelsGridTable.resetForNoWorkspace();
		}
	}

	async loadChannelGroups(): Promise<void> {
		const orgId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			this.channelGroupsVm = [];
			this.channelGroupsStatus = 'idle';
			return;
		}
		this.channelGroupsStatus = 'loading';
		try {
			this.channelGroupsVm = await this.integrationsRepository.listChannelCustomers(orgId);
			this.channelGroupsStatus = 'ready';
		} catch {
			this.channelGroupsStatus = 'error';
			this.channelGroupsVm = [];
		}
	}

	async createChannelGroup(
		name: string
	): Promise<({ ok: true } & WorkspaceChannelGroupViewModel) | { ok: false; error: string }> {
		const orgId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			return { ok: false, error: 'No workspace selected.' };
		}
		const resPm = await this.integrationsRepository.createChannelCustomer({ organizationId: orgId, name });
		if (resPm.ok) {
			this._insertChannelGroupSorted({ id: resPm.id, name: resPm.name });
			return { ok: true, id: resPm.id, name: resPm.name };
		}
		return { ok: false, error: resPm.error };
	}

	/**
	 * Assign or clear workspace channel group on an integration. On success, patches
	 * `connectedChannelsVm` in place (no full list refetch). Pass `groupDisplayName` when the
	 * label is known from the UI and may not yet appear in `channelGroupsVm`.
	 */
	async assignChannelGroup(
		integrationId: string,
		groupId: string | null,
		groupDisplayName?: string | null
	): Promise<HomeChannelMutationViewModel> {
		const orgId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			return { ok: false, error: 'No workspace selected.' };
		}
		const resPm = await this.integrationsRepository.assignChannelCustomer({
			organizationId: orgId,
			integrationId,
			customerId: groupId
		});
		if (resPm.ok) {
			const group: WorkspaceChannelGroupViewModel | null =
				groupId === null
					? null
					: {
							id: groupId,
							name: (() => {
								const n = (
									groupDisplayName?.trim() ||
									this.channelGroupsVm.find((g) => g.id === groupId)?.name ||
									''
								).trim();
								return n || 'Channel group';
							})()
						};
			this._patchIntegrationGroup(integrationId, group);
			return { ok: true };
		}
		return { ok: false, error: resPm.error };
	}

	dismissOnboardingWelcome(): void {
		this.showOnboardingWelcome = false;
	}

	async removeChannel(integrationId: string): Promise<HomeChannelMutationViewModel> {
		const orgId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			return { ok: false, error: 'No workspace selected.' };
		}
		const resPm = await this.integrationsRepository.deleteChannel({
			organizationId: orgId,
			integrationId
		});
		if (resPm.ok) {
			await this.loadConnectedIntegrations();
			return { ok: true };
		}
		return { ok: false, error: resPm.error };
	}

	async setChannelDisabled(integrationId: string, disabled: boolean): Promise<HomeChannelMutationViewModel> {
		const orgId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			return { ok: false, error: 'No workspace selected.' };
		}
		const resPm = await this.integrationsRepository.setChannelDisabled({
			organizationId: orgId,
			integrationId,
			disabled
		});
		if (resPm.ok) {
			await this.loadConnectedIntegrations();
			return { ok: true };
		}
		return { ok: false, error: resPm.error };
	}

	async setPostingTimes(
		integrationId: string,
		slots: PostingTimeSlotViewModel[]
	): Promise<HomeChannelMutationViewModel> {
		const orgId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			return { ok: false, error: 'No workspace selected.' };
		}
		if (slots.length < 1) {
			return { ok: false, error: 'Add at least one time slot.' };
		}
		const resPm = await this.integrationsRepository.setIntegrationPostingTimes({
			organizationId: orgId,
			integrationId,
			time: slots
		});
		if (resPm.ok) {
			this._patchIntegrationPostingTimes(integrationId, slots);
			return { ok: true };
		}
		return { ok: false, error: resPm.error };
	}

	/**
	 * After social connect redirect: strip query, reload list, optional onboarding dialog.
	 * Caller should show `successToastMessage` (from `msg` query) via toast when present.
	 */
	async handlePostConnectQuery(
		url: URL,
		navigate: (href: string, opts?: { replaceState?: boolean }) => Promise<void>
	): Promise<HomePostConnectQueryViewModel> {
		const added = url.searchParams.get('added');
		const msg = url.searchParams.get('msg');
		const onboarding = url.searchParams.get('onboarding');
		if (!added && !msg && onboarding !== 'true') {
			return { handled: false };
		}

		let successToastMessage: string | undefined;
		if (msg) {
			try {
				successToastMessage = decodeURIComponent(msg.replace(/\+/g, ' '));
			} catch {
				successToastMessage = msg.replace(/\+/g, ' ');
			}
		}

		if (onboarding === 'true') {
			this.showOnboardingWelcome = true;
		}

		await navigate(url.pathname, { replaceState: true });
		await this.loadHomeLists();
		return successToastMessage !== undefined
			? { handled: true, successToastMessage }
			: { handled: true };
	}

	private _insertChannelGroupSorted(entry: WorkspaceChannelGroupViewModel): void {
		if (this.channelGroupsVm.some((g) => g.id === entry.id)) return;
		this.channelGroupsVm = [...this.channelGroupsVm, entry].sort((a, b) =>
			a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
		);
		if (this.channelGroupsVm.length > 0) {
			this.channelGroupsStatus = 'ready';
		}
	}

	private _patchIntegrationGroup(
		integrationId: string,
		group: WorkspaceChannelGroupViewModel | null
	): void {
		const idx = this.connectedChannelsVm.findIndex((c) => c.id === integrationId);
		if (idx < 0) return;
		const prev = this.connectedChannelsVm[idx];
		this.connectedChannelsVm = [
			...this.connectedChannelsVm.slice(0, idx),
			{ ...prev, group },
			...this.connectedChannelsVm.slice(idx + 1)
		];
		this.refreshHomeChannelsGrid();
	}

	private _patchIntegrationPostingTimes(integrationId: string, slots: PostingTimeSlotViewModel[]): void {
		const idx = this.connectedChannelsVm.findIndex((c) => c.id === integrationId);
		if (idx < 0) return;
		const prev = this.connectedChannelsVm[idx];
		const sorted = [...slots].sort((a, b) => a.time - b.time);
		this.connectedChannelsVm = [
			...this.connectedChannelsVm.slice(0, idx),
			{ ...prev, postingTimes: sorted },
			...this.connectedChannelsVm.slice(idx + 1)
		];
		this.refreshHomeChannelsGrid();
	}
}
