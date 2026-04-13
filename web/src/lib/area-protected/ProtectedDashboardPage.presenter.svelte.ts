import type {
	ConnectedIntegrationProgrammerModel,
	IntegrationsRepository
} from '$lib/integrations/Integrations.repository.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';

/** One scheduled posting slot: minutes after midnight (0–1439), matching `integrations.posting_times` JSON. */
export type PostingTimeSlot = { time: number };

/**
 * Connected channel row for the account dashboard (presenter / UI). No repository DTO shape.
 */
export interface DashboardConnectedChannelViewModel {
	id: string;
	internalId: string;
	name: string;
	identifier: string;
	picture: string | null;
	type: string;
	disabled: boolean;
	inBetweenSteps: boolean;
	refreshNeeded: boolean;
	/** Workspace channel group this channel belongs to, if any. */
	group: { id: string; name: string } | null;
	/** Parsed `posting_times` from the API (deduplicated, sorted by `time`). */
	postingTimes: PostingTimeSlot[];
}

const MINUTES_PER_DAY = 24 * 60;

/** Normalizes list API `time` payloads into unique minute-of-day values. */
export function parsePostingTimeSlots(raw: unknown): PostingTimeSlot[] {
	if (!Array.isArray(raw)) return [];
	const seen = new Set<number>();
	const out: PostingTimeSlot[] = [];
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

function toDashboardConnectedChannelViewModel(
	pm: ConnectedIntegrationProgrammerModel
): DashboardConnectedChannelViewModel {
	return {
		id: pm.id,
		internalId: pm.internalId,
		name: pm.name,
		identifier: pm.identifier,
		picture: pm.picture,
		type: pm.type,
		disabled: pm.disabled,
		inBetweenSteps: pm.inBetweenSteps,
		refreshNeeded: pm.refreshNeeded,
		group: pm.group ?? null,
		postingTimes: parsePostingTimeSlots(pm.time)
	};
}

/** Collapsible menu section on the account dashboard (grouped by channel `type`). */
export interface DashboardConnectedChannelMenuGroupViewModel {
	label: string;
	items: DashboardConnectedChannelViewModel[];
}

/** One row per integration provider (`identifier`): platform icon + its connected channels. */
export interface DashboardPlatformChannelRowViewModel {
	identifier: string;
	items: DashboardConnectedChannelViewModel[];
}

/** Channels assigned to the same workspace channel group (sidebar section). */
export interface DashboardChannelGroupViewModel {
	id: string;
	name: string;
	items: DashboardConnectedChannelViewModel[];
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

function buildDashboardChannelMenuGroups(
	channels: readonly DashboardConnectedChannelViewModel[]
): DashboardConnectedChannelMenuGroupViewModel[] {
	const map = new Map<string, DashboardConnectedChannelViewModel[]>();
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

function buildPlatformChannelRows(
	channels: readonly DashboardConnectedChannelViewModel[]
): DashboardPlatformChannelRowViewModel[] {
	const map = new Map<string, DashboardConnectedChannelViewModel[]>();
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

type ChannelGroupAcc = { id: string; name: string; items: DashboardConnectedChannelViewModel[] };

function buildChannelGroupSections(
	channels: readonly DashboardConnectedChannelViewModel[]
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
			platformRows: buildPlatformChannelRows(g.items)
		});
	}
	groups.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
	return groups;
}

type DashboardIntegrationsLoadStatus = 'idle' | 'loading' | 'ready' | 'error';
type ChannelGroupsLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export type DashboardChannelMutationResult = { ok: true } | { ok: false; error: string };

export type DashboardPostConnectQueryResult =
	| { handled: false }
	| { handled: true; successToastMessage?: string };

/**
 * Account dashboard: workspace channels list and post-OAuth landing feedback (`?added=&msg=&onboarding=`).
 */
export class ProtectedDashboardPagePresenter {
	connectedChannels = $state<DashboardConnectedChannelViewModel[]>([]);
	listStatus = $state<DashboardIntegrationsLoadStatus>('idle');
	channelGroups = $state<{ id: string; name: string }[]>([]);
	channelGroupsStatus = $state<ChannelGroupsLoadStatus>('idle');
	showOnboardingWelcome = $state(false);


	/** Grouped by integration `type` for dashboard menus. */
	menuGroups = $derived.by(() => buildDashboardChannelMenuGroups(this.connectedChannels));

	/** Grouped by integration `identifier` (one row per provider on the account dashboard). */
	platformChannelRows = $derived.by(() => buildPlatformChannelRows(this.connectedChannels));

	/** Channels with a workspace channel group, for collapsible sidebar sections. */
	channelGroupSections = $derived.by(() => buildChannelGroupSections(this.connectedChannels));

	/** Same as {@link platformChannelRows} but only channels not assigned to a channel group. */
	platformChannelRowsUngrouped = $derived.by(() =>
		buildPlatformChannelRows(this.connectedChannels.filter((c) => !c.group))
	);

	constructor(
		private readonly integrationsRepository: IntegrationsRepository,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter
	) {}

	async loadConnectedIntegrations(): Promise<void> {
		const orgId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			this.connectedChannels = [];
			this.listStatus = 'idle';
			this.channelGroups = [];
			this.channelGroupsStatus = 'idle';
			return;
		}
		this.listStatus = 'loading';
		try {
			const rows = await this.integrationsRepository.listConnectedIntegrations(orgId);
			this.connectedChannels = rows.map(toDashboardConnectedChannelViewModel);
			this.listStatus = 'ready';
		} catch {
			this.listStatus = 'error';
			this.connectedChannels = [];
			this.channelGroups = [];
			this.channelGroupsStatus = 'error';
		}
	}

	async loadChannelGroups(): Promise<void> {
		const orgId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			this.channelGroups = [];
			this.channelGroupsStatus = 'idle';
			return;
		}
		this.channelGroupsStatus = 'loading';
		try {
			this.channelGroups = await this.integrationsRepository.listChannelCustomers(orgId);
			this.channelGroupsStatus = 'ready';
		} catch {
			this.channelGroupsStatus = 'error';
			this.channelGroups = [];
		}
	}

	async createChannelGroup(
		name: string
	): Promise<{ ok: true; id: string; name: string } | { ok: false; error: string }> {
		const orgId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			return { ok: false, error: 'No workspace selected.' };
		}
		const res = await this.integrationsRepository.createChannelCustomer({ organizationId: orgId, name });
		if (res.ok) {
			this._insertChannelGroupSorted({ id: res.id, name: res.name });
			return { ok: true, id: res.id, name: res.name };
		}
		return { ok: false, error: res.error };
	}

	/**
	 * Assign or clear workspace channel group on an integration. On success, patches
	 * `connectedChannels` in place (no full list refetch). Pass `groupDisplayName` when the
	 * label is known from the UI and may not yet appear in `channelGroups`.
	 */
	async assignChannelGroup(
		integrationId: string,
		groupId: string | null,
		groupDisplayName?: string | null
	): Promise<DashboardChannelMutationResult> {
		const orgId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			return { ok: false, error: 'No workspace selected.' };
		}
		const res = await this.integrationsRepository.assignChannelCustomer({
			organizationId: orgId,
			integrationId,
			customerId: groupId
		});
		if (res.ok) {
			const group: { id: string; name: string } | null =
				groupId === null
					? null
					: {
							id: groupId,
							name: (() => {
								const n = (
									groupDisplayName?.trim() ||
									this.channelGroups.find((g) => g.id === groupId)?.name ||
									''
								).trim();
								return n || 'Channel group';
							})()
						};
			this._patchIntegrationGroup(integrationId, group);
			return { ok: true };
		}
		return { ok: false, error: res.error };
	}

	dismissOnboardingWelcome(): void {
		this.showOnboardingWelcome = false;
	}

	async removeChannel(integrationId: string): Promise<DashboardChannelMutationResult> {
		const orgId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			return { ok: false, error: 'No workspace selected.' };
		}
		const res = await this.integrationsRepository.deleteChannel({
			organizationId: orgId,
			integrationId
		});
		if (res.ok) {
			await this.loadConnectedIntegrations();
			return { ok: true };
		}
		return { ok: false, error: res.error };
	}

	async setChannelDisabled(integrationId: string, disabled: boolean): Promise<DashboardChannelMutationResult> {
		const orgId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			return { ok: false, error: 'No workspace selected.' };
		}
		const res = await this.integrationsRepository.setChannelDisabled({
			organizationId: orgId,
			integrationId,
			disabled
		});
		if (res.ok) {
			await this.loadConnectedIntegrations();
			return { ok: true };
		}
		return { ok: false, error: res.error };
	}

	async setPostingTimes(
		integrationId: string,
		slots: PostingTimeSlot[]
	): Promise<DashboardChannelMutationResult> {
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
	): Promise<DashboardPostConnectQueryResult> {
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
		await this.loadConnectedIntegrations();
		return successToastMessage !== undefined
			? { handled: true, successToastMessage }
			: { handled: true };
	}

	private _insertChannelGroupSorted(entry: { id: string; name: string }): void {
		if (this.channelGroups.some((g) => g.id === entry.id)) return;
		this.channelGroups = [...this.channelGroups, entry].sort((a, b) =>
			a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
		);
		if (this.channelGroups.length > 0) {
			this.channelGroupsStatus = 'ready';
		}
	}

	private _patchIntegrationGroup(
		integrationId: string,
		group: { id: string; name: string } | null
	): void {
		const idx = this.connectedChannels.findIndex((c) => c.id === integrationId);
		if (idx < 0) return;
		const prev = this.connectedChannels[idx];
		this.connectedChannels = [
			...this.connectedChannels.slice(0, idx),
			{ ...prev, group },
			...this.connectedChannels.slice(idx + 1)
		];
	}

	private _patchIntegrationPostingTimes(integrationId: string, slots: PostingTimeSlot[]): void {
		const idx = this.connectedChannels.findIndex((c) => c.id === integrationId);
		if (idx < 0) return;
		const prev = this.connectedChannels[idx];
		const sorted = [...slots].sort((a, b) => a.time - b.time);
		this.connectedChannels = [
			...this.connectedChannels.slice(0, idx),
			{ ...prev, postingTimes: sorted },
			...this.connectedChannels.slice(idx + 1)
		];
	}
}
