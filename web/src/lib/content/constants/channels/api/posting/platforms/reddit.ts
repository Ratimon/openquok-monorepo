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

export const redditPublicApiPostingPlatform: PublicApiPlatformPageViewModel =
	buildPublicApiPlatformPage({
		slug: SLUG,
		capability: 'posting',
		formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].posting,
		heroDescription:
			'Queue Reddit markdown drafts with POST /public/posts after you add a manual Reddit channel. Due rows move to awaiting member — OpenQuok does not publish to Reddit from the backend.',
		metaTitle: 'Reddit Posting API — Schedule Drafts with POST /public/posts',
		metaDescription:
			'Schedule Reddit posts with OpenQuok POST /public/posts. Markdown body, optional subreddit and title, and media for handoff — you finish on reddit.com when due.',
		faqDescription:
			'Manual dashboard connect, optional extension assist at due time, and provider settings for subreddit and title — built for your automation, not server-side Reddit publish.',
		keywords: KEYWORDS
	});
