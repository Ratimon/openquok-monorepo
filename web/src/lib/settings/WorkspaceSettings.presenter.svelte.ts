import type { SettingsRepository } from '$lib/settings/Settings.repository.svelte';
import type { TeamMemberProgrammerModel } from '$lib/settings/Settings.repository.svelte';
import {
	GetWorkspacePresenter,
	type WorkspaceCardViewModel
} from '$lib/settings/GetWorkspace.presenter.svelte';

export interface TeamMemberViewModel {
	id: string;
	userId: string;
	displayName: string;
	workspaceRole: 'user' | 'admin' | 'superadmin';
}

export interface PendingInviteViewModel {
	id: string;
	organizationId: string;
	organizationName: string;
	role: string;
	expiresAt: string;
}

function toTeamMemberVm(pm: TeamMemberProgrammerModel): TeamMemberViewModel {
	const displayName = pm.fullName?.trim() || pm.email || 'Unknown';
	const roleLabel: Record<string, 'user' | 'admin' | 'superadmin'> = {
		superadmin: 'superadmin',
		admin: 'admin',
		user: 'user'
	};
	return {
		id: pm.id,
		userId: pm.userId,
		displayName,
		workspaceRole: roleLabel[pm.workspaceRole] ?? 'user'
	};
}

/**
 * Workspace settings presenter (feature entrypoint).
 *
 * Pattern: Keep a top-level "feature presenter" file while delegating read/mapping logic
 * to a `Get*.presenter`.
 */
export enum WorkspaceSettingsStatus {
	IDLE = 'IDLE',
	LOADING = 'LOADING',
	CREATING = 'CREATING',
	LEAVING = 'LEAVING',
	LOADING_TEAM = 'LOADING_TEAM',
	INVITING = 'INVITING',
	VALIDATING_INVITE = 'VALIDATING_INVITE',
	JOINING_BY_TOKEN = 'JOINING_BY_TOKEN'
}

export class WorkspaceSettingsPresenter {
	public status = $state<WorkspaceSettingsStatus>(WorkspaceSettingsStatus.IDLE);
	public showToastMessage = $state(false);
	public toastMessage = $state('');
	public toastIsError = $state(false);

	public workspacesVm = $state<WorkspaceCardViewModel[]>([]);
	public currentWorkspaceId = $state<string | null>(null);
	public teamMembersVm = $state<TeamMemberViewModel[]>([]);

	public currentWorkspaceRole = $state<'user' | 'admin' | 'superadmin' | null>(null);

	public pendingInvitesVm = $state<PendingInviteViewModel[]>([]);
	public loadingPendingInvites = $state(false);
	public acceptingInviteId = $state<string | null>(null);

	/** Join-org (token link) flow */
	public inviteOrganizationName = $state('');
	public inviteRole = $state('');
	public validateInviteError = $state<string | null>(null);
	public joinByTokenError = $state<string | null>(null);

	private userId: string | null = null;

	constructor(
		private readonly settingsRepository: SettingsRepository,
		private readonly getWorkspacePresenter: GetWorkspacePresenter
	) {}

	private updateCurrentWorkspaceRole() {
		const current = this.workspacesVm.find((w) => w.id === this.currentWorkspaceId);
		this.currentWorkspaceRole = current?.workspaceRole ?? null;
	}

	public get canInviteInCurrentWorkspace(): boolean {
		return this.currentWorkspaceRole === 'admin' || this.currentWorkspaceRole === 'superadmin';
	}

	public async load(): Promise<void> {
		this.status = WorkspaceSettingsStatus.LOADING;
		try {
			const { workspacesVm, userId } = await this.getWorkspacePresenter.getWorkspaceSettingsData();
			this.userId = userId;
			this.workspacesVm = workspacesVm;
			this.teamMembersVm = [];
			if (this.workspacesVm.length > 0 && !this.currentWorkspaceId) {
				this.currentWorkspaceId = this.workspacesVm[0]?.id ?? null;
			}
			this.updateCurrentWorkspaceRole();
			if (this.currentWorkspaceId) {
				await this.loadTeam(this.currentWorkspaceId);
			}
		} finally {
			this.status = WorkspaceSettingsStatus.IDLE;
		}
	}

	public switchWorkspace(workspaceId: string) {
		this.currentWorkspaceId = workspaceId;
		this.teamMembersVm = [];
		this.updateCurrentWorkspaceRole();
		this.loadTeam(workspaceId);
		this.toastMessage = 'Switched workspace.';
		this.toastIsError = false;
		this.showToastMessage = true;
	}

	public async createWorkspace(defaultName = 'My Workspace'): Promise<{ success: boolean; message: string }> {
		this.status = WorkspaceSettingsStatus.CREATING;
		try {
			const createdPm = await this.settingsRepository.createOrganization({ name: defaultName });
			if (!createdPm) {
				const msg = 'Failed to create workspace. Please try again.';
				this.toastMessage = msg;
				this.toastIsError = true;
				this.showToastMessage = true;
				return { success: false, message: msg };
			}
			await this.load();
			this.toastMessage = 'Workspace created.';
			this.toastIsError = false;
			this.showToastMessage = true;
			return { success: true, message: 'Workspace created.' };
		} finally {
			this.status = WorkspaceSettingsStatus.IDLE;
		}
	}

