import { describe, expect, it } from 'vitest';

import {
	BLOG_BREADCRUMB_HUB_LABEL,
	buildBlogChildPageBreadcrumbItems,
	createBlogChildPageBreadcrumbListSchema
} from '$lib/blogs/utils/buildBlogBreadcrumbItems';

const origin = 'https://www.openquok.com';

describe('buildBlogChildPageBreadcrumbItems', () => {
	it('matches BlogHubBreadcrumb: Blog hub link then current page title', () => {
		expect(buildBlogChildPageBreadcrumbItems('How to schedule posts')).toEqual([
			{ label: BLOG_BREADCRUMB_HUB_LABEL, href: '/blog' },
			{ label: 'How to schedule posts' }
		]);
	});
});

describe('createBlogChildPageBreadcrumbListSchema', () => {
	it('uses shared BreadcrumbList serializer with terminal crumb omitted from item URLs', () => {
		const schema = createBlogChildPageBreadcrumbListSchema('Topic name', origin);

		expect(schema['@type']).toBe('BreadcrumbList');
		expect(schema.itemListElement).toHaveLength(2);
		expect(schema.itemListElement?.[0]?.item).toBe(`${origin}/blog`);
		expect(schema.itemListElement?.[1]?.item).toBeUndefined();
	});
});
