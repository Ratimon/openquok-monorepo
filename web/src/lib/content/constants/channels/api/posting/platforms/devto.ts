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

export const devtoPublicApiPostingPlatform: PublicApiPlatformPageViewModel =
	buildPublicApiPlatformPage({
		slug: SLUG,
		capability: 'posting',
		formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[SLUG].posting,
		heroDescription:
			'Publish Dev.to markdown articles with title, tags, series, and optional cover through POST /public/posts — using your own API key on a connected channel.',
		metaTitle: 'Dev.to Posting API',
		metaDescription:
			'Post Dev.to articles with OpenQuok POST /public/posts. Title, tags, canonical URL, organization, and cover image from one JSON payload.',
		faqDescription:
			'Connect with your personal Dev.to API key, publish or schedule markdown articles, and automate drafts you approve — not a multi-tenant resale flow.',
		keywords: KEYWORDS
	});
