import { describe, expect, it } from 'vitest';

import { integrationOAuthCallbackPath } from '$lib/integrations/utils/oauthCallbackPath';

describe('integrationOAuthCallbackPath', () => {
	it('returns the standard path for most providers', () => {
		expect(integrationOAuthCallbackPath('threads')).toBe('/integration/oauth/threads');
		expect(integrationOAuthCallbackPath('tiktok')).toBe('/integration/oauth/tiktok');
	});

	it('appends a trailing slash for TikTok Business', () => {
		expect(integrationOAuthCallbackPath('tiktok-business')).toBe('/integration/oauth/tiktok-business/');
	});
});
