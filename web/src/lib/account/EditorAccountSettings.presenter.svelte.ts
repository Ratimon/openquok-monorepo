import type { ProfileRepository } from '$lib/account/Profile.repository.svelte';
import type { GetProfilePresenter } from '$lib/account/GetProfile.presenter.svelte';

export interface AccountProfileViewModel {
	id: string | null;
	fullName: string | null;
	email: string | null;
	avatarUrl: string | null;
	websiteUrl: string | null;
}

/** Patch for profile fields that can be updated via PATCH /users/me (no API call in setters). */
export type ProfileFieldsPatch = {
	fullName?: string;
	avatarUrl?: string | null;
	websiteUrl?: string | null;
};

export enum UpdateProfileStatus {
	UNKNOWN = 'unknown',
	UPDATING = 'updating',
	UPDATED = 'updated'
}

export class EditorAccountSettingsPresenter {
	profileVm = $state<AccountProfileViewModel | null>(null);
	loadingProfile = $state(false);

	status: UpdateProfileStatus = $state(UpdateProfileStatus.UNKNOWN);
	showToastMessage = $state(false);
	toastMessage = $state('');

	constructor(
		private readonly profileRepository: ProfileRepository,
		private readonly getProfilePresenter: GetProfilePresenter
	) {
		this.profileRepository = profileRepository;
		this.getProfilePresenter = getProfilePresenter;
	}

	async loadProfile(): Promise<void> {
		this.loadingProfile = true;
		try {
			this.profileVm = await this.getProfilePresenter.loadProfileVm();
		} finally {
			this.loadingProfile = false;
		}
	}

	/**
	 * PATCH /users/me for any combination of: full name, avatar storage path, website URL.
	 * On success, updates `profileVm` in memory (no extra load).
	 */
	async updateProfileDetails(updates: ProfileFieldsPatch): Promise<{ success: boolean; message: string }> {
		this.status = UpdateProfileStatus.UPDATING;
		const resultPm = await this.profileRepository.updateProfile(updates);
		if (resultPm.success) {
			this.setProfileFields(updates);
			this.showToastMessage = true;
			this.toastMessage = resultPm.message;
			this.status = UpdateProfileStatus.UPDATED;
		} else {
			this.showToastMessage = true;
			this.toastMessage = resultPm.message;
			this.status = UpdateProfileStatus.UNKNOWN;
		}
		return resultPm;
	}

	/**
	 * Updates profile view model in memory (no API call). Use after a successful mutation
	 * or for local UI sync without refetching.
	 */
	setProfileFields(updates: ProfileFieldsPatch): void {
		if (!this.profileVm) {
			this.profileVm = {
				id: null,
				email: null,
				fullName: updates.fullName ?? null,
				avatarUrl: updates.avatarUrl ?? null,
				websiteUrl: updates.websiteUrl ?? null
			};
			return;
		}
		this.profileVm = {
			...this.profileVm,
			...(updates.fullName !== undefined && { fullName: updates.fullName }),
			...(updates.avatarUrl !== undefined && { avatarUrl: updates.avatarUrl }),
			...(updates.websiteUrl !== undefined && { websiteUrl: updates.websiteUrl })
		};
	}

	async updatePassword(password: string): Promise<{ success: boolean; message: string }> {
		this.status = UpdateProfileStatus.UPDATING;
		const resultPm = await this.profileRepository.updatePassword(password);
		if (resultPm.success) {
			this.showToastMessage = true;
			this.toastMessage = resultPm.message;
			this.status = UpdateProfileStatus.UPDATED;
		} else {
			this.showToastMessage = true;
			this.toastMessage = resultPm.message;
			this.status = UpdateProfileStatus.UNKNOWN;
		}
		return resultPm;
	}

	async requestChangePasswordEmail(): Promise<{ success: boolean; message: string }> {
		this.status = UpdateProfileStatus.UPDATING;
		const resultPm = await this.profileRepository.requestChangePasswordEmail();
		if (resultPm.success) {
			this.showToastMessage = true;
			this.toastMessage = resultPm.message;
			this.status = UpdateProfileStatus.UPDATED;
		} else {
			this.showToastMessage = true;
			this.toastMessage = resultPm.message;
			this.status = UpdateProfileStatus.UNKNOWN;
		}
		return resultPm;
	}
}
