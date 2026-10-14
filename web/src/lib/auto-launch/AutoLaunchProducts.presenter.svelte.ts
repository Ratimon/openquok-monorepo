import type { AutoLaunchRepository } from '$lib/auto-launch/AutoLaunch.repository';
import type { AutoLaunchProductProfileDto } from '$lib/auto-launch/auto-launch.types';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';

/** Products tab: workspace product profiles for directory launch and channel-group linking. */
export class AutoLaunchProductsPresenter {
	profilesVm = $state<AutoLaunchProductProfileDto[]>([]);
	loading = $state(false);

	constructor(
		private readonly autoLaunchRepository: AutoLaunchRepository,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter
	) {}

	get organizationId(): string {
		return this.workspaceSettingsPresenter.currentWorkspaceId ?? '';
	}

	async loadProfiles(): Promise<void> {
		const organizationId = this.organizationId;
		if (!organizationId) {
			this.profilesVm = [];
			return;
		}
		this.loading = true;
		try {
			this.profilesVm = await this.autoLaunchRepository.listProfiles(organizationId);
		} finally {
			this.loading = false;
		}
	}
}
