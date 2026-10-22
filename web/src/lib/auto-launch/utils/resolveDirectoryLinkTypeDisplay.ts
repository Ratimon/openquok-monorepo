import type { AutoLaunchDestinationDto } from '$lib/auto-launch/auto-launch.types';
import { formatDirectoryLaunchDofollowLabel } from '$lib/auto-launch/utils/directoryLaunchPickerLabels';

const EMPTY = '—';

export function resolveDirectoryLinkTypeDisplay(params: {
	submissionStatus: 'none' | 'completed' | 'other';
	listingDofollow: boolean;
	opportunityDofollow: AutoLaunchDestinationDto['opportunityDofollow'];
}): string {
	if (params.submissionStatus === 'completed') {
		return params.listingDofollow ? 'Dofollow' : 'Nofollow';
	}
	const catalog = formatDirectoryLaunchDofollowLabel(params.opportunityDofollow);
	return catalog ?? EMPTY;
}
