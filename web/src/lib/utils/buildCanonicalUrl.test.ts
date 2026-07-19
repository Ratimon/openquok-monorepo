import { describe, expect, it } from 'vitest';

import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/utils/buildCanonicalUrl';
import type { MetaTagsProps } from 'svelte-meta-tags';

describe('buildCanonicalUrl', () => {
	it('returns path-only URL without query or hash', () => {
		const url = new URL(
			'https://www.openquok.com/pricing?utm_source=email&utm_medium=newsletter&fbclid=abc#section'
		);

		expect(buildCanonicalUrl(url)).toBe('https://www.openquok.com/pricing');
	});

	it('preserves pathname segments', () => {
		const url = new URL('https://www.openquok.com/blog/my-post?gclid=xyz');

		expect(buildCanonicalUrl(url)).toBe('https://www.openquok.com/blog/my-post');
	});
});

describe('withCanonicalMetaTags', () => {
	const baseMetaTags = {
		title: 'Pricing',
		description: 'Plans and pricing',
		canonical: 'https://config.example.com/pricing',
		openGraph: {
			url: 'https://config.example.com/pricing',
			title: 'Pricing',
			description: 'Plans and pricing'
		},
		twitter: { title: 'Pricing', description: 'Plans and pricing' },
		additionalMetaTags: [{ property: 'twitter:url', content: 'https://config.example.com/pricing' }]
	} satisfies MetaTagsProps;

	it('overrides canonical, openGraph.url, and twitter:url from request pathname', () => {
		const canonical = 'https://www.openquok.com/pricing';
		const pageMetaTags = withCanonicalMetaTags(baseMetaTags, canonical);

		expect(pageMetaTags.canonical).toBe(canonical);
		expect(pageMetaTags.openGraph?.url).toBe(canonical);
		expect(
			pageMetaTags.additionalMetaTags?.find(
				(tag) => 'property' in tag && tag.property === 'twitter:url'
			)
		).toMatchObject({ content: canonical });
	});
});
