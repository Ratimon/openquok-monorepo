import type {
	ConnectedIntegrationProgrammerModel,
	IntegrationsRepository
} from '$lib/integrations/Integrations.repository.svelte';
import type { CreateSocialPostPresenter } from '$lib/posts/CreateSocialPostPresenter.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';

import { integrationOAuthCallbackPath } from '$lib/integrations/utils/oauthCallbackPath';
import { absoluteUrl, route, url } from '$lib/utils/path';
import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';

/** One scheduled posting slot: minutes after midnight (0–1439), matching `integrations.posting_times` JSON. */
export type PostingTimeSlotViewModel = { time: number };

/** Workspace channel group row (id + display name) for dashboard lists and assignment. */
export type WorkspaceChannelGroupViewModel = { id: string; name: string };

/**
 * Connected channel row for the account dashboard (presenter / UI). No repository DTO shape.
 */
export interface CreateSocialPostChannelViewModel {
	id: string;
	internalId: string;
	name: string;
	identifier: string;
	/** Raw provider/profile picture URL from the API (may be an Instagram CDN URL). */
	picture: string | null;
	type: string;
	disabled: boolean;
	inBetweenSteps: boolean;
	refreshNeeded: boolean;
	/** Whether this channel can be scheduled/published right now (UI gating). */
	schedulable: boolean;
	/** Short UI message explaining why a channel cannot be scheduled. */
	unschedulableReason: string | null;
	/** Workspace channel group this channel belongs to, if any. */
	group: WorkspaceChannelGroupViewModel | null;
	/** Parsed `posting_times` from the API (deduplicated, sorted by `time`). */
	postingTimes: PostingTimeSlotViewModel[];
}

const MINUTES_PER_DAY = 24 * 60;

/** Normalizes list API `time` payloads into unique minute-of-day values. */
export function parsePostingTimeSlots(raw: unknown): PostingTimeSlotViewModel[] {
	if (!Array.isArray(raw)) return [];
	const seen = new Set<number>();
	const out: PostingTimeSlotViewModel[] = [];
	for (const item of raw) {
		if (!item || typeof item !== 'object') continue;
		const t = Number((item as Record<string, unknown>).time);
		if (!Number.isFinite(t)) continue;
		let m = Math.round(t) % MINUTES_PER_DAY;
		if (m < 0) m += MINUTES_PER_DAY;
		if (seen.has(m)) continue;
		seen.add(m);
		out.push({ time: m });
	}
	out.sort((a, b) => a.time - b.time);
	return out;
}

function toCreateSocialPostChannelViewModel(
	pm: ConnectedIntegrationProgrammerModel
): CreateSocialPostChannelViewModel {
	const disabled = pm.disabled;
	const inBetweenSteps = pm.inBetweenSteps;
	const refreshNeeded = pm.refreshNeeded;
	const schedulable = !disabled && !inBetweenSteps && !refreshNeeded;
	const unschedulableReason = (() => {
		if (disabled) return 'This channel is disabled.';
		if (inBetweenSteps) return 'Finish connecting this channel first.';
		if (refreshNeeded) return 'Reconnect this channel first.';
		return null;
	})();
	const picture = pm.picture;
	return {
		id: pm.id,
		internalId: pm.internalId,
		name: pm.name,
		identifier: pm.identifier,
		picture,
		type: pm.type,
		disabled,
		inBetweenSteps,
		refreshNeeded,
		schedulable,
		unschedulableReason,
		group: pm.group ?? null,
		postingTimes: parsePostingTimeSlots(pm.time)
	};
}

/** Collapsible menu section on the account dashboard (grouped by channel `type`). */
export interface DashboardConnectedChannelMenuGroupViewModel {
	label: string;
	items: CreateSocialPostChannelViewModel[];
}

/** One row per integration provider (`identifier`): platform icon + its connected channels. */
export interface DashboardPlatformChannelRowViewModel {
	identifier: string;
	items: CreateSocialPostChannelViewModel[];
}

