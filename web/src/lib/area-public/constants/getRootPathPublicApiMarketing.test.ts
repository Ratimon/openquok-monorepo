import { describe, expect, it } from 'vitest';

import {
	getRootPathSocialMediaPostingApi,
	getRootPathSocialMediaPostingApiPlatform,
	getRootPathSocialMediaSchedulingApi,
	getRootPathSocialMediaSchedulingApiPlatform
} from '$lib/area-public/constants/getRootPathPublicApiMarketing';

describe('getRootPathPublicApiMarketing', () => {
	it('resolves posting and scheduling hub segments', () => {
		expect(getRootPathSocialMediaPostingApi()).toBe('social-media-posting-api');
		expect(getRootPathSocialMediaSchedulingApi()).toBe('social-media-scheduling-api');
	});

	it('resolves platform slug paths', () => {
		expect(getRootPathSocialMediaPostingApiPlatform('tiktok')).toBe(
			'social-media-posting-api/tiktok'
		);
		expect(getRootPathSocialMediaSchedulingApiPlatform('x')).toBe(
			'social-media-scheduling-api/x'
		);
	});
});