	public async leaveWorkspace(workspaceId: string): Promise<{ success: boolean; message: string }> {
		if (!this.userId) {
			const msg = 'Could not determine your user. Please refresh and try again.';
			this.toastMessage = msg;
			this.toastIsError = true;
			this.showToastMessage = true;
			return { success: false, message: msg };
		}
		this.status = WorkspaceSettingsStatus.LEAVING;
		try {
			const resultPm = await this.settingsRepository.leaveWorkspace({
				organizationId: workspaceId,
				userId: this.userId
			});
			if (!resultPm.success) {
				const msg = resultPm.message ?? 'Failed to leave workspace.';
				this.toastMessage = msg;
				this.toastIsError = true;
				this.showToastMessage = true;
				return { success: false, message: msg };
			}

			// Update VM from repository state (PM -> VM via GetWorkspace presenter mapping).
			this.workspacesVm = this.settingsRepository.organizationsPm.map((o) =>
				this.getWorkspacePresenter.toCardVm(o)
			);
			if (this.currentWorkspaceId === workspaceId) {
				this.currentWorkspaceId = this.workspacesVm[0]?.id ?? null;
			}
			this.updateCurrentWorkspaceRole();
			this.toastMessage = 'You left the workspace.';
			this.toastIsError = false;
			this.showToastMessage = true;
			return { success: true, message: 'You left the workspace.' };
		} finally {
			this.status = WorkspaceSettingsStatus.IDLE;
		}
	}

	public async loadTeam(organizationId: string): Promise<void> {
		this.status = WorkspaceSettingsStatus.LOADING_TEAM;
		try {
			const membersPm = await this.settingsRepository.getTeam(organizationId);
			this.teamMembersVm = membersPm.map(toTeamMemberVm);
		} finally {
			this.status = WorkspaceSettingsStatus.IDLE;
		}
	}

	public async inviteTeamMember(
		organizationId: string,
		params: { email: string; role?: 'user' | 'admin'; sendEmail?: boolean }
	): Promise<{ success: boolean; message: string }> {
		this.status = WorkspaceSettingsStatus.INVITING;
		try {
			const resultPm = await this.settingsRepository.inviteTeamMember(organizationId, params);
			if (resultPm.success) {
				await this.loadTeam(organizationId);
				this.toastMessage = 'Invitation sent.';
				this.toastIsError = false;
				this.showToastMessage = true;
				return { success: true, message: resultPm.message ?? 'Invitation sent.' };
			}
			this.toastMessage = resultPm.message ?? 'Invite failed.';
			this.toastIsError = true;
			this.showToastMessage = true;
			return { success: false, message: resultPm.message ?? 'Invite failed.' };
		} finally {
			this.status = WorkspaceSettingsStatus.IDLE;
		}
	}

	public async loadPendingInvites(): Promise<void> {
		this.loadingPendingInvites = true;
		try {
			const listPm = await this.settingsRepository.getPendingInvites();
			this.pendingInvitesVm = listPm.map((p) => ({
				id: p.id,
				organizationId: p.organizationId,
				organizationName: p.organizationName,
				role: p.workspaceRole,
				expiresAt: p.expiresAt
			}));
		} finally {
			this.loadingPendingInvites = false;
		}
	}

	public async acceptPendingInvite(inviteId: string): Promise<{ success: boolean; message: string }> {
		this.acceptingInviteId = inviteId;
		try {
			const resultPm = await this.settingsRepository.acceptPendingInvite(inviteId);
			if (resultPm.success) {
				this.pendingInvitesVm = this.pendingInvitesVm.filter((p) => p.id !== inviteId);
				await this.load();
				this.toastMessage = 'You joined the workspace.';
				this.toastIsError = false;
				this.showToastMessage = true;
				return { success: true, message: 'You joined the workspace.' };
			}
			this.toastMessage = resultPm.message ?? 'Failed to accept invite.';
			this.toastIsError = true;
			this.showToastMessage = true;
			return { success: false, message: resultPm.message ?? 'Failed to accept invite.' };
		} finally {
			this.acceptingInviteId = null;
		}
	}

	public async validateInviteToken(token: string): Promise<void> {
		this.validateInviteError = null;
		this.inviteOrganizationName = '';
		this.inviteRole = '';
		if (!token?.trim()) {
			this.validateInviteError = 'This invite link is missing a token or is malformed.';
			return;
		}
		this.status = WorkspaceSettingsStatus.VALIDATING_INVITE;
		try {
			const dataPm = await this.settingsRepository.validateInviteToken(token);
			if (dataPm) {
				this.inviteOrganizationName = dataPm.organizationName;
				this.inviteRole = dataPm.role;
			} else {
				this.validateInviteError = 'This invite is invalid, expired, or the workspace no longer exists.';
			}
		} catch {
			this.validateInviteError = 'Unable to validate this invite. Please check your connection and try again.';
		} finally {
			this.status = WorkspaceSettingsStatus.IDLE;
		}
	}

	public async joinByToken(token: string): Promise<{ success: boolean; message: string }> {
		this.joinByTokenError = null;
		this.status = WorkspaceSettingsStatus.JOINING_BY_TOKEN;
		try {
			const resultPm = await this.settingsRepository.joinByToken(token);
			if (resultPm.success) {
				return { success: true, message: '' };
			}
			this.joinByTokenError = resultPm.message ?? 'Failed to join this workspace. Please try again.';
			return { success: false, message: this.joinByTokenError };
		} finally {
			this.status = WorkspaceSettingsStatus.IDLE;
		}
	}
}

export type { WorkspaceCardViewModel };

