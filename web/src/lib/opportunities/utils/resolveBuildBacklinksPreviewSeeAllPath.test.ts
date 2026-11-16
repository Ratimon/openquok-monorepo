import { describe, expect, it } from 'vitest';

import {
	resolveBuildBacklinksPreviewSeeAllPath,
	resolveFeaturedBacklinkSiteSlugForPreview
} from '$lib/opportunities/utils/resolveBuildBacklinksPreviewSeeAllPath';

describe('resolveBuildBacklinksPreviewSeeAllPath', () => {
	it('links channel context to site detail, not tag browse', () => {
		expect(
			resolveBuildBacklinksPreviewSeeAllPath({
				listingTagSlug: 'reddit',
				channelSlug: 'reddit'
			})
		).toBe('/build-backlinks/reddit');
	});

	it('uses valid build-backlinks tag browse when no site context', () => {
		expect(
			resolveBuildBacklinksPreviewSeeAllPath({
				listingTagSlug: 'dofollow'
			})
		).toBe('/build-backlinks/tags/dofollow');
	});

	it('falls back to hub without slugs', () => {
		expect(resolveBuildBacklinksPreviewSeeAllPath({})).toBe('/build-backlinks');
	});
});

describe('resolveFeaturedBacklinkSiteSlugForPreview', () => {
	it('prefers explicit featured slug over channel slug', () => {
		expect(
			resolveFeaturedBacklinkSiteSlugForPreview({
				featuredBacklinkSiteSlug: 'peerpush',
				channelSlug: 'reddit'
			})
		).toBe('peerpush');
	});
});