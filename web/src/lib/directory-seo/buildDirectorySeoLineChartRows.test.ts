import { describe, expect, it } from 'vitest';

import { buildDirectorySeoLineChartRows } from '$lib/directory-seo/buildDirectorySeoLineChartRows';

describe('buildDirectorySeoLineChartRows', () => {
	it('merges two series on the same calendar day into one row', () => {
		const rows = buildDirectorySeoLineChartRows([
			{
				key: 'line-0',
				points: [{ capturedAt: '2026-10-15T10:00:00.000Z', domainRating: 15 }]
			},
			{
				key: 'line-1',
				points: [{ capturedAt: '2026-10-15T18:00:00.000Z', domainRating: 50 }]
			}
		]);

		expect(rows).toHaveLength(1);
		expect(rows[0]['line-0']).toBe(15);
		expect(rows[0]['line-1']).toBe(50);
	});
});
