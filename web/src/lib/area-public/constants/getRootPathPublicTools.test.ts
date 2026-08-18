import { describe, expect, it } from 'vitest';

import {
	getRootPathPublicHumanize,
	getRootPathPublicHumanizeChannel,
	getRootPathPublicHumanizeLegacy,
	rewriteLegacyPublicHumanizePathname
} from '$lib/area-public/constants/getRootPathPublicTools';

describe('getRootPathPublicHumanize', () => {
	it('uses the humanizer URL segment', () => {
		expect(getRootPathPublicHumanize()).toBe('tools/humanizer');
		expect(getRootPathPublicHumanizeChannel('linkedin')).toBe('tools/humanizer/linkedin');
		expect(getRootPathPublicHumanizeLegacy()).toBe('tools/humanize');
	});
});

describe('rewriteLegacyPublicHumanizePathname', () => {
	it('rewrites the generic and channel legacy paths', () => {
		expect(rewriteLegacyPublicHumanizePathname('/tools/humanize')).toBe('/tools/humanizer');
		expect(rewriteLegacyPublicHumanizePathname('/tools/humanize/linkedin')).toBe(
			'/tools/humanizer/linkedin'
		);
	});

	it('does not rewrite the current humanizer paths', () => {
		expect(rewriteLegacyPublicHumanizePathname('/tools/humanizer')).toBeNull();
		expect(rewriteLegacyPublicHumanizePathname('/tools/humanizer/x')).toBeNull();
		expect(rewriteLegacyPublicHumanizePathname('/tools/photo-editor')).toBeNull();
	});
});
