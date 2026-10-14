import type { AutoLaunchDestinationDto } from '$lib/auto-launch/auto-launch.types';

export function formatDirectoryLaunchDofollowLabel(
	dofollow: AutoLaunchDestinationDto['opportunityDofollow']
): string | null {
	if (dofollow === 'dofollow') return 'Dofollow';
	if (dofollow === 'nofollow') return 'Nofollow';
	if (dofollow === 'unknown') return 'Link type unknown';
	return null;
}

export function formatDirectoryLaunchCostLabel(destination: AutoLaunchDestinationDto): string {
	const note = destination.opportunityCostNote?.trim();
	if (note) return note;
	switch (destination.opportunityCostTier) {
		case 'free':
			return 'Free';
		case 'freemium':
			return 'Freemium';
		case 'paid':
			return 'Paid';
		default:
			return 'See site for pricing';
	}
}
