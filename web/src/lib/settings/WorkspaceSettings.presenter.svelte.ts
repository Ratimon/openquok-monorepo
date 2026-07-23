import type { ProfileRepository } from '$lib/account/Profile.repository.svelte';
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
	email: string | null;
	workspaceRole: 'user' | 'admin' | 'owner';
}

export interface SentInviteViewModel {
	id: string;
	email: string;
	workspaceRole: 'user' | 'admin';
	expiresAt: string;
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
	const roleLabel: Record<string, 'user' | 'admin' | 'owner'> = {
		owner: 'owner',
		admin: 'admin',
		user: 'user'
	};
	return {
		id: pm.id,
		userId: pm.userId,
		displayName,
		email: pm.email,
		workspaceRole: roleLabel[pm.workspaceRole] ?? 'user'
	};
}

function toSentInviteVm(pm: {
	id: string;
	email: string;
	workspaceRole: string;
	expiresAt: string;
}): SentInviteViewModel {
	const roleLabel: Record<string, 'user' | 'admin'> = {
		admin: 'admin',
		user: 'user'
	};
	return {
		id: pm.id,
		email: pm.email,
		workspaceRole: roleLabel[pm.workspaceRole] ?? 'user',
		expiresAt: pm.expiresAt
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
	DELETING = 'DELETING',
	UPDATING = 'UPDATING',
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

	public currentWorkspaceRole = $state<'user' | 'admin' | 'owner' | null>(null);

	public pendingInvitesVm = $state<PendingInviteViewModel[]>([]);
	public sentInvitesVm = $state<SentInviteViewModel[]>([]);
	public loadingPendingInvites = $state(false);
	public acceptingInviteId = $state<string | null>(null);
	public cancelingSentInviteId = $state<string | null>(null);

	/** Join-org (token link) flow */
	public inviteOrganizationName = $state('');
	public inviteRole = $state('');
	public inviteeEmail = $state('');
	public validateInviteError = $state<string | null>(null);
	public joinByTokenError = $state<string | null>(null);

	private userId: string | null = null;

	/** Coalesces overlapping `load()` calls (layout dock + account page can trigger in the same tick). */
	private loadInflight: Promise<void> | null = null;

	constructor(
		private readonly settingsRepository: SettingsRepository,
		private readonly getWorkspacePresenter: GetWorkspacePresenter,
		private readonly profileRepository: ProfileRepository
	) {}

	private updateCurrentWorkspaceRole() {
		const current = this.workspacesVm.find((w) => w.id === this.currentWorkspaceId);
		this.currentWorkspaceRole = current?.workspaceRole ?? null;
	}

	public get canInviteInCurrentWorkspace(): boolean {
		return this.currentWorkspaceRole === 'admin' || this.currentWorkspaceRole === 'owner';
	}

	public get canManageSentInvitesInCurrentWorkspace(): boolean {
		return this.currentWorkspaceRole === 'owner';
	}

	public canEditWorkspace(workspaceRole: 'user' | 'admin' | 'owner'): boolean {
		return workspaceRole === 'admin' || workspaceRole === 'owner';
	}

	public async load(options?: { includeTeam?: boolean }): Promise<void> {
		if (this.loadInflight) return this.loadInflight;
		const includeTeam = options?.includeTeam !== false;
		this.loadInflight = (async () => {
			this.status = WorkspaceSettingsStatus.LOADING;
			try {
				// Fetch workspace list and active session org in parallel to avoid a sequential waterfall.
				const [{ workspacesVm, userId }, sessionOrgId] = await Promise.all([
					this.getWorkspacePresenter.getWorkspaceSettingsData(),
					this.currentWorkspaceId ? Promise.resolve(null) : this.profileRepository.getActiveWorkspaceIdFromSession()
				]);
				this.userId = userId;
				this.workspacesVm = workspacesVm;
				if (!includeTeam) {
					// Keep prior team list when background-refreshing workspace selection for the dock.
					// The settings page explicitly loads team for the selected workspace.
				} else {
					this.teamMembersVm = [];
				}
				if (this.workspacesVm.length > 0 && !this.currentWorkspaceId) {
					const preferred =
						sessionOrgId && this.workspacesVm.some((w) => w.id === sessionOrgId) ?
							sessionOrgId
						:	(this.workspacesVm[0]?.id ?? null);
					this.currentWorkspaceId = preferred;
					if (this.currentWorkspaceId && this.currentWorkspaceId !== sessionOrgId) {
						void this.profileRepository.changeOrganization(this.currentWorkspaceId);
					}
				}
				this.updateCurrentWorkspaceRole();
				if (includeTeam && this.currentWorkspaceId) {
					await this.loadTeam(this.currentWorkspaceId);
				}
			} finally {
				this.status = WorkspaceSettingsStatus.IDLE;
			}
		})();
		try {
			await this.loadInflight;
		} finally {
			this.loadInflight = null;
		}
	}

	public async switchWorkspace(workspaceId: string) {
		this.currentWorkspaceId = workspaceId;
		this.teamMembersVm = [];
		this.sentInvitesVm = [];
		this.updateCurrentWorkspaceRole();
		void this.profileRepository.changeOrganization(workspaceId);
		await this.loadTeam(workspaceId);
	}

	public async updateWorkspace(
		workspaceId: string,
		params: { name: string; description: string | null }
	): Promise<{ success: boolean; message: string }> {
		const workspace = this.workspacesVm.find((w) => w.id === workspaceId);
		if (!workspace) {
			return { success: false, message: 'Workspace not found.' };
		}
		if (!this.canEditWorkspace(workspace.workspaceRole)) {
			const msg = 'Only workspace admins can edit workspace details.';
			this.toastMessage = msg;
			this.toastIsError = true;
			this.showToastMessage = true;
			return { success: false, message: msg };
		}
		this.status = WorkspaceSettingsStatus.UPDATING;
		try {
			const updatedPm = await this.settingsRepository.updateOrganization(workspaceId, params);
			if (!updatedPm) {
				const msg = 'Failed to update workspace. Please try again.';
				this.toastMessage = msg;
				this.toastIsError = true;
				this.showToastMessage = true;
				return { success: false, message: msg };
			}
			this.workspacesVm = this.settingsRepository.organizationsPm.map((o) =>
				this.getWorkspacePresenter.toCardVm(o)
			);
			this.updateCurrentWorkspaceRole();
			this.toastMessage = 'Workspace updated.';
			this.toastIsError = false;
			this.showToastMessage = true;
			return { success: true, message: 'Workspace updated.' };
		} finally {
			this.status = WorkspaceSettingsStatus.IDLE;
		}
	}

	public async createWorkspace(
		defaultName = 'My Workspace',
		options?: { silent?: boolean }
	): Promise<{ success: boolean; message: string }> {
		this.status = WorkspaceSettingsStatus.CREATING;
		try {
			const createdPm = await this.settingsRepository.createOrganization({ name: defaultName });
			if (!createdPm) {
				const msg = 'Failed to create workspace. Please try again.';
				if (!options?.silent) {
					this.toastMessage = msg;
					this.toastIsError = true;
					this.showToastMessage = true;
				}
				return { success: false, message: msg };
			}
			await this.load({ includeTeam: false });
			if (!options?.silent) {
				this.toastMessage = 'Workspace created.';
				this.toastIsError = false;
				this.showToastMessage = true;
			}
			return { success: true, message: 'Workspace created.' };
		} finally {
			this.status = WorkspaceSettingsStatus.IDLE;
		}
	}

	public async deleteWorkspace(workspaceId: string): Promise<{ success: boolean; message: string }> {
		const workspace = this.workspacesVm.find((w) => w.id === workspaceId);
		if (!workspace) {
			return { success: false, message: 'Workspace not found.' };
		}
		if (workspace.workspaceRole !== 'owner') {
			const msg = 'Only the workspace owner can delete it.';
			this.toastMessage = msg;
			this.toastIsError = true;
			this.showToastMessage = true;
			return { success: false, message: msg };
		}
		this.status = WorkspaceSettingsStatus.DELETING;
		try {
			const resultPm = await this.settingsRepository.deleteOrganization(workspaceId);
			if (!resultPm.success) {
				const msg = resultPm.message ?? 'Failed to delete workspace.';
				this.toastMessage = msg;
				this.toastIsError = true;
				this.showToastMessage = true;
				return { success: false, message: msg };
			}

			this.workspacesVm = this.settingsRepository.organizationsPm.map((o) =>
				this.getWorkspacePresenter.toCardVm(o)
			);
			if (this.currentWorkspaceId === workspaceId) {
				const nextWorkspaceId = this.workspacesVm[0]?.id ?? null;
				this.currentWorkspaceId = nextWorkspaceId;
				if (nextWorkspaceId) {
					void this.profileRepository.changeOrganization(nextWorkspaceId);
					await this.loadTeam(nextWorkspaceId);
				} else {
					this.teamMembersVm = [];
					this.sentInvitesVm = [];
				}
			}
			this.updateCurrentWorkspaceRole();
			this.toastMessage = 'Workspace deleted.';
			this.toastIsError = false;
			this.showToastMessage = true;
			return { success: true, message: 'Workspace deleted.' };
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
			const sentInvitesPromise = this.canManageSentInvitesInCurrentWorkspace
				? this.settingsRepository.getSentInvites(organizationId)
				: Promise.resolve([]);
			const [membersPm, sentInvitesPm] = await Promise.all([
				this.settingsRepository.getTeam(organizationId),
				sentInvitesPromise
			]);
			this.teamMembersVm = membersPm.map(toTeamMemberVm);
			this.sentInvitesVm = this.canManageSentInvitesInCurrentWorkspace
				? sentInvitesPm.map(toSentInviteVm)
				: [];
		} finally {
			this.status = WorkspaceSettingsStatus.IDLE;
		}
	}

	public async cancelSentInvite(
		organizationId: string,
		inviteId: string
	): Promise<{ success: boolean; message: string }> {
		if (!this.canManageSentInvitesInCurrentWorkspace) {
			const msg = 'Only workspace owners can cancel invitations.';
			this.toastMessage = msg;
			this.toastIsError = true;
			this.showToastMessage = true;
			return { success: false, message: msg };
		}
		this.cancelingSentInviteId = inviteId;
		try {
			const resultPm = await this.settingsRepository.cancelSentInvite(inviteId);
			if (resultPm.success) {
				this.sentInvitesVm = this.sentInvitesVm.filter((inv) => inv.id !== inviteId);
				this.toastMessage = resultPm.message ?? 'Invitation cancelled.';
				this.toastIsError = false;
				this.showToastMessage = true;
				return { success: true, message: resultPm.message ?? 'Invitation cancelled.' };
			}
			this.toastMessage = resultPm.message ?? 'Failed to cancel invitation.';
			this.toastIsError = true;
			this.showToastMessage = true;
			return { success: false, message: resultPm.message ?? 'Failed to cancel invitation.' };
		} finally {
			this.cancelingSentInviteId = null;
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

	public clearInviteTokenState(): void {
		this.validateInviteError = null;
		this.inviteOrganizationName = '';
		this.inviteRole = '';
		this.inviteeEmail = '';
	}

	public applyValidatedInvite(params: {
		organizationName: string;
		role: string;
		inviteeEmail: string;
	}): void {
		this.clearInviteTokenState();
		this.inviteOrganizationName = params.organizationName;
		this.inviteRole = params.role;
		this.inviteeEmail = params.inviteeEmail;
	}

	public setInviteValidateError(reason: string): void {
		this.clearInviteTokenState();
		this.validateInviteError = reason;
	}

	public inviteValidateErrorMessage(
		reason:
			| 'malformed'
			| 'missing_secret'
			| 'invalid_signature'
			| 'expired'
			| 'organization_not_found'
			| 'network'
			| string
	): string {
		switch (reason) {
			case 'expired':
				return 'This invitation link has expired. Ask the workspace owner to send a new invite.';
			case 'organization_not_found':
				return 'This workspace no longer exists. Ask the workspace owner to send a new invite.';
			case 'missing_secret':
			case 'invalid_signature':
				return 'This invite link is invalid or was created in a different environment. Ask the workspace owner to send a new invite.';
			case 'malformed':
				return 'This invite link is missing a token or is malformed.';
			case 'network':
				return 'Unable to validate this invite. Please check your connection and try again.';
			default:
				return 'This invite is invalid, expired, or the workspace no longer exists.';
		}
	}

	public async validateInviteToken(token: string): Promise<void> {
		this.clearInviteTokenState();
		if (!token?.trim()) {
			this.validateInviteError = this.inviteValidateErrorMessage('malformed');
			return;
		}
		this.status = WorkspaceSettingsStatus.VALIDATING_INVITE;
		try {
			const result = await this.settingsRepository.validateInviteToken(token);
			if ('organizationName' in result) {
				this.applyValidatedInvite({
					organizationName: result.organizationName,
					role: result.role,
					inviteeEmail: result.inviteeEmail
				});
			} else {
				this.validateInviteError = this.inviteValidateErrorMessage(result.reason);
			}
		} catch {
			this.validateInviteError = this.inviteValidateErrorMessage('network');
		} finally {
			this.status = WorkspaceSettingsStatus.IDLE;
		}
	}

	public async joinByToken(token: string): Promise<{ success: boolean; message: string }> {
		this.joinByTokenError = null;
		this.status = WorkspaceSettingsStatus.JOINING_BY_TOKEN;
		try {
			const joinPm = await this.profileRepository.joinOrganization(token);
			if (joinPm.success && joinPm.organizationId) {
				this.currentWorkspaceId = joinPm.organizationId;
				await this.load();
				return { success: true, message: '' };
			}
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

