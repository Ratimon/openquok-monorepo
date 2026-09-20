import { PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM } from '$lib/content/constants/apis/formatExamples';
import { buildPublicApiPlatformPage, SHARED_PUBLIC_API_SEO_KEYWORDS } from '$lib/content/constants/apis/shared';
import type { PublicApiPlatformPageViewModel } from '$lib/content/constants/apis/types';

const SLUG = 'facebook' as const;

const KEYWORDS = [
	...SHARED_PUBLIC_API_SEO_KEYWORDS,
	'Facebook posting API',
	'Facebook Page API',
	'Facebook scheduling API',
	'schedule Facebook via API'
];

export const facebookPublicApiPostingPlatform: PublicApiPlatformPageViewModel =
	buildPublicApiPlatformPage({
		slug: SLUG,
		capability: 'posting',
		formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].posting,
		heroDescription:
			'Publish Page posts with text, images, Reels, link previews, and follow-up comments through POST /public/posts.',
		metaTitle: 'Facebook Posting API',
		metaDescription:
			'Post to Facebook Pages with OpenQuok POST /public/posts. Text, images, Reels, link previews, and follow-up comments from one JSON payload.',
		keywords: KEYWORDS
	});

export const facebookPublicApiSchedulingPlatform: PublicApiPlatformPageViewModel =
	buildPublicApiPlatformPage({
		slug: SLUG,
		capability: 'scheduling',
		formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].scheduling,
		heroDescription:
			'Queue Facebook Page posts for a future publish time. Set scheduledAt in UTC with link previews and follow-up comment settings.',
		metaTitle: 'Facebook Scheduling API',
		metaDescription:
			'Schedule Facebook Page posts with OpenQuok POST /public/posts. Queue text, images, Reels, and link previews for a future UTC time.',
		keywords: KEYWORDS
	});
