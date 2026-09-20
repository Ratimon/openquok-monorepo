import { PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM } from '$lib/content/constants/apis/formatExamples';
import { buildPublicApiPlatformPage, SHARED_PUBLIC_API_SEO_KEYWORDS } from '$lib/content/constants/apis/shared';
import type { PublicApiPlatformPageViewModel } from '$lib/content/constants/apis/types';

const SLUG = 'linkedin' as const;

const KEYWORDS = [
	...SHARED_PUBLIC_API_SEO_KEYWORDS,
	'LinkedIn posting API',
	'LinkedIn scheduling API',
	'LinkedIn document carousel API',
	'schedule LinkedIn via API'
];

export const linkedinPublicApiPostingPlatform: PublicApiPlatformPageViewModel =
	buildPublicApiPlatformPage({
		slug: SLUG,
		capability: 'posting',
		formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].posting,
		heroDescription:
			'Publish LinkedIn posts with text, video, document carousels, and follow-up comments through POST /public/posts.',
		metaTitle: 'LinkedIn Posting API',
		metaDescription:
			'Post to LinkedIn with OpenQuok POST /public/posts. Text, video, document carousels, and follow-up comments from one JSON payload.',
		keywords: KEYWORDS
	});

export const linkedinPublicApiSchedulingPlatform: PublicApiPlatformPageViewModel =
	buildPublicApiPlatformPage({
		slug: SLUG,
		capability: 'scheduling',
		formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].scheduling,
		heroDescription:
			'Schedule LinkedIn profile and Page posts for a future publish time. Send scheduledAt in UTC, name PDF document carousels, and queue follow-up comments — one POST /public/posts payload.',
		metaTitle: 'LinkedIn Scheduling API — Queue Posts with POST /public/posts',
		metaDescription:
			'Schedule LinkedIn posts with OpenQuok POST /public/posts. Queue text, video, PDF document carousels, and follow-up comments with scheduledAt in UTC.',
		faqDescription:
			'Connect LinkedIn, set scheduledAt in UTC, and schedule text posts, video, document carousels, and follow-up comments from your app or agent.',
		keywords: KEYWORDS
	});
