import { PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM } from '$lib/content/constants/channels/api/_shared/formatExamples';
import { buildPublicApiPlatformPage, SHARED_PUBLIC_API_SEO_KEYWORDS } from '$lib/content/constants/channels/api/_shared/shared';
import type { PublicApiPlatformPageViewModel } from '$lib/content/constants/channels/api/_shared/types';

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
