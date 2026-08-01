import { describe, expect, it } from 'vitest';

import {
	buildDocsBreadcrumbListItems,
	resolveDocsPageUrl
} from '$lib/docs/utils/buildDocsBreadcrumbJsonLd';

const requestUrl = new URL('https://www.openquok.com/docs/getting-started-for-cli');

describe('resolveDocsPageUrl', () => {
	it('returns an absolute URL using the request origin', () => {
		expect(resolveDocsPageUrl('/docs', requestUrl)).toBe('https://www.openquok.com/docs');
	});
});

describe('buildDocsBreadcrumbListItems', () => {
	it('uses Home + leaf when the path has a single segment', () => {
		const items = buildDocsBreadcrumbListItems('/docs', requestUrl);
		expect(items).toHaveLength(2);
		expect(items[0]).toMatchObject({
			position: 1,
			name: 'Home',
			item: 'https://www.openquok.com/'
		});
		expect(items[1]).toMatchObject({ position: 2, name: 'Docs' });
		expect(items[1]).not.toHaveProperty('item');
	});

	it('omits item on the last segment and uses absolute URLs elsewhere', () => {
		const items = buildDocsBreadcrumbListItems(
			'/docs/getting-started-for-cli/introduction',
			requestUrl
		);
		expect(items).toHaveLength(3);
		expect(items[0].item).toBe('https://www.openquok.com/docs');
		expect(items[1].item).toBe('https://www.openquok.com/docs/getting-started-for-cli');
		expect(items[2]).not.toHaveProperty('item');
	});
});
