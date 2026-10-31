import { describe, expect, it } from 'vitest';

import { pickMainProductProfileId } from './startDirectoryLaunchFromSite.js';

describe('pickMainProductProfileId', () => {
	it('prefers main profiles over directory variants', () => {
		expect(
			pickMainProductProfileId([
				{ id: 'variant-1', profileKind: 'directory_variant' },
				{ id: 'main-1', profileKind: 'main' },
			])
		).toBe('main-1');
	});

	it('falls back to first profile when only variants exist', () => {
		expect(
			pickMainProductProfileId([{ id: 'variant-only', profileKind: 'directory_variant' }])
		).toBe('variant-only');
	});
});
