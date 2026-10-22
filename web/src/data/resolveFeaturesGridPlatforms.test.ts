import { describe, expect, it } from 'vitest';

import { resolveFeaturesGridPlatforms } from '$data/resolveFeaturesGridPlatforms';

describe('resolveFeaturesGridPlatforms', () => {
	it('resolves directory ids inside a social-led row', () => {
		const platforms = resolveFeaturesGridPlatforms([
			'tiktok',
			'linkedin',
			'peerpush'
		]);
		expect(platforms.map((p) => p.id)).toEqual(['tiktok', 'linkedin', 'peerpush']);
	});

	it('resolves the full home middle row including PeerPush', () => {
		const platforms = resolveFeaturesGridPlatforms([
			'tiktok',
			'linkedin',
			'x',
			'devto',
			'peerpush'
		]);
		expect(platforms).toHaveLength(5);
		expect(platforms.at(-1)?.id).toBe('peerpush');
	});
});
