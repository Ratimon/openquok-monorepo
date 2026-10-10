import { PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM } from '$lib/content/constants/channels/api/_shared/formatExamples';
import { buildPublicApiPlatformPage, SHARED_PUBLIC_API_SEO_KEYWORDS } from '$lib/content/constants/channels/api/_shared/shared';
import type { PublicApiPlatformPageViewModel } from '$lib/content/constants/channels/api/_shared/types';

const SLUG = 'bluesky' as const;

const KEYWORDS = [
	...SHARED_PUBLIC_API_SEO_KEYWORDS,
	'Bluesky posting API',
	'Bluesky scheduling API',
	'AT Protocol posting API',
	'schedule Bluesky via API'
];

export const blueskyPublicApiSchedulingPlatform: PublicApiPlatformPageViewModel =
	buildPublicApiPlatformPage({
		slug: SLUG,
		capability: 'scheduling',
		formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].scheduling,
		heroDescription:
			'Schedule Bluesky posts for a future publish time. Send scheduledAt in UTC, queue media and reply chains, and let OpenQuok publish through your PDS.',
		metaTitle: 'Bluesky Scheduling API — Queue Posts with POST /public/posts',
		metaDescription:
			'Schedule Bluesky posts with OpenQuok POST /public/posts. Queue text, images, video, and follow-up replies with scheduledAt in UTC.',
		faqDescription:
			'Connect your Bluesky account with your app password, set scheduledAt in UTC, and automate posts you approve — not a resale flow for unrelated users’ credentials.',
		keywords: KEYWORDS
	});
