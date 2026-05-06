import type { IntegrationsRepository } from '$lib/integrations/Integrations.repository.svelte';
import type { CreateSocialPostPresenter } from '$lib/posts/CreateSocialPost.presenter.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';

import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

import { parsePostingTimeSlots } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

function toCreateSocialPostChannelViewModelFromIntegrationPm(pm: {
	id: string;
	internalId: string;
	name: string;
	identifier: string;
	picture: string | null;
	type: string;
	disabled: boolean;
	inBetweenSteps: boolean;
	refreshNeeded: boolean;
	group?: { id: string; name: string } | null;
	time?: unknown;
}): CreateSocialPostChannelViewModel {
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
	return {
		id: pm.id,
		internalId: pm.internalId,
		name: pm.name,
		identifier: pm.identifier,
		picture: pm.picture,
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

export type PayloadWizardChannelsLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Account `/account/payload-wizard`: load connected channels and expose the shared composer instance.
 *
 * This page intentionally does not depend on `ProtectedDashboardPagePresenter` to avoid cross-page
 * reach-through; it owns its own connected-channel list state for the wizard.
 */
export class ProtectedPayloadWizardPagePresenter {
	connectedChannelsVm = $state<CreateSocialPostChannelViewModel[]>([]);
	listStatus = $state<PayloadWizardChannelsLoadStatus>('idle');

	private channelsInflight: Promise<void> | null = null;

	constructor(
		private readonly integrationsRepository: IntegrationsRepository,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter,
		readonly createSocialPostPresenter: CreateSocialPostPresenter
	) {}

	/**
	 * Loads connected integrations for the current workspace and maps them into UI rows.
	 * Coalesces overlapping calls to prevent duplicate HTTP.
	 */
	async loadConnectedChannels(): Promise<void> {
		if (this.channelsInflight) return this.channelsInflight;
		const orgId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			this.connectedChannelsVm = [];
			this.listStatus = 'idle';
			return;
		}
		this.channelsInflight = (async () => {
			this.listStatus = 'loading';
			try {
				const rowsPm = await this.integrationsRepository.listConnectedIntegrations(orgId);
				this.connectedChannelsVm = rowsPm.map(toCreateSocialPostChannelViewModelFromIntegrationPm);
				this.listStatus = 'ready';
			} catch {
				this.connectedChannelsVm = [];
				this.listStatus = 'error';
			}
		})();
		try {
			await this.channelsInflight;
		} finally {
			this.channelsInflight = null;
		}
	}

	/**
	 * Run in a `$effect`: when a workspace id exists, keep the wizard’s channel list hydrated.
	 */
	syncWorkspaceConnectedChannels(): void {
		const orgId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) return;
		void this.loadConnectedChannels();
	}
}
