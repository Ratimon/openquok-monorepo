import type { SettingsRepository } from '$lib/settings/Settings.repository.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';

export enum DevelopersSettingsStatus {
	IDLE = 'IDLE',
	ROTATING = 'ROTATING'
}

export class DevelopersSettingsPresenter {
	public status = $state<DevelopersSettingsStatus>(DevelopersSettingsStatus.IDLE);
	public apiKeyVisible = $state(false);
	public showToastMessage = $state(false);
	public toastMessage = $state('');
	public toastIsError = $state(false);

	constructor(
		private readonly settingsRepository: SettingsRepository,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter
	) {}

	get currentWorkspaceId(): string | null {
		return this.workspaceSettingsPresenter.currentWorkspaceId;
	}

	get currentApiKey(): string | null {
		const id = this.currentWorkspaceId;
		if (!id) return null;
		const org = this.settingsRepository.organizationsPm.find((o) => o.id === id);
		return org?.apiKey ?? null;
	}

	get canRotateApiKey(): boolean {
		const role = this.workspaceSettingsPresenter.currentWorkspaceRole;
		return role === 'admin' || role === 'superadmin';
	}

	public setApiKeyVisible(visible: boolean) {
		this.apiKeyVisible = visible;
	}

	public async rotateApiKey(): Promise<void> {
		const id = this.currentWorkspaceId;
		if (!id) return;

		if (!this.canRotateApiKey) {
			this.toastMessage = 'Only workspace admins can rotate the API key.';
			this.toastIsError = true;
			this.showToastMessage = true;
			return;
		}

		this.status = DevelopersSettingsStatus.ROTATING;
		try {
			const updated = await this.settingsRepository.rotateApiKey(id);
			if (!updated?.apiKey) {
				this.toastMessage = 'Failed to rotate API key. Please try again.';
				this.toastIsError = true;
				this.showToastMessage = true;
				return;
			}
			this.apiKeyVisible = true;
			this.toastMessage = 'API key rotated.';
			this.toastIsError = false;
			this.showToastMessage = true;
		} finally {
			this.status = DevelopersSettingsStatus.IDLE;
		}
	}
}

