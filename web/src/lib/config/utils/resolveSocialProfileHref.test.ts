import { describe, expect, it } from 'vitest';

import { resolveSocialProfileHref } from '$lib/config/constants/config';

describe('resolveSocialProfileHref', () => {
	it('uses git default when marketing config is empty', () => {
		expect(resolveSocialProfileHref('SOCIAL_LINKS_DISCORD', {})).toBe(
			'https://discord.com/invite/xBfTzZr63W'
		);
	});

	it('prefers non-empty marketing_information override', () => {
		expect(
			resolveSocialProfileHref('SOCIAL_LINKS_DISCORD', {
				SOCIAL_LINKS_DISCORD: 'https://discord.com/invite/from-admin'
			})
		).toBe('https://discord.com/invite/from-admin');
	});

	it('falls back when override is whitespace', () => {
		expect(
			resolveSocialProfileHref('SOCIAL_LINKS_DISCORD', {
				SOCIAL_LINKS_DISCORD: '   '
			})
		).toBe('https://discord.com/invite/xBfTzZr63W');
	});
});
