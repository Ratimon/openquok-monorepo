import { describe, expect, it } from 'vitest';

import {
	CREDENTIALS_SOCIAL_PROVIDER_IDENTIFIERS,
	OAUTH_SOCIAL_PROVIDER_IDENTIFIERS,
} from 'openquok-common';

import {
	getSocialProviderBadgeSvg,
	socialProviderBadgeIconName,
	SOCIAL_PROVIDER_BADGE_SIZE_PX,
} from './socialProviderBadgeSvg.js';

describe('socialProviderBadgeSvg', () => {
	it('maps extension social posting identifiers to web icon names', () => {
		expect(socialProviderBadgeIconName('facebook')).toBe('FacebookGlyph');
		expect(socialProviderBadgeIconName('instagram-business')).toBe('Instagram');
		expect(socialProviderBadgeIconName('instagram-standalone')).toBe('InstagramGlyph');
		expect(socialProviderBadgeIconName('skool')).toBe('SkoolGlyph');
		expect(socialProviderBadgeIconName('  THREADS  ')).toBe('Threads');
	});

	it('covers every OAuth and credentials social provider', () => {
		for (const identifier of OAUTH_SOCIAL_PROVIDER_IDENTIFIERS) {
			expect(socialProviderBadgeIconName(identifier)).not.toBe('Link');
		}
		for (const identifier of CREDENTIALS_SOCIAL_PROVIDER_IDENTIFIERS) {
			expect(socialProviderBadgeIconName(identifier)).not.toBe('Link');
		}
	});

	it('returns a sized svg element with unique gradient ids per render', () => {
		const first = getSocialProviderBadgeSvg('instagram-standalone');
		const second = getSocialProviderBadgeSvg('instagram-standalone');
		expect(first).toMatch(/^<svg[^>]+width="14"/);
		expect(first).toContain('viewBox="0 0 680 680"');
		expect(first).not.toEqual(second);
		expect(first).toContain('igh_a');
		expect(second).toContain('InstagramGlyphspb_');
	});

	it('uses the generic link glyph for unknown identifiers', () => {
		const svg = getSocialProviderBadgeSvg('not-a-channel');
		expect(socialProviderBadgeIconName('not-a-channel')).toBe('Link');
		expect(svg).toContain('viewBox="0 0 24 24"');
	});

	it('defaults badge size to composer parity constant', () => {
		expect(SOCIAL_PROVIDER_BADGE_SIZE_PX).toBe(14);
		const custom = getSocialProviderBadgeSvg('facebook', 20);
		expect(custom).toContain('width="20"');
	});
});
