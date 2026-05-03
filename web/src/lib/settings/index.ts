import { httpGateway } from '$lib/core/index';
import type { SettingsConfig } from '$lib/settings/Settings.repository.svelte';
import { SettingsRepository } from '$lib/settings/Settings.repository.svelte';
import { profileRepository } from '$lib/account';
import { GetWorkspacePresenter } from '$lib/settings/GetWorkspace.presenter.svelte';
import { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';

const base = '/api/v1/settings';
const settingsConfig: SettingsConfig = {
	endpoints: {
		list: base,
		create: base,
		getById: (id) => `${base}/${id}`,
		update: (id) => `${base}/${id}`,
		delete: (id) => `${base}/${id}`,
		getTeam: (id) => `${base}/${id}/team`,
		invite: (id) => `${base}/${id}/invite`,
		removeTeamMember: (orgId, userId) => `${base}/${orgId}/team/${userId}`,
		listPendingInvites: `${base}/invites/pending`,
		acceptPendingInvite: (id) => `${base}/invites/${id}/accept`,
		validateInvite: `${base}/invite/validate`,
		joinByToken: `${base}/join`
	}
};

export const settingsRepository = new SettingsRepository(httpGateway, settingsConfig);
export const getWorkspacePresenter = new GetWorkspacePresenter(settingsRepository, profileRepository);
export const workspaceSettingsPresenter = new WorkspaceSettingsPresenter(
	settingsRepository,
	getWorkspacePresenter
);

export { SettingsRepository } from '$lib/settings/Settings.repository.svelte';
export type {
	SettingsConfig,
	OrganizationWithRoleDto,
	OrganizationDto,
	OrganizationProgrammerModel,
	OrganizationWithRoleProgrammerModel,
	SettingsTeamMutationProgrammerModel,
	LeaveWorkspaceProgrammerModel,
	InviteTeamMemberProgrammerModel,
	AcceptPendingInviteProgrammerModel,
	JoinWorkspaceByTokenProgrammerModel
} from '$lib/settings/Settings.repository.svelte';

export { GetWorkspacePresenter } from '$lib/settings/GetWorkspace.presenter.svelte';
export { WorkspaceSettingsPresenter, WorkspaceSettingsStatus } from '$lib/settings/WorkspaceSettings.presenter.svelte';
export type { WorkspaceCardViewModel, TeamMemberViewModel, PendingInviteViewModel } from '$lib/settings/WorkspaceSettings.presenter.svelte';
export {
	workspaceCreateFormSchema,
	workspaceInviteMemberFormSchema,
	type WorkspaceCreateFormSchemaType,
	type WorkspaceInviteMemberFormSchemaType
} from '$lib/settings/settings.types';
