import { describe, expect, it } from 'vitest';

import { integrationProfilePictureNeedsAuthenticatedProxy } from '$lib/core/Image.repository.svelte';

describe('integrationProfilePictureNeedsAuthenticatedProxy', () => {
	it('matches Instagram and LinkedIn CDN hosts (Facebook uses Graph /picture in the browser)', () => {
		expect(
			integrationProfilePictureNeedsAuthenticatedProxy('https://scontent.cdninstagram.com/v/t51.jpg')
		).toBe(true);
		expect(
			integrationProfilePictureNeedsAuthenticatedProxy(
				'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=1'
			)
		).toBe(false);
		expect(integrationProfilePictureNeedsAuthenticatedProxy('https://scontent.xx.fbcdn.net/v/t1.jpg')).toBe(
			false
		);
		expect(
			integrationProfilePictureNeedsAuthenticatedProxy('https://media.licdn.com/dms/image/v2/abc.jpg')
		).toBe(true);
	});

	it('rejects unrelated hosts and invalid URLs', () => {
		expect(integrationProfilePictureNeedsAuthenticatedProxy('https://yt3.ggpht.com/a.jpg')).toBe(false);
		expect(integrationProfilePictureNeedsAuthenticatedProxy('https://example.com/a.jpg')).toBe(false);
		expect(integrationProfilePictureNeedsAuthenticatedProxy('not-a-url')).toBe(false);
	});
});
