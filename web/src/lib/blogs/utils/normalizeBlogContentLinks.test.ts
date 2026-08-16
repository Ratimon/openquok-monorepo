import { describe, expect, it } from 'vitest';

import {
	isExternalBlogHref,
	normalizeBlogContentLinks
} from '$lib/blogs/utils/normalizeBlogContentLinks';

describe('isExternalBlogHref', () => {
	it('treats relative and hash paths as internal', () => {
		expect(isExternalBlogHref('/pricing')).toBe(false);
		expect(isExternalBlogHref('/alternatives/buffer')).toBe(false);
		expect(isExternalBlogHref('#faq')).toBe(false);
	});

	it('treats own openquok.com hosts as internal', () => {
		expect(isExternalBlogHref('https://www.openquok.com/pricing')).toBe(false);
		expect(isExternalBlogHref('https://openquok.com/blog/x')).toBe(false);
	});

	it('treats third-party http(s) as external', () => {
		expect(isExternalBlogHref('https://buffer.com/')).toBe(true);
		expect(isExternalBlogHref('https://www.g2.com/products/buffer')).toBe(true);
	});
});

describe('normalizeBlogContentLinks', () => {
	it('adds ExternalLink defaults on external anchors', () => {
		const html = `<p><a href="https://buffer.com/">Buffer</a></p>`;
		expect(normalizeBlogContentLinks(html)).toBe(
			`<p><a href="https://buffer.com/" rel="noopener noreferrer nofollow" target="_blank">Buffer</a></p>`
		);
	});

	it('strips TipTap nofollow from internal anchors', () => {
		const html = `<p><a href="/pricing" rel="noopener noreferrer nofollow" target="_blank">Pricing</a></p>`;
		expect(normalizeBlogContentLinks(html)).toBe(`<p><a href="/pricing">Pricing</a></p>`);
	});

	it('keeps npmjs and first-party GitHub followable', () => {
		expect(normalizeBlogContentLinks('<p><a href="https://www.npmjs.com/package/@openquok/auto-cli">CLI</a></p>')).toBe(
			'<p><a href="https://www.npmjs.com/package/@openquok/auto-cli" target="_blank">CLI</a></p>'
		);
		expect(
			normalizeBlogContentLinks(
				'<p><a href="https://github.com/Ratimon/openquok-monorepo/tree/main/agent">openquok-core</a></p>'
			)
		).toBe(
			'<p><a href="https://github.com/Ratimon/openquok-monorepo/tree/main/agent" target="_blank">openquok-core</a></p>'
		);
	});

	it('nofollows third-party GitHub', () => {
		const html = '<p><a href="https://github.com/renezander030/capcut-cli">capcut-cli</a></p>';
		expect(normalizeBlogContentLinks(html)).toBe(
			'<p><a href="https://github.com/renezander030/capcut-cli" rel="noopener noreferrer nofollow" target="_blank">capcut-cli</a></p>'
		);
	});
});
