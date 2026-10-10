import { PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM } from '$lib/content/constants/channels/api/_shared/formatExamples';
import { buildPublicApiPlatformPage, SHARED_PUBLIC_API_SEO_KEYWORDS } from '$lib/content/constants/channels/api/_shared/shared';
import type { PublicApiPlatformPageViewModel } from '$lib/content/constants/channels/api/_shared/types';

const SLUG = 'devto' as const;

const KEYWORDS = [
	...SHARED_PUBLIC_API_SEO_KEYWORDS,
	'Dev.to posting API',
	'Dev.to scheduling API',
	'schedule Dev.to articles API',
	'Forem publishing API'
];

export const devtoPublicApiSchedulingPlatform: PublicApiPlatformPageViewModel =
	buildPublicApiPlatformPage({
		slug: SLUG,
		capability: 'scheduling',
		formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].scheduling,
		heroDescription:
			'Schedule Dev.to articles for a future publish time. Send scheduledAt in UTC with title and tags in provider settings.',
		metaTitle: 'Dev.to Scheduling API — Queue Articles with POST /public/posts',
		metaDescription:
			'Schedule Dev.to articles with OpenQuok POST /public/posts. Queue markdown body, title, tags, and series with scheduledAt in UTC.',
		faqDescription:
			'Use your own Dev.to API key, set scheduledAt in UTC, and queue articles from scripts or agents — each workspace uses credentials the owner connected.',
		keywords: KEYWORDS
	});
