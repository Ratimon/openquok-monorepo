import { describe, expect, it } from 'vitest';

import {
	getRootPathPublicHumanizer,
	getRootPathPublicHumanizerChannel
} from '$lib/area-public/constants/getRootPathPublicTools';

describe('getRootPathPublicHumanizer', () => {
	it('uses the humanizer URL segment', () => {
		expect(getRootPathPublicHumanizer()).toBe('tools/humanizer');
		expect(getRootPathPublicHumanizerChannel('linkedin')).toBe('tools/humanizer/linkedin');
	});
});