/** Channels assigned to the same workspace channel group (sidebar section). */
export interface DashboardChannelGroupViewModel {
	id: string;
	name: string;
	items: CreateSocialPostChannelViewModel[];
	/** One row per integration `identifier` (icon + chips + Add more), scoped to this group's channels. */
	platformRows: DashboardPlatformChannelRowViewModel[];
}

function labelForDashboardChannelGroupType(type: string | undefined): string {
	const t = type?.trim() ?? '';
	if (!t) return 'Channels';
	const lower = t.toLowerCase();
	if (lower === 'social') return 'Social';
	if (lower === 'article') return 'Articles';
	return t.charAt(0).toUpperCase() + t.slice(1);
}

function buildDashboardChannelMenuGroupsVm(
	channels: readonly CreateSocialPostChannelViewModel[]
): DashboardConnectedChannelMenuGroupViewModel[] {
	const map = new Map<string, CreateSocialPostChannelViewModel[]>();
	for (const item of channels) {
		const key = labelForDashboardChannelGroupType(item.type);
		if (!map.has(key)) map.set(key, []);
		map.get(key)!.push(item);
	}
	const groups: DashboardConnectedChannelMenuGroupViewModel[] = [];
	for (const [label, items] of map.entries()) {
		const sorted = [...items].sort((a, b) =>
			(a.name || a.identifier).localeCompare(b.name || b.identifier, undefined, { sensitivity: 'base' })
		);
		groups.push({ label, items: sorted });
	}
	groups.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
	return groups;
}

const DASHBOARD_PLATFORM_ROW_ORDER: readonly string[] = [
	'threads',
	'instagram-business',
	'instagram-standalone',
	'facebook',
	'x',
	'youtube',
	'tiktok'
];

function buildPlatformChannelRowsVm(
	channels: readonly CreateSocialPostChannelViewModel[]
): DashboardPlatformChannelRowViewModel[] {
	const map = new Map<string, CreateSocialPostChannelViewModel[]>();
	for (const ch of channels) {
		const key = ch.identifier?.trim() || 'unknown';
		if (!map.has(key)) map.set(key, []);
		map.get(key)!.push(ch);
	}
	const rows: DashboardPlatformChannelRowViewModel[] = [];
	for (const [identifier, items] of map.entries()) {
		const sorted = [...items].sort((a, b) =>
			(a.name || a.identifier).localeCompare(b.name || b.identifier, undefined, { sensitivity: 'base' })
		);
		rows.push({ identifier, items: sorted });
	}
	rows.sort((a, b) => {
		const ia = DASHBOARD_PLATFORM_ROW_ORDER.indexOf(a.identifier);
		const ib = DASHBOARD_PLATFORM_ROW_ORDER.indexOf(b.identifier);
		const sa = ia === -1 ? 999 : ia;
		const sb = ib === -1 ? 999 : ib;
		if (sa !== sb) return sa - sb;
		return a.identifier.localeCompare(b.identifier, undefined, { sensitivity: 'base' });
	});
	return rows;
}

type ChannelGroupAcc = WorkspaceChannelGroupViewModel & { items: CreateSocialPostChannelViewModel[] };

function buildChannelGroupSectionsVm(
	channels: readonly CreateSocialPostChannelViewModel[]
): DashboardChannelGroupViewModel[] {
	const map = new Map<string, ChannelGroupAcc>();
	for (const ch of channels) {
		if (!ch.group) continue;
		if (!map.has(ch.group.id)) {
			map.set(ch.group.id, { id: ch.group.id, name: ch.group.name, items: [] });
		}
		map.get(ch.group.id)!.items.push(ch);
	}
	const groups: DashboardChannelGroupViewModel[] = [];
	for (const g of map.values()) {
		g.items.sort((a, b) =>
			(a.name || a.identifier).localeCompare(b.name || b.identifier, undefined, { sensitivity: 'base' })
		);
		groups.push({
			id: g.id,
			name: g.name,
			items: g.items,
			platformRows: buildPlatformChannelRowsVm(g.items)
		});
	}
	groups.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
	return groups;
}

