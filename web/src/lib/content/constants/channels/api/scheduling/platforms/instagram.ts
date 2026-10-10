import { PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM } from '$lib/content/constants/channels/api/_shared/formatExamples';
import { buildPublicApiPlatformPage, SHARED_PUBLIC_API_SEO_KEYWORDS } from '$lib/content/constants/channels/api/_shared/shared';
import type { PublicApiPlatformPageViewModel } from '$lib/content/constants/channels/api/_shared/types';

const SLUG = 'instagram' as const;

const KEYWORDS = [
	...SHARED_PUBLIC_API_SEO_KEYWORDS,
	'Instagram posting API',
	'Instagram scheduling API',
	'Instagram Reels API',
	'schedule Instagram via API'
];

export const instagramPublicApiSchedulingPlatform: PublicApiPlatformPageViewModel =
	buildPublicApiPlatformPage({
		slug: SLUG,
		capability: 'scheduling',
		formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].scheduling,
		heroDescription:
			'Queue Instagram content for a future publish time. Set scheduledAt in UTC and choose post type, trial reels, or collaborators before publish.',
		metaTitle: 'Instagram Scheduling API',
		metaDescription:
			'Schedule Instagram posts with OpenQuok POST /public/posts. Queue feed, Reels, carousels, and Stories for a future UTC publish time.',
		keywords: KEYWORDS
	});
