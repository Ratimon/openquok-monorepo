export { getRootPathAccount } from './getRootPathProtectedArea';
import { ProtectedSettingsPagePresenter, UpdateProfileStatus, WorkspaceSettingsStatus } from './ProtectedSettingsPage.presenter.svelte';
import { editorAccountSettingsPresenter } from '$lib/account';
import { workspaceSettingsPresenter } from '$lib/settings';
import { authenticationRepository } from '$lib/user-auth/index';

const protectedSettingsPagePresenter = new ProtectedSettingsPagePresenter(
	editorAccountSettingsPresenter,
	workspaceSettingsPresenter,
	authenticationRepository
);

export { ProtectedSettingsPagePresenter, UpdateProfileStatus, WorkspaceSettingsStatus, protectedSettingsPagePresenter };
