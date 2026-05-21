import { httpGateway } from '$lib/core/index';
import type { SettingsConfig } from '$lib/settings/Settings.repository.svelte';
import { SettingsRepository } from '$lib/settings/Settings.repository.svelte';
import {
	ApprovedAppsRepository,
	type ApprovedAppsRepositoryConfig
} from '$lib/settings/ApprovedApps.repository.svelte';
import { ApprovedAppsSettingsPresenter } from '$lib/settings/ApprovedAppsSettings.presenter.svelte';
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
		rotateApiKey: (id) => `${base}/${id}/rotate-api-key`,
		getTeam: `${base}/team`,
		inviteTeamMember: `${base}/team`,
		getTeamById: (id) => `${base}/${id}/team`,
		inviteByOrganizationId: (id) => `${base}/${id}/invite`,
		removeTeamMember: (orgId, userId) => `${base}/${orgId}/team/${userId}`,
		listPendingInvites: `${base}/invites/pending`,
		acceptPendingInvite: (id) => `${base}/invites/${id}/accept`,
		validateInvite: `${base}/invite/validate`,
		joinByToken: `${base}/join`
	}
};

export const settingsRepository = new SettingsRepository(httpGateway, settingsConfig);

const approvedAppsBase = '/api/v1/users/me/approved-apps';
const approvedAppsConfig: ApprovedAppsRepositoryConfig = {
	list: approvedAppsBase,
	revoke: (authorizationId: string) =>
		`${approvedAppsBase}/${encodeURIComponent(authorizationId)}`
};
export const approvedAppsRepository = new ApprovedAppsRepository(httpGateway, approvedAppsConfig);
export const approvedAppsSettingsPresenter = new ApprovedAppsSettingsPresenter(approvedAppsRepository);
export const getWorkspacePresenter = new GetWorkspacePresenter(settingsRepository, profileRepository);
export const workspaceSettingsPresenter = new WorkspaceSettingsPresenter(
	settingsRepository,
	getWorkspacePresenter,
	profileRepository
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
	workspaceUpdateFormSchema,
	workspaceInviteMemberFormSchema,
	type WorkspaceCreateFormSchemaType,
	type WorkspaceUpdateFormSchemaType,
	type WorkspaceInviteMemberFormSchemaType
} from '$lib/settings/settings.types';

export { ApprovedAppsRepository } from '$lib/settings/ApprovedApps.repository.svelte';
export type {
	ApprovedAppsRepositoryConfig,
	ApprovedAuthorizationProgrammerModel,
	ApprovedOauthAppProgrammerModel,
	ListApprovedAppsProgrammerModel,
	RevokeApprovedAppMutationProgrammerModel
} from '$lib/settings/ApprovedApps.repository.svelte';
export {
	ApprovedAppsSettingsPresenter,
	ApprovedAppsSettingsStatus
} from '$lib/settings/ApprovedAppsSettings.presenter.svelte';
export type { ApprovedAppRowViewModel } from '$lib/settings/ApprovedAppsSettings.presenter.svelte';
