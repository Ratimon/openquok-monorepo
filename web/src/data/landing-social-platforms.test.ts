import { describe, expect, it } from 'vitest';

import { FEATURES_GRID_HOME_ROWS } from '$data/landing-home-features-grid';
import { HERO_DIRECTORY_PLATFORMS } from '$data/landing-directory-platforms';
import {
	FEATURES_GRID_SOCIAL_ROWS,
	HERO_BROWSER_EXTENSION_PLATFORMS,
	HERO_DRAFT_HANDOFF_PLATFORMS,
	HERO_SOCIAL_PLATFORMS,
	featuresGridPlatformsForRow,
	resolveLandingSocialPlatformChannelSlug
} from '$data/landing-social-platforms';

describe('FEATURES_GRID_SOCIAL_ROWS', () => {
	it('splits home hero icon rows into scheduled social and extended (draft + directory)', () => {
		expect(HERO_SOCIAL_PLATFORMS.map((platform) => platform.id)).not.toContain('reddit');
		expect(HERO_DRAFT_HANDOFF_PLATFORMS.map((platform) => platform.id)).toEqual(['reddit']);
		expect(HERO_DIRECTORY_PLATFORMS.map((platform) => platform.id)).toEqual(['peerpush', 'uneed']);
		expect([...HERO_DRAFT_HANDOFF_PLATFORMS, ...HERO_DIRECTORY_PLATFORMS].map((p) => p.id)).toEqual(
			['reddit', 'peerpush', 'uneed']
		);
		expect(HERO_BROWSER_EXTENSION_PLATFORMS.map((platform) => platform.id)).toEqual([
			'skool',
			'reddit',
			'peerpush',
			'uneed'
		]);
	});

	it('uses balanced row counts (4 + 4 + 3)', () => {
		const counts = FEATURES_GRID_SOCIAL_ROWS.map((row) => row.platformIds.length);
		expect(counts).toEqual([4, 4, 3]);
	});

	it('maps instagram tile ids to the instagram channel slug', () => {
		const standalone = featuresGridPlatformsForRow(['instagram-standalone'])[0];
		expect(standalone).toBeDefined();
		expect(resolveLandingSocialPlatformChannelSlug(standalone!)).toBe('instagram');
	});

	it('balances home grid as 4 + 5 + 4 with directory tiles in the stack', () => {
		const counts = FEATURES_GRID_HOME_ROWS.map((row) => row.platformIds.length);
		expect(counts).toEqual([4, 5, 4]);
		const ids = FEATURES_GRID_HOME_ROWS.flatMap((row) => row.platformIds);
		expect(ids).toContain('peerpush');
		expect(ids).toContain('uneed');
		expect(ids.filter((id) => id === 'peerpush').length).toBe(1);
		expect(new Set(ids).size).toBe(13);
	});
});
