import { describe, expect, it } from 'vitest';

import type { BlogPostBySlugPublicViewModel } from '$lib/blogs/GetBlog.presenter.svelte';
import { BLOG_SEO_TOPIC_IDS_PRODUCT } from '$lib/blogs/constants/blogSeoSchemaTopics';
import { createBlogPostSEOSchema } from '$lib/blogs/utils/createBlogPostSEOSchema';

function productPost(overrides?: Partial<BlogPostBySlugPublicViewModel>): BlogPostBySlugPublicViewModel {
	return {
		id: '11111111-1111-4111-8111-111111111111',
		title: 'Platforms are adding AI labels',
		slug: 'platforms-are-adding-ai-labels',
		description: 'Rewrite a social draft so it reads less machine-written.',
		heroImageFilename: null,
		readingTimeMinutes: 4,
		createdAt: '2026-08-19T00:00:00.000Z',
		publishedAt: '2026-08-19T00:00:00.000Z',
		updatedAt: '2026-08-19T00:00:00.000Z',
		content: '<p>Body</p>',
		isSponsored: false,
		isFeatured: false,
		topic: {
			id: BLOG_SEO_TOPIC_IDS_PRODUCT[0],
			name: 'Product updates',
			slug: 'product-updates'
		},
		author: {
			id: '22222222-2222-4222-8222-222222222222',
			fullName: 'OpenQuok',
			username: 'openquok',
			avatarUrl: null,
			website: null,
			tagLine: null
		},
		likeCount: null,
		faqItems: null,
		howtoSteps: null,
		product: {
			name: 'OpenQuok Humanizer',
			description:
				'A free browser composer that rewrites a social draft so it reads less machine-written.',
			brand: 'OpenQuok',
			url: 'https://www.openquok.com/tools/humanizer'
		},
		...overrides
	};
}

describe('createBlogPostSEOSchema product node', () => {
	it('includes a free Offer so Google Product snippets validate', () => {
		const schema = createBlogPostSEOSchema({
			post: productPost(),
			canonicalUrl:
				'https://www.openquok.com/blog/platforms-are-adding-ai-labels-detectors-and-bans-your-draft-can-still-sound-like-a-machine',
			companyName: 'OpenQuok',
			companySiteUrl: 'https://www.openquok.com',
			requestUrl: new URL(
				'https://www.openquok.com/blog/platforms-are-adding-ai-labels-detectors-and-bans-your-draft-can-still-sound-like-a-machine'
			)
		});

		const productNode = schema['@graph'].find(
			(node) => typeof node === 'object' && node !== null && '@type' in node && node['@type'] === 'Product'
		) as Record<string, unknown> | undefined;

		expect(productNode).toMatchObject({
			'@type': 'Product',
			name: 'OpenQuok Humanizer',
			url: 'https://www.openquok.com/tools/humanizer',
			offers: {
				'@type': 'Offer',
				price: '0',
				priceCurrency: 'USD',
				availability: 'https://schema.org/InStock',
				url: 'https://www.openquok.com/tools/humanizer'
			}
		});
	});
});
