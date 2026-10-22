import { describe, expect, it } from 'vitest';

import { buildDirectorySeoHistoryChartSeries } from '$lib/directory-seo/buildDirectorySeoHistoryChartSeries';

describe('buildDirectorySeoHistoryChartSeries', () => {
	it('includes product line and selected competitor with snapshot fallback', () => {
		const series = buildDirectorySeoHistoryChartSeries({
			productDomain: { domain: 'openquok.com', domainRating: 15, checkedAt: null, delta7Days: null, delta30Days: null, delta90Days: null },
			history: {
				product: [{ capturedAt: '2026-10-15T00:00:00.000Z', domainRating: 15 }],
				competitors: []
			},
			competitors: [
				{
					domain: 'postiz.com',
					label: 'Postiz',
					sortOrder: 0,
					domainRating: 50,
					checkedAt: '2026-10-15T00:00:00.000Z'
				}
			],
			selectedCompetitorDomains: new Set(['postiz.com'])
		});

		expect(series).toHaveLength(2);
		expect(series[0].label).toContain('openquok.com');
		expect(series[1].label).toBe('Postiz');
		expect(series[1].points.length).toBeGreaterThan(0);
		expect(series[1].points[0].domainRating).toBe(50);
		expect(series[0].color).not.toBe(series[1].color);
	});
});
