import { describe, expect, it } from 'vitest';

import type { BlogPostBySlugPublicViewModel } from '$lib/blogs/GetBlog.presenter.svelte';
import { BLOG_SEO_TOPIC_IDS_PRODUCT } from '$lib/blogs/constants/blogSeoSchemaTopics';
import { buildBlogInlineImageSrc } from '$lib/blogs/utils/blogImages';
import { createBlogPostSEOSchema } from '$lib/blogs/utils/blogSeoSchema';

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

function findBlogPosting(schema: ReturnType<typeof createBlogPostSEOSchema>): Record<string, unknown> | undefined {
	return schema['@graph'].find(
		(node) => typeof node === 'object' && node !== null && '@type' in node && node['@type'] === 'BlogPosting'
	) as Record<string, unknown> | undefined;
}

function findImageObjects(schema: ReturnType<typeof createBlogPostSEOSchema>): Record<string, unknown>[] {
	return schema['@graph'].filter(
		(node) => typeof node === 'object' && node !== null && '@type' in node && node['@type'] === 'ImageObject'
	) as Record<string, unknown>[];
}

function graphNodeTypes(schema: ReturnType<typeof createBlogPostSEOSchema>): unknown[] {
	return schema['@graph'].map((node) =>
		typeof node === 'object' && node !== null && '@type' in node ? node['@type'] : undefined
	);
}

const POST_CANONICAL_URL = 'https://www.openquok.com/blog/platforms-are-adding-ai-labels';

function createPostSchema(overrides?: Partial<BlogPostBySlugPublicViewModel>) {
	return createBlogPostSEOSchema({
		post: productPost(overrides),
		canonicalUrl: POST_CANONICAL_URL,
		companyName: 'OpenQuok',
		companySiteUrl: 'https://www.openquok.com',
		requestUrl: new URL(POST_CANONICAL_URL)
	});
}

describe('createBlogPostSEOSchema hero image', () => {
	it('emits a featured ImageObject in the graph with caption matching post title', () => {
		const schema = createPostSchema({
			heroImageFilename: 'blog_images/hero.webp'
		});

		const blogPosting = findBlogPosting(schema);
		expect(blogPosting?.image).toEqual({
			'@id': `${POST_CANONICAL_URL}#featured-image`
		});

		const heroImage = findImageObjects(schema).find(
			(node) => node['@id'] === `${POST_CANONICAL_URL}#featured-image`
		);
		expect(heroImage).toMatchObject({
			'@type': 'ImageObject',
			name: 'Featured image for blog post: Platforms are adding AI labels',
			caption: 'Platforms are adding AI labels',
			representativeOfPage: true,
			width: 1200,
			height: 630,
			encodingFormat: 'image/webp',
			author: {
				'@type': 'Person',
				name: 'OpenQuok'
			},
			isPartOf: {
				'@id': `${POST_CANONICAL_URL}#blogposting`
			}
		});
	});
});

