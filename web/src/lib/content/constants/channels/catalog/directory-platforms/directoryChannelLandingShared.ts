import { PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG } from '$lib/content/constants/marketing/directory-submission-landing';
import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import type { PublicLandingHeroStatBadge } from '$lib/content/constants/marketing/publicLandingHeroStatBadges';

/** Hero stat badges shared with `/directory-submission-tool`. */
export function publicDirectoryChannelHeroStatBadges(): readonly PublicLandingHeroStatBadge[] {
	return PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG.trustStats;
}

/** WhoIsFor copy aligned with the directory tool landing; title names the platform. */
export function buildDirectoryChannelWhoIsFor(platformLabel: string): {
	audienceSubtitle: string;
	audienceTitle: string;
	audienceCards: readonly AudienceCard[];
} {
	const { whoIsFor } = PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG;
	return {
		audienceSubtitle: whoIsFor.audienceSubtitle,
		audienceTitle: `Who launches on ${platformLabel} with OpenQuok?`,
		audienceCards: whoIsFor.audienceCards
	};
}

/** Main hero title for `/channels/{directory-slug}` — names the platform and other directories. */
export function buildDirectoryChannelHeroTitle(platformLabel: string): string {
	return `Launch on ${platformLabel} and other platforms in days not weeks`;
}

/** Result-driven hero description for `/channels/{directory-slug}` (platform site host in prose). */
export function buildDirectoryChannelHeroDescription(
	platformLabel: string,
	siteHost: string
): string {
	return `Directory listings build backlinks and authority when you pace them like a human. OpenQuok autofills ${siteHost} from one profile, tracks domain rating in your workspace, and keeps you in control of every submit on ${platformLabel} and other launch sites.`;
}
