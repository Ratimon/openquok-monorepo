import { describe, expect, it } from 'vitest';

import {
	getRootPathPublicHumanizer,
	getRootPathPublicHumanizerChannel,
	getRootPathPublicPayloadWizard,
	getRootPathPublicPayloadWizardChannel
} from '$lib/area-public/constants/getRootPathPublicTools';

describe('getRootPathPublicHumanizer', () => {
	it('uses the humanizer URL segment', () => {
		expect(getRootPathPublicHumanizer()).toBe('tools/humanizer');
		expect(getRootPathPublicHumanizerChannel('linkedin')).toBe('tools/humanizer/linkedin');
	});
});

describe('getRootPathPublicPayloadWizard', () => {
	it('uses the payload wizard URL segment', () => {
		expect(getRootPathPublicPayloadWizard()).toBe('tools/payload-wizard');
		expect(getRootPathPublicPayloadWizardChannel('tiktok')).toBe('tools/payload-wizard/tiktok');
	});
});
