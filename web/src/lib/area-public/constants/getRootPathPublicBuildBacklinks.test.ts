import { describe, expect, it } from 'vitest';

import {
	getRootPathPublicBuildBacklinks,
	getRootPathPublicBuildBacklinksCategories,
	getRootPathPublicBuildBacklinksCategory,
	getRootPathPublicBuildBacklinksSite,
	getRootPathPublicBuildBacklinksTag,
	getRootPathPublicBuildBacklinksTags
} from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';

describe('getRootPathPublicBuildBacklinks', () => {
	it('returns hub and nested path segments', () => {
		expect(getRootPathPublicBuildBacklinks()).toBe('build-backlinks');
		expect(getRootPathPublicBuildBacklinksCategories()).toBe('build-backlinks/categories');
		expect(getRootPathPublicBuildBacklinksTags()).toBe('build-backlinks/tags');
		expect(getRootPathPublicBuildBacklinksCategory('social-platforms')).toBe(
			'build-backlinks/categories/social-platforms'
		);
		expect(getRootPathPublicBuildBacklinksTag('dofollow')).toBe('build-backlinks/tags/dofollow');
		expect(getRootPathPublicBuildBacklinksSite('reddit')).toBe('build-backlinks/reddit');
	});
});
