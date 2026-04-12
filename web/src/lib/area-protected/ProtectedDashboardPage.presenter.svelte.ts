import type {
	ConnectedIntegrationProgrammerModel,
	IntegrationsRepository
} from '$lib/integrations/Integrations.repository.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';

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
		refreshNeeded: pm.refreshNeeded
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

type DashboardIntegrationsLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

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
	showOnboardingWelcome = $state(false);


	/** Grouped by integration `type` for dashboard menus. */
	menuGroups = $derived.by(() => buildDashboardChannelMenuGroups(this.connectedChannels));

	/** Grouped by integration `identifier` (one row per provider on the account dashboard). */
	platformChannelRows = $derived.by(() => buildPlatformChannelRows(this.connectedChannels));

	constructor(
		private readonly integrationsRepository: IntegrationsRepository,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter
	) {}

	async loadConnectedIntegrations(): Promise<void> {
		const orgId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			this.connectedChannels = [];
			this.listStatus = 'idle';
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
		}
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
}
