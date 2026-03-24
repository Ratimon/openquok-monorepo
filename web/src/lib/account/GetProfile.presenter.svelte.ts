import type { ProfileRepository, UserProfileProgrammerModel } from '$lib/account/Profile.repository.svelte';
import type { AccountProfileViewModel } from '$lib/account/EditorAccountSettings.presenter.svelte';

/**
 * GetProfile presenter (stateless): calls repository and maps PM -> VM.
 */
export class GetProfilePresenter {
	constructor(private readonly profileRepository: ProfileRepository) {
		this.profileRepository = profileRepository;
	}

	public toProfileVm(profilePm: UserProfileProgrammerModel): AccountProfileViewModel {
		return {
			id: profilePm.id ?? null,
			fullName: profilePm.fullName ?? null,
			email: profilePm.email ?? null,
			avatarUrl: profilePm.avatarUrl ?? null,
			websiteUrl: profilePm.websiteUrl ?? null
		};
	}

	public async loadProfileVm(): Promise<AccountProfileViewModel | null> {
		const profilePm = await this.profileRepository.getProfile();
		return profilePm ? this.toProfileVm(profilePm) : null;
	}
}

