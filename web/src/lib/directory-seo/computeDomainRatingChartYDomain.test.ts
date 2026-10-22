import { describe, expect, it } from 'vitest';

import { computeDomainRatingChartYDomain } from '$lib/directory-seo/computeDomainRatingChartYDomain';

describe('computeDomainRatingChartYDomain', () => {
	it('pads a flat low rating instead of using 0–100', () => {
		const [min, max] = computeDomainRatingChartYDomain([15, 15, 15]);
		expect(min).toBeLessThan(15);
		expect(max).toBeGreaterThan(15);
		expect(max).toBeLessThanOrEqual(100);
		expect(min).toBeGreaterThanOrEqual(0);
	});

	it('uses data min/max with padding for a narrow band', () => {
		const [min, max] = computeDomainRatingChartYDomain([42, 48, 45]);
		expect(min).toBeLessThan(42);
		expect(max).toBeGreaterThan(48);
	});

	it('falls back to 0–100 when there are no values', () => {
		expect(computeDomainRatingChartYDomain([])).toEqual([0, 100]);
	});
});
