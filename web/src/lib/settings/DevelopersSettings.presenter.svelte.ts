import type { SettingsRepository } from '$lib/settings/Settings.repository.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';

export enum DevelopersSettingsStatus {
	IDLE = 'IDLE',
	ROTATING = 'ROTATING',
	LOADING_STATUS = 'LOADING_STATUS'
}

export class DevelopersSettingsPresenter {
	public status = $state<DevelopersSettingsStatus>(DevelopersSettingsStatus.IDLE);
	public tokenVisible = $state(false);
	public showToastMessage = $state(false);
	public toastMessage = $state('');
	public toastIsError = $state(false);
	public publicApiEnabled = $state<boolean | null>(null);
	/** Plaintext token shown once after rotate/generate; not persisted in org list. */
	public programmaticAccessToken = $state<string | null>(null);
	/** Whether an active programmatic token exists server-side for this workspace. */
	public programmaticAccessConfigured = $state<boolean | null>(null);

	constructor(
		private readonly settingsRepository: SettingsRepository,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter
	) {}

	get currentWorkspaceId(): string | null {
		return this.workspaceSettingsPresenter.currentWorkspaceId;
	}

	get canRotateProgrammaticToken(): boolean {
		if (this.publicApiEnabled === false) return false;
		const role = this.workspaceSettingsPresenter.currentWorkspaceRole;
		return role === 'admin' || role === 'owner';
	}

	public setPublicApiEnabled(enabled: boolean | null) {
		this.publicApiEnabled = enabled;
	}

	public setTokenVisible(visible: boolean) {
		this.tokenVisible = visible;
	}

	public resetProgrammaticAccessSession(): void {
		this.programmaticAccessToken = null;
		this.tokenVisible = false;
	}

	public clearProgrammaticTokenStatus(): void {
		this.programmaticAccessConfigured = null;
	}

	public async loadProgrammaticTokenStatus(): Promise<void> {
		const id = this.currentWorkspaceId;
		if (!id) {
			this.programmaticAccessConfigured = null;
			return;
		}

		this.status = DevelopersSettingsStatus.LOADING_STATUS;
		try {
			const status = await this.settingsRepository.getProgrammaticTokenStatus(id);
			this.programmaticAccessConfigured = status?.configured ?? false;
		} finally {
			this.status = DevelopersSettingsStatus.IDLE;
		}
	}

	public async rotateProgrammaticAccessToken(): Promise<void> {
		const id = this.currentWorkspaceId;
		if (!id) return;

		if (this.publicApiEnabled === false) {
			this.toastMessage = 'Public API access is not included on your current plan.';
			this.toastIsError = true;
			this.showToastMessage = true;
			return;
		}

		if (!this.canRotateProgrammaticToken) {
			this.toastMessage = 'Only workspace admins can rotate the programmatic access token.';
			this.toastIsError = true;
			this.showToastMessage = true;
			return;
		}

		this.status = DevelopersSettingsStatus.ROTATING;
		try {
			const result = await this.settingsRepository.rotateProgrammaticAccessToken(id);
			if (!result.success) {
				this.toastMessage = result.message;
				this.toastIsError = true;
				this.showToastMessage = true;
				return;
			}
			this.programmaticAccessToken = result.programmaticAccessToken;
			this.programmaticAccessConfigured = true;
			this.tokenVisible = true;
			this.toastMessage = 'Programmatic access token generated.';
			this.toastIsError = false;
			this.showToastMessage = true;
		} finally {
			this.status = DevelopersSettingsStatus.IDLE;
		}
	}
}