type DashboardIntegrationsLoadStatus = 'idle' | 'loading' | 'ready' | 'error';
type ChannelGroupsLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export type DashboardChannelMutationViewModel = { ok: true } | { ok: false; error: string };

export type DashboardPostConnectQueryViewModel =
	| { handled: false }
	| { handled: true; successToastMessage?: string };

/**
 * Account `/account` dashboard: workspace channels, channel groups, post-connect query handling, OAuth continue URLs.
 */
export class ProtectedDashboardPagePresenter {
	// --- Raw list + status (integrations API) ---
	connectedChannelsVm = $state<CreateSocialPostChannelViewModel[]>([]);
	listStatus = $state<DashboardIntegrationsLoadStatus>('idle');
	channelGroupsVm = $state<WorkspaceChannelGroupViewModel[]>([]);
	channelGroupsStatus = $state<ChannelGroupsLoadStatus>('idle');
	showOnboardingWelcome = $state(false);

	/** Coalesces overlapping list + channel-group loads (same navigation tick, post-connect, etc.). */
	private dashboardListsInflight: Promise<void> | null = null;

	// --- Derived rows for menus / sections (built from connectedChannelsVm) ---
	/** Grouped by integration `type` for dashboard menus. */
	menuGroups = $derived.by(() => buildDashboardChannelMenuGroupsVm(this.connectedChannelsVm));

	/** Grouped by integration `identifier` (one row per provider on the account dashboard). */
	platformChannelRows = $derived.by(() => buildPlatformChannelRowsVm(this.connectedChannelsVm));

	/** Channels with a workspace channel group, for collapsible sidebar sections. */
	channelGroupSections = $derived.by(() => buildChannelGroupSectionsVm(this.connectedChannelsVm));

	/** Same as {@link platformChannelRows} but only channels not assigned to a channel group. */
	platformChannelRowsUngrouped = $derived.by(() =>
		buildPlatformChannelRowsVm(this.connectedChannelsVm.filter((c) => !c.group))
	);

	constructor(
		private readonly integrationsRepository: IntegrationsRepository,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter,
		readonly createSocialPostPresenter: CreateSocialPostPresenter
	) {}

	// --- OAuth continue URLs (optional `oauthReturnTo` for calendar/analytics) ---
	/**
	 * Absolute OAuth continue URL for a channel.
	 * When `oauthReturnTo` is omitted, `returnTo` is the routed account root (same as dashboard / calendar).
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
	async loadDashboardLists(): Promise<void> {
		if (this.dashboardListsInflight) return this.dashboardListsInflight;
		const orgId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			this.connectedChannelsVm = [];
			this.listStatus = 'idle';
			this.channelGroupsVm = [];
			this.channelGroupsStatus = 'idle';
			return;
		}
		this.dashboardListsInflight = (async () => {
			await Promise.all([this.loadConnectedIntegrations(), this.loadChannelGroups()]);
		})();
		try {
			await this.dashboardListsInflight;
		} finally {
			this.dashboardListsInflight = null;
		}
	}

	async loadConnectedIntegrations(): Promise<void> {
		const orgId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			this.connectedChannelsVm = [];
			this.listStatus = 'idle';
			this.channelGroupsVm = [];
			this.channelGroupsStatus = 'idle';
			return;
		}
		this.listStatus = 'loading';
		try {
			const rows = await this.integrationsRepository.listConnectedIntegrations(orgId);
			this.connectedChannelsVm = rows.map(toCreateSocialPostChannelViewModel);
			this.listStatus = 'ready';
		} catch {
			this.listStatus = 'error';
			this.connectedChannelsVm = [];
			this.channelGroupsVm = [];
			this.channelGroupsStatus = 'error';
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
	): Promise<DashboardChannelMutationViewModel> {
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

	async removeChannel(integrationId: string): Promise<DashboardChannelMutationViewModel> {
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

	async setChannelDisabled(integrationId: string, disabled: boolean): Promise<DashboardChannelMutationViewModel> {
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
	): Promise<DashboardChannelMutationViewModel> {
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
	): Promise<DashboardPostConnectQueryViewModel> {
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
		await this.loadDashboardLists();
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
	}
}
