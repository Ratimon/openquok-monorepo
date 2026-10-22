import { describe, expect, it } from 'vitest';

import { FEATURES_GRID_HOME_ROWS } from '$data/landing-home-features-grid';
import {
	FEATURES_GRID_SOCIAL_ROWS,
	featuresGridPlatformsForRow,
	resolveLandingSocialPlatformChannelSlug
} from '$data/landing-social-platforms';

describe('FEATURES_GRID_SOCIAL_ROWS', () => {
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
