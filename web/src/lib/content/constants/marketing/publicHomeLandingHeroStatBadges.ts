import { getRootPathPublicDirectorySubmissionTool } from '$lib/area-public/constants/getRootPathPublicDirectorySubmissionTool';
import { getRootPathPublicSocialAutopilotLanding } from '$lib/area-public/constants/getRootPathPublicSocialAutopilotLanding';
import type { PublicLandingHeroStatBadge } from '$lib/content/constants/marketing/publicLandingHeroStatBadges';
import { route } from '$lib/utils/path';

/** `/` hero band — links to the two product-line landings. */
export const PUBLIC_HOME_LANDING_HERO_STAT_BADGES: readonly PublicLandingHeroStatBadge[] = [
	{
		id: 'social-scheduler',
		value: 'Social Scheduler',
		label: 'For social channels',
		href: route(getRootPathPublicSocialAutopilotLanding())
	},
	{
		id: 'auto-submit',
		value: 'Auto Submit',
		label: 'For directory channels',
		href: route(getRootPathPublicDirectorySubmissionTool())
	}
];
