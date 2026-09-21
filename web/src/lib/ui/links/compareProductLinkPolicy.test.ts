import { describe, expect, it } from 'vitest';

import { getCompareProductWebsiteUrl } from '$lib/content/constants/competitors/index';
import {
	buildExternalLinkRel,
	externalLinkRelForHref,
	resolveExternalLinkPolicy
} from '$lib/utils/externalLinkRel';

describe('CompareProductLink policy', () => {
	it('follows OpenQuok official website (dofollow external)', () => {
		const href = getCompareProductWebsiteUrl('openquok');
		expect(href).toBe('https://www.openquok.com');
		expect(resolveExternalLinkPolicy(href)).toEqual({ trusted: true, follow: true });
		expect(externalLinkRelForHref(href)).toBeUndefined();
		expect(buildExternalLinkRel(resolveExternalLinkPolicy(href))).toBeUndefined();
	});

	it('nofollows competitor official websites', () => {
		const href = getCompareProductWebsiteUrl('hootsuite');
		expect(href).toBe('https://www.hootsuite.com');
		expect(resolveExternalLinkPolicy(href)).toEqual({ trusted: false, follow: false });
		expect(externalLinkRelForHref(href)).toBe('noopener noreferrer nofollow');
		expect(buildExternalLinkRel(resolveExternalLinkPolicy(href))).toBe('noopener noreferrer nofollow');
	});
});
