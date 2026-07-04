import { httpGateway } from '$lib/core/index';
import type { AccountConfig } from '$lib/account/Profile.repository.svelte';
import { ProfileRepository } from '$lib/account/Profile.repository.svelte';
import { GetProfilePresenter } from '$lib/account/GetProfile.presenter.svelte';
import { EditorAccountSettingsPresenter } from './EditorAccountSettings.presenter.svelte';

const accountConfig: AccountConfig = {
	endpoints: {
		me: '/api/v1/users/me',
		meUsernameAvailable: '/api/v1/users/me/username-available',
		mePassword: '/api/v1/users/me/password',
		meRequestChangePassword: '/api/v1/users/me/request-change-password',
		organizations: '/api/v1/users/organizations',
		changeOrg: '/api/v1/users/change-org',
		joinOrg: '/api/v1/users/join-org',
		subscription: '/api/v1/users/subscription'
	}
};

export const profileRepository = new ProfileRepository(httpGateway, accountConfig);
export const getProfilePresenter = new GetProfilePresenter(profileRepository);
export const editorAccountSettingsPresenter = new EditorAccountSettingsPresenter(
	profileRepository,
	getProfilePresenter
);

export { ProfileRepository } from '$lib/account/Profile.repository.svelte';
export type {
	AccountConfig,
	UserProfileDto,
	GetProfileResponseDto,
	UpdateProfileResponseDto,
	UpdatePasswordResponseDto,
	RequestChangePasswordEmailResponseDto,
	UserProfileProgrammerModel,
	UpdateProfileProgrammerModel,
	UpdatePasswordProgrammerModel,
	RequestChangePasswordEmailProgrammerModel
} from '$lib/account/Profile.repository.svelte';
export type { AccountProfileViewModel, ProfileFieldsPatch } from './EditorAccountSettings.presenter.svelte';
export { EditorAccountSettingsPresenter, UpdateProfileStatus } from './EditorAccountSettings.presenter.svelte';
export { GetProfilePresenter } from '$lib/account/GetProfile.presenter.svelte';
export {
	accountChangePasswordFormSchema,
	accountFullNameFormSchema,
	accountAvatarDetailsFormSchema,
	accountWebsiteFormSchema,
	accountProfileDetailsFormSchema,
	accountUsernameFormSchema,
	type AccountChangePasswordFormSchemaType,
	type AccountFullNameFormSchemaType,
	type AccountAvatarDetailsFormSchemaType,
	type AccountWebsiteFormSchemaType,
	type AccountProfileDetailsFormSchemaType,
	type AccountUsernameFormSchemaType
} from '$lib/account/account.types';
