import type { ConnectedIntegrationProgrammerModel } from '$lib/integrations/Integrations.repository.svelte';
import type { TeamMemberProgrammerModel } from '$lib/settings/Settings.repository.svelte';
import type { WorkspaceCardViewModel } from '$lib/settings/GetWorkspace.presenter.svelte';
import type { GetChannelPresenter } from '$lib/channels/GetChannel.presenter.svelte';

const MEMBER_AVATAR_PREVIEW_LIMIT = 4;
const CHANNEL_PREVIEW_LIMIT = 3;

export interface DashboardWorkspaceMemberPreviewViewModel {
	id: string;
	displayName: string;
	initials: string;
}

export interface DashboardWorkspaceChannelPreviewViewModel {
	id: string;
	picture: string | null;
	identifier: string;
}

export interface DashboardWorkspaceCardViewModel {
	id: string;
	name: string;
	description: string | null;
	workspaceRole: 'user' | 'admin' | 'superadmin';
	roleLabel: string;
	userFullName: string;
	userEmail: string;
	memberCount: number;
	membersPreview: DashboardWorkspaceMemberPreviewViewModel[];
	hiddenMemberCount: number;
	channelPreviews: DashboardWorkspaceChannelPreviewViewModel[];
	hiddenChannelCount: number;
	socialChannelCount: number;
	isCurrent: boolean;
}

type CurrentUserSnapshot = {
	id?: string | null;
	email?: string | null;
	fullName?: string | null;
};

export function workspaceRoleDisplayLabel(role: 'user' | 'admin' | 'superadmin'): string {
	switch (role) {
		case 'superadmin':
			return 'Super Admin';
		case 'admin':
			return 'Admin';
		default:
			return 'Member';
	}
}

function memberInitials(displayName: string): string {
	const trimmed = displayName.trim();
	if (!trimmed) return '?';
	const parts = trimmed.split(/\s+/).filter(Boolean);
	if (parts.length >= 2) {
		return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
	}
	return trimmed.slice(0, 2).toUpperCase();
}

function memberDisplayName(pm: TeamMemberProgrammerModel): string {
	return pm.fullName?.trim() || pm.email?.trim() || 'Unknown';
}

function isSocialChannel(pm: ConnectedIntegrationProgrammerModel): boolean {
	return (pm.type ?? '').toLowerCase() === 'social';
}

export class GetDashboardWorkspacesPresenter {
	public toWorkspaceCardVm(params: {
		workspace: WorkspaceCardViewModel;
		membersPm: TeamMemberProgrammerModel[];
		integrationsPm: ConnectedIntegrationProgrammerModel[];
		currentUser: CurrentUserSnapshot | null;
		isCurrent: boolean;
		getChannelPresenter: GetChannelPresenter;
	}): DashboardWorkspaceCardViewModel {
		const { workspace, membersPm, integrationsPm, currentUser, isCurrent, getChannelPresenter } = params;
		const currentUserId = currentUser?.id?.trim() ?? '';

		const membersPreviewAll = membersPm
			.filter((m) => !currentUserId || m.userId !== currentUserId)
			.map((m) => {
				const displayName = memberDisplayName(m);
				return {
					id: m.id,
					displayName,
					initials: memberInitials(displayName)
				};
			});

		const membersPreview = membersPreviewAll.slice(0, MEMBER_AVATAR_PREVIEW_LIMIT);
		const hiddenMemberCount = Math.max(0, membersPreviewAll.length - membersPreview.length);

		const socialChannels = integrationsPm
			.filter(isSocialChannel)
			.map((pm) => getChannelPresenter.toCreateSocialPostChannelViewModel(pm));

		const channelPreviews = socialChannels.slice(0, CHANNEL_PREVIEW_LIMIT).map((ch) => ({
			id: ch.id,
			picture: ch.picture,
			identifier: ch.identifier
		}));
		const hiddenChannelCount = Math.max(0, socialChannels.length - channelPreviews.length);
		const socialChannelCount = socialChannels.length;

		const userFullName = currentUser?.fullName?.trim() || '—';
		const userEmail = currentUser?.email?.trim() || '—';

		return {
			id: workspace.id,
			name: workspace.name,
			description: workspace.description?.trim() ? workspace.description.trim() : null,
			workspaceRole: workspace.workspaceRole,
			roleLabel: workspaceRoleDisplayLabel(workspace.workspaceRole),
			userFullName,
			userEmail,
			memberCount: membersPm.length,
			membersPreview,
			hiddenMemberCount,
			channelPreviews,
			hiddenChannelCount,
			socialChannelCount,
			isCurrent
		};
	}
}
