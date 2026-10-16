import { describe, expect, it } from 'vitest';

import { suggestBusinessProfileSlug } from './suggestBusinessProfileSlug';

describe('suggestBusinessProfileSlug', () => {
	it('slugifies product names like blog and link-directory admin', () => {
		expect(suggestBusinessProfileSlug('OpenQuok Scheduler')).toBe('openquok-scheduler');
		expect(suggestBusinessProfileSlug('  My Product!!  ')).toBe('my-product-');
	});
});
