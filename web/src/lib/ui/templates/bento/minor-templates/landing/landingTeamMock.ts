export type LandingTeamMockRole = 'owner' | 'admin' | 'member';

export type LandingTeamMockMember = {
	id: string;
	displayName: string;
	email: string;
	workspaceRole: LandingTeamMockRole;
};

export type LandingTeamMockPendingInvite = {
	id: string;
	email: string;
	workspaceRole: 'admin' | 'member';
};

export const LANDING_TEAM_MOCK_WORKSPACE_NAME = 'Acme Marketing';

export const LANDING_TEAM_MOCK_SEATS = {
	used: 3,
	limit: 5
} as const;

export const LANDING_TEAM_MOCK_MEMBERS: LandingTeamMockMember[] = [
	{
		id: 'landing-team-owner',
		displayName: 'Jordan Lee',
		email: 'jordan@example.com',
		workspaceRole: 'owner'
	},
	{
		id: 'landing-team-admin',
		displayName: 'Sam Rivera',
		email: 'sam@example.com',
		workspaceRole: 'admin'
	},
	{
		id: 'landing-team-member',
		displayName: 'Ava Chen',
		email: 'ava@example.com',
		workspaceRole: 'member'
	}
];

export const LANDING_TEAM_MOCK_PENDING_INVITE: LandingTeamMockPendingInvite = {
	id: 'landing-team-pending',
	email: 'maya@example.com',
	workspaceRole: 'member'
};

export function landingTeamRoleLabel(role: LandingTeamMockRole | 'admin' | 'member'): string {
	switch (role) {
		case 'owner':
			return 'Owner';
		case 'admin':
			return 'Admin';
		default:
			return 'Member';
	}
}
