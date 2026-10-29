import { PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM } from '$lib/content/constants/channels/api/_shared/formatExamples';
import { buildPublicApiPlatformPage, SHARED_PUBLIC_API_SEO_KEYWORDS } from '$lib/content/constants/channels/api/_shared/shared';
import type { PublicApiPlatformPageViewModel } from '$lib/content/constants/channels/api/_shared/types';

const SLUG = 'reddit' as const;

const KEYWORDS = [
	...SHARED_PUBLIC_API_SEO_KEYWORDS,
	'Reddit posting API',
	'Reddit scheduling API',
	'schedule Reddit posts API',
	'Reddit markdown API'
];

export const redditPublicApiSchedulingPlatform: PublicApiPlatformPageViewModel =
	buildPublicApiPlatformPage({
		slug: SLUG,
		capability: 'scheduling',
		formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].scheduling,
		heroDescription:
			'Schedule Reddit markdown drafts for a future due time. Send scheduledAt in UTC with optional subreddit and title in provider settings — finish the submit on reddit.com when the row is awaiting member.',
		metaTitle: 'Reddit Scheduling API — Queue Drafts with POST /public/posts',
		metaDescription:
			'Schedule Reddit posts with OpenQuok POST /public/posts. Queue markdown, subreddit, title, and media for member handoff with scheduledAt in UTC.',
		faqDescription:
			'Add Reddit as a manual channel, set scheduledAt in UTC, and pass subreddit or title when you want autofill — no backend publish to Reddit.',
		keywords: KEYWORDS
	});
