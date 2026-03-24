import { httpGateway } from '$lib/core/index';
import type { AccountConfig } from '$lib/account/Profile.repository.svelte';
import { ProfileRepository } from '$lib/account/Profile.repository.svelte';
import { GetProfilePresenter } from '$lib/account/GetProfile.presenter.svelte';
import { EditorAccountSettingsPresenter } from './EditorAccountSettings.presenter.svelte';

const accountConfig: AccountConfig = {
	endpoints: {
		me: '/api/v1/users/me',
		mePassword: '/api/v1/users/me/password',
		meRequestChangePassword: '/api/v1/users/me/request-change-password'
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
	type AccountChangePasswordFormSchemaType,
	type AccountFullNameFormSchemaType,
	type AccountAvatarDetailsFormSchemaType,
	type AccountWebsiteFormSchemaType,
	type AccountProfileDetailsFormSchemaType
} from '$lib/account/account.types';
