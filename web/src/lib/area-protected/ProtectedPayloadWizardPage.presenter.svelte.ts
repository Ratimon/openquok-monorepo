import type { IntegrationsRepository } from '$lib/integrations/Integrations.repository.svelte';
import type { CreateSocialPostPresenter } from '$lib/posts/CreateSocialPost.presenter.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';
import type {
	CreateSocialPostChannelViewModel,
	GetChannelPresenter
} from '$lib/channels/GetChannel.presenter.svelte';

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
		readonly createSocialPostPresenter: CreateSocialPostPresenter,
		private readonly getChannelPresenter: GetChannelPresenter
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
				this.connectedChannelsVm = rowsPm.map((pm) =>
					this.getChannelPresenter.toCreateSocialPostChannelViewModel(pm)
				);
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