describe('createBlogPostSEOSchema inline images', () => {
	it('references hero in BlogPosting.image and inline ImageObjects in associatedMedia', () => {
		const storagePath = 'user-1/setup.png';
		const schema = createPostSchema({
			heroImageFilename: 'blog_images/hero.webp',
			content: `<p><img data-storage-path="${storagePath}" alt="Token setup screenshot" /></p>`
		});

		const blogPosting = findBlogPosting(schema);
		expect(blogPosting?.image).toEqual({
			'@id': `${POST_CANONICAL_URL}#featured-image`
		});
		expect(blogPosting?.associatedMedia).toEqual({
			'@id': `${POST_CANONICAL_URL}#inline-image-1`
		});

		const imageObjects = findImageObjects(schema);
		expect(imageObjects).toHaveLength(2);
		expect(imageObjects[1]).toMatchObject({
			'@type': 'ImageObject',
			'@id': `${POST_CANONICAL_URL}#inline-image-1`,
			caption: 'Token setup screenshot',
			contentUrl: buildBlogInlineImageSrc(storagePath),
			url: buildBlogInlineImageSrc(storagePath),
			encodingFormat: 'image/png',
			author: {
				'@type': 'Person',
				name: 'OpenQuok'
			}
		});
		expect(imageObjects[1]).not.toHaveProperty('name');
		expect(graphNodeTypes(schema).filter((type) => type === 'ImageObject')).toHaveLength(2);
	});

	it('omits BlogPosting.image when there is no hero and no blog inline images', () => {
		const schema = createPostSchema({
			heroImageFilename: null,
			content: '<p>Body</p><img src="https://cdn.example.com/photo.png" alt="External" />'
		});

		expect(findBlogPosting(schema)).not.toHaveProperty('image');
		expect(findBlogPosting(schema)).not.toHaveProperty('associatedMedia');
		expect(findImageObjects(schema)).toHaveLength(0);
	});

	it('skips inline images that duplicate the hero storage path', () => {
		const schema = createPostSchema({
			heroImageFilename: 'blog_images/hero.webp',
			content: [
				'<img data-storage-path="blog_images/hero.webp" alt="Same as hero" />',
				'<img data-storage-path="user-1/chart.png" alt="Chart of results" />'
			].join('')
		});

		const blogPosting = findBlogPosting(schema);
		expect(blogPosting?.image).toEqual({
			'@id': `${POST_CANONICAL_URL}#featured-image`
		});
		expect(blogPosting?.associatedMedia).toEqual({
			'@id': `${POST_CANONICAL_URL}#inline-image-2`
		});

		const imageObjects = findImageObjects(schema);
		expect(imageObjects).toHaveLength(2);
		expect(imageObjects[1]).toMatchObject({
			'@type': 'ImageObject',
			'@id': `${POST_CANONICAL_URL}#inline-image-2`,
			caption: 'Chart of results',
			contentUrl: buildBlogInlineImageSrc('user-1/chart.png')
		});
	});

	it('keeps a single hero ImageObject when the body only repeats the hero path', () => {
		const schema = createPostSchema({
			heroImageFilename: 'blog_images/hero.webp',
			content: '<img data-storage-path="blog_images/hero.webp" alt="Same as hero" />'
		});

		const blogPosting = findBlogPosting(schema);
		expect(blogPosting?.image).toEqual({
			'@id': `${POST_CANONICAL_URL}#featured-image`
		});
		expect(blogPosting).not.toHaveProperty('associatedMedia');

		const heroImage = findImageObjects(schema)[0];
		expect(heroImage).toMatchObject({
			'@type': 'ImageObject',
			name: 'Featured image for blog post: Platforms are adding AI labels',
			caption: 'Platforms are adding AI labels'
		});
	});

	it('uses BlogPosting.image refs for inline-only posts without a hero', () => {
		const storagePath = 'user-1/diagram.webp';
		const schema = createPostSchema({
			heroImageFilename: null,
			content: `<img data-storage-path="${storagePath}" alt="" />`
		});

		const blogPosting = findBlogPosting(schema);
		expect(blogPosting?.image).toEqual({
			'@id': `${POST_CANONICAL_URL}#inline-image-1`
		});
		expect(blogPosting).not.toHaveProperty('associatedMedia');

		const inlineImage = findImageObjects(schema)[0];
		expect(inlineImage).toMatchObject({
			'@type': 'ImageObject',
			'@id': `${POST_CANONICAL_URL}#inline-image-1`,
			name: 'Illustration in Platforms are adding AI labels',
			contentUrl: buildBlogInlineImageSrc(storagePath)
		});
		expect(inlineImage).not.toHaveProperty('caption');
	});

	it('uses a name fallback when an inline image has empty alt', () => {
		const storagePath = 'user-1/diagram.webp';
		const schema = createPostSchema({
			heroImageFilename: 'blog_images/hero.webp',
			content: `<img data-storage-path="${storagePath}" alt="" />`
		});

		const inlineImage = findImageObjects(schema).find(
			(node) => node['@id'] === `${POST_CANONICAL_URL}#inline-image-1`
		);
		expect(inlineImage).toMatchObject({
			name: 'Illustration in Platforms are adding AI labels',
			contentUrl: buildBlogInlineImageSrc(storagePath)
		});
		expect(inlineImage).not.toHaveProperty('caption');
	});
});

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
