import { describe, expect, it } from 'vitest';

import { resolveListingHeaderSummary } from './resolveListingHeaderSummary';

describe('resolveListingHeaderSummary', () => {
	it('prefers excerpt over description', () => {
		expect(
			resolveListingHeaderSummary({
				excerpt: 'Short excerpt',
				description: 'Long description'
			})
		).toBe('Short excerpt');
	});

	it('falls back to description when excerpt is empty', () => {
		expect(
			resolveListingHeaderSummary({
				excerpt: '',
				description: 'Long description'
			})
		).toBe('Long description');
	});
});
