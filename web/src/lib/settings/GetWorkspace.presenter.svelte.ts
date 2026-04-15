import type { SettingsRepository, OrganizationWithRoleProgrammerModel } from '$lib/settings/Settings.repository.svelte';
import type { ProfileRepository } from '$lib/account/Profile.repository.svelte';
import { authenticationRepository } from '$lib/user-auth/index';

export interface WorkspaceCardViewModel {
	id: string;
	name: string;
	subtitle: string;
	workspaceRole: 'user' | 'admin' | 'superadmin';
	disabled: boolean;
}

export class GetWorkspacePresenter {
	constructor(
		private readonly settingsRepository: SettingsRepository,
		private readonly profileRepository: ProfileRepository
	) {}

	/**
	 * PM -> VM mapping lives here (stateless).
	 */
	public toCardVm(pm: OrganizationWithRoleProgrammerModel): WorkspaceCardViewModel {
		const memberLabel = pm.memberCount === 1 ? 'member' : 'members';
		return {
			id: pm.id,
			name: pm.name,
			subtitle: `${pm.memberCount} ${memberLabel}`,
			workspaceRole: pm.workspaceRole,
			disabled: pm.disabled
		};
	}

	/**
	 * Stateless "get" operation: returns view models + userId needed for mutations.
	 */
	public async getWorkspaceSettingsData(): Promise<{
		workspacesVm: WorkspaceCardViewModel[];
		userId: string | null;
	}> {
		const orgs = await this.settingsRepository.listMyOrganizations();
		const workspacesVm = orgs.map((o) => this.toCardVm(o));
		// Avoid a redundant GET /users/me when root `checkAuth` already populated `currentUser`.
		const cachedId = authenticationRepository.currentUser?.id ?? null;
		if (cachedId) {
			return { workspacesVm, userId: cachedId };
		}
		const profile = await this.profileRepository.getProfile();
		return {
			workspacesVm,
			userId: profile?.id ?? null
		};
	}
}

