import type { EditorAccountSettingsPresenter } from '$lib/account/EditorAccountSettings.presenter.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';
import type { AuthenticationRepository } from '$lib/user-auth/Authentication.repository.svelte';
import type { DevelopersSettingsPresenter } from '$lib/settings/DevelopersSettings.presenter.svelte';

/**
 * Page presenter for the protected account settings page.
 * Delegates to EditorAccountSettingsPresenter and WorkspaceSettingsPresenter,
 * and syncs auth store on profile name update.
 */
export class ProtectedSettingsPagePresenter {
	constructor(
		private readonly editorAccountSettingsPresenter: EditorAccountSettingsPresenter,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter,
		private readonly developersSettingsPresenter: DevelopersSettingsPresenter,
		private readonly authenticationRepository: AuthenticationRepository
	) {}

	get accountPresenter(): EditorAccountSettingsPresenter {
		return this.editorAccountSettingsPresenter;
	}

	get workspacePresenter(): WorkspaceSettingsPresenter {
		return this.workspaceSettingsPresenter;
	}

	get developersPresenter(): DevelopersSettingsPresenter {
		return this.developersSettingsPresenter;
	}

	loadProfile(): Promise<void> {
		return this.editorAccountSettingsPresenter.loadProfile();
	}

	loadWorkspace(): Promise<void> {
		return this.workspaceSettingsPresenter.load();
	}

	loadPendingInvites(): Promise<void> {
		return this.workspaceSettingsPresenter.loadPendingInvites();
	}

	async handleUpdateProfileDetails(updates: {
		fullName?: string;
		avatarUrl?: string | null;
		websiteUrl?: string | null;
	}): Promise<{ success: boolean; message: string }> {
		const result = await this.editorAccountSettingsPresenter.updateProfileDetails(updates);
		if (result.success && updates.fullName !== undefined) {
			this.authenticationRepository.updateStoredProfile({ fullName: updates.fullName });
		}
		return result;
	}

	requestChangePasswordEmail(): Promise<{ success: boolean; message: string }> {
		return this.editorAccountSettingsPresenter.requestChangePasswordEmail();
	}

	switchWorkspace(workspaceId: string): void {
		this.workspaceSettingsPresenter.switchWorkspace(workspaceId);
	}

	createWorkspace(name: string): Promise<{ success: boolean; message: string }> {
		return this.workspaceSettingsPresenter.createWorkspace(name);
	}

	leaveWorkspace(workspaceId: string): Promise<{ success: boolean; message: string }> {
		return this.workspaceSettingsPresenter.leaveWorkspace(workspaceId);
	}

	inviteTeamMember(params: {
		email: string;
		role: 'user' | 'admin';
		sendEmail: boolean;
	}): Promise<{ success: boolean; message: string }> {
		const currentWorkspaceId = this.workspaceSettingsPresenter.currentWorkspaceId;
		if (!currentWorkspaceId) {
			return Promise.resolve({ success: false, message: 'No workspace selected.' });
		}
		return this.workspaceSettingsPresenter.inviteTeamMember(currentWorkspaceId, params);
	}

	acceptPendingInvite(inviteId: string): Promise<{ success: boolean; message: string }> {
		return this.workspaceSettingsPresenter.acceptPendingInvite(inviteId);
	}
}

export { UpdateProfileStatus } from '$lib/account/EditorAccountSettings.presenter.svelte';
export { WorkspaceSettingsStatus } from '$lib/settings/WorkspaceSettings.presenter.svelte';
