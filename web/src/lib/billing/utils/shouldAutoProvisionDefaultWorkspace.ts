export type WorkspaceListOutcomeForAutoProvision = 'idle' | 'ok' | 'error';

/**
 * Whether the client may silently create a default workspace (legacy OAuth recovery).
 * Requires a successful empty list; never auto-provisions on list errors or for platform admins.
 */
export function shouldAutoProvisionDefaultWorkspace(
	listOutcome: WorkspaceListOutcomeForAutoProvision,
	ownedWorkspaceCount: number,
	isPlatformAdmin: boolean
): boolean {
	if (isPlatformAdmin) return false;
	if (listOutcome !== 'ok') return false;
	return ownedWorkspaceCount === 0;
}
