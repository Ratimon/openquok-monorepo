import { describe, expect, it } from 'vitest';

import { loadMergedManifest } from '../../scripts/merge-manifest.mjs';

describe('loadMergedManifest (firefox)', () => {
	it('uses background.scripts instead of service_worker', () => {
		const manifest = loadMergedManifest('firefox') as {
			background?: { scripts?: string[]; service_worker?: string; type?: string };
		};
		expect(manifest.background?.service_worker).toBeUndefined();
		expect(manifest.background?.scripts).toEqual(['background.js']);
		expect(manifest.background?.type).toBe('module');
	});
});