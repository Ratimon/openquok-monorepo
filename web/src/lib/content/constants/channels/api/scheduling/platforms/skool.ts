import { PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM } from '$lib/content/constants/channels/api/_shared/formatExamples';
import { buildPublicApiPlatformPage, SHARED_PUBLIC_API_SEO_KEYWORDS } from '$lib/content/constants/channels/api/_shared/shared';
import type { PublicApiPlatformPageViewModel } from '$lib/content/constants/channels/api/_shared/types';

const SLUG = 'skool' as const;

const KEYWORDS = [
	...SHARED_PUBLIC_API_SEO_KEYWORDS,
	'Skool posting API',
	'Skool scheduling API',
	'schedule Skool community posts API',
	'Skool group posts API'
];

export const skoolPublicApiSchedulingPlatform: PublicApiPlatformPageViewModel =
	buildPublicApiPlatformPage({
		slug: SLUG,
		capability: 'scheduling',
		formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].scheduling,
		heroDescription:
			'Schedule Skool posts for a future publish time. Send scheduledAt in UTC with title and group id in provider settings.',
		metaTitle: 'Skool Scheduling API — Queue Group Posts with POST /public/posts',
		metaDescription:
			'Schedule Skool community posts with OpenQuok POST /public/posts. Queue caption, title, group, label, and follow-up comments with scheduledAt in UTC.',
		faqDescription:
			'Extension connect for your Skool login, scheduledAt in UTC, and group settings from integrations:trigger — built for your automation, not posting on behalf of customers without their connect.',
		keywords: KEYWORDS
	});
