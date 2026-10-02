import { describe, expect, it } from 'vitest';

import { resolveLinkDirectoryManualMetricsOnSave } from '$lib/link-directory/utils/resolveLinkDirectoryManualMetricsOnSave';

describe('resolveLinkDirectoryManualMetricsOnSave', () => {
	it('stamps updated-at and default source when DR changes on an existing site', () => {
		const result = resolveLinkDirectoryManualMetricsOnSave(
			{
				domainRating: 40,
				domainAuthority: null,
				monthlyVisits: null,
				metricsSource: null,
				metricsUpdatedAt: '2026-01-01T00:00:00.000Z'
			},
			{ domainRating: 42, domainAuthority: null, monthlyVisits: null, metricsSource: null }
		);

		expect(result.metrics_updated_at).toBeDefined();
		expect(result.metrics_source).toBe('Manual editor entry');
	});

	it('preserves explicit metrics source when provided', () => {
		const result = resolveLinkDirectoryManualMetricsOnSave(
			{
				domainRating: 10,
				domainAuthority: null,
				monthlyVisits: null,
				metricsSource: 'Old note',
				metricsUpdatedAt: null
			},
			{
				domainRating: 10,
				domainAuthority: null,
				monthlyVisits: null,
				metricsSource: 'Ahrefs export, 2026-03-01'
			}
		);

		expect(result.metrics_updated_at).toBeDefined();
		expect(result.metrics_source).toBe('Ahrefs export, 2026-03-01');
	});

	it('returns empty patch when nothing changed', () => {
		const result = resolveLinkDirectoryManualMetricsOnSave(
			{
				domainRating: 55,
				domainAuthority: 60,
				monthlyVisits: 1000,
				metricsSource: 'Manual',
				metricsUpdatedAt: '2026-02-01T00:00:00.000Z'
			},
			{
				domainRating: 55,
				domainAuthority: 60,
				monthlyVisits: 1000,
				metricsSource: 'Manual'
			}
		);

		expect(result).toEqual({});
	});
});
