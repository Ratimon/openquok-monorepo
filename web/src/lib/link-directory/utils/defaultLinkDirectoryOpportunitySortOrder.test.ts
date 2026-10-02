import { describe, expect, it } from 'vitest';

import { defaultLinkDirectoryOpportunitySortOrder } from './defaultLinkDirectoryOpportunitySortOrder';

describe('defaultLinkDirectoryOpportunitySortOrder', () => {
	it('returns 10 when the site has no opportunities', () => {
		expect(defaultLinkDirectoryOpportunitySortOrder([])).toBe(10);
	});

	it('returns max sort order plus 10', () => {
		expect(
			defaultLinkDirectoryOpportunitySortOrder([
				{ sortOrder: 10 },
				{ sortOrder: 30 },
				{ sortOrder: 20 }
			])
		).toBe(40);
	});
});
