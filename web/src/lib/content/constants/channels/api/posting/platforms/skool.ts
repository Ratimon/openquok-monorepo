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

export const skoolPublicApiPostingPlatform: PublicApiPlatformPageViewModel =
	buildPublicApiPlatformPage({
		slug: SLUG,
		capability: 'posting',
		formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].posting,
		heroDescription:
			'Publish Skool community posts with title, group, optional label, and images through POST /public/posts — after you connect your own Skool session with the browser extension.',
		metaTitle: 'Skool Posting API',
		metaDescription:
			'Post to Skool groups with OpenQuok POST /public/posts. Title, group, label, images, and follow-up comments from one JSON payload.',
		faqDescription:
			'Connect your Skool session with the OpenQuok extension, then publish or schedule to groups you belong to — for your account, not as a resale service for unrelated users.',
		keywords: KEYWORDS
	});
