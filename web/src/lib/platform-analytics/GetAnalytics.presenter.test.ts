import type { AnalyticsRepository } from '$lib/platform-analytics/Analytics.repository.svelte';

import { describe, expect, it, vi } from 'vitest';

import {
	alignChartLineValues,
	buildAnalyticsOverviewChartVm,
	buildAnalyticsOverviewSummaryVm,
	flattenIntegrationAnalyticsSeriesVm,
	GetAnalyticsPresenter,
	mergeAnalyticsSeriesVm,
	pickSeriesForMetricFamily,
	type AnalyticsSeriesViewModel
} from '$lib/platform-analytics/GetAnalytics.presenter.svelte';

const series = (label: string, total: number, date = '2026-01-01'): AnalyticsSeriesViewModel => ({
	label,
	data: [{ date, total }]
});

const seriesWith = (
	overrides: Partial<AnalyticsSeriesViewModel> & Pick<AnalyticsSeriesViewModel, 'label'>
): AnalyticsSeriesViewModel => ({
	data: [{ date: '2026-01-01', total: 1 }],
	...overrides
});

describe('flattenIntegrationAnalyticsSeriesVm', () => {
	it('attaches integrationId, providerIdentifier, and channelName to each series', () => {
		const integrations = [
			{ id: 'int-a', identifier: 'linkedin', name: 'Acme LinkedIn' },
			{ id: 'int-b', identifier: 'facebook', name: 'Acme Facebook Page' }
		];
		const results: AnalyticsSeriesViewModel[][] = [
			[series('Comments', 10), series('Views', 100)],
			[series('Comments', 5)]
		];

		const flattened = flattenIntegrationAnalyticsSeriesVm(integrations, results);

		expect(flattened).toHaveLength(3);
		expect(flattened[0]).toMatchObject({
			label: 'Comments',
			integrationId: 'int-a',
			providerIdentifier: 'linkedin',
			channelName: 'Acme LinkedIn'
		});
		expect(flattened[1]).toMatchObject({
			label: 'Views',
			integrationId: 'int-a',
			providerIdentifier: 'linkedin',
			channelName: 'Acme LinkedIn'
		});
		expect(flattened[2]).toMatchObject({
			label: 'Comments',
			integrationId: 'int-b',
			providerIdentifier: 'facebook',
			channelName: 'Acme Facebook Page'
		});
	});

	it('keeps duplicate labels from different integrations as separate series', () => {
		const integrations = [
			{ id: 'int-1', identifier: 'x', name: 'Channel One' },
			{ id: 'int-2', identifier: 'x', name: 'Channel Two' }
		];
		const results: AnalyticsSeriesViewModel[][] = [
			[series('Comments', 3)],
			[series('Comments', 7)]
		];

		const flattened = flattenIntegrationAnalyticsSeriesVm(integrations, results);

		expect(flattened).toHaveLength(2);
		expect(flattened.map((s) => s.integrationId)).toEqual(['int-1', 'int-2']);
		expect(flattened.map((s) => s.data[0]?.total)).toEqual([3, 7]);
	});

	it('does not sum metrics when zipping integrations with results', () => {
		const integrations = [
			{ id: 'a', identifier: 'instagram', name: 'IG' },
			{ id: 'b', identifier: 'tiktok', name: 'TT' }
		];
		const results: AnalyticsSeriesViewModel[][] = [
			[series('Followers', 100)],
			[series('Followers', 200)]
		];

		const flattened = flattenIntegrationAnalyticsSeriesVm(integrations, results);
		const merged = mergeAnalyticsSeriesVm(results);

		expect(flattened).toHaveLength(2);
		expect(merged).toHaveLength(1);
		expect(merged[0]?.data[0]?.total).toBe(300);
	});
});

describe('mergeAnalyticsSeriesVm', () => {
	it('sums totals by date for the same label across lists', () => {
		const listA: AnalyticsSeriesViewModel[] = [
			series('Comments', 2, '2026-01-01'),
			series('Comments', 3, '2026-01-02')
		];
		const listB: AnalyticsSeriesViewModel[] = [
			series('Comments', 5, '2026-01-01'),
			series('Comments', 1, '2026-01-02')
		];

		const merged = mergeAnalyticsSeriesVm([listA, listB]);

		expect(merged).toHaveLength(1);
		expect(merged[0]?.label).toBe('Comments');
		expect(merged[0]?.data).toEqual([
			{ date: '2026-01-01', total: 7 },
			{ date: '2026-01-02', total: 4 }
		]);
	});

	it('returns a single list unchanged when only one channel is provided', () => {
		const single = [[series('Views', 42)]];

		const merged = mergeAnalyticsSeriesVm(single);

		expect(merged).toEqual([{ label: 'Views', data: [{ date: '2026-01-01', total: 42 }] }]);
	});
});

describe('pickSeriesForMetricFamily', () => {
	it('prefers views-like labels over engagement on the same channel', () => {
		const list = [
			seriesWith({ label: 'Posts Engagement', data: [{ date: '2026-01-01', total: 5 }] }),
			seriesWith({ label: 'Page Impressions', data: [{ date: '2026-01-01', total: 100 }] })
		];

		expect(pickSeriesForMetricFamily(list, 'views')?.label).toBe('Page Impressions');
		expect(pickSeriesForMetricFamily(list, 'engagement')?.label).toBe('Posts Engagement');
	});

	it('maps follower and subscriber labels to the followers family', () => {
		const list = [
			seriesWith({ label: 'Organic Followers', data: [{ date: '2026-01-01', total: 50 }] }),
			seriesWith({ label: 'Comments', data: [{ date: '2026-01-01', total: 2 }] })
		];

		expect(pickSeriesForMetricFamily(list, 'followers')?.label).toBe('Organic Followers');
	});
});

describe('buildAnalyticsOverviewSummaryVm', () => {
	it('sums period totals per channel without merging duplicate labels across channels', () => {
		const flattened: AnalyticsSeriesViewModel[] = [
			seriesWith({
				label: 'Views',
				integrationId: 'a',
				data: [{ date: '2026-01-01', total: 10 }, { date: '2026-01-02', total: 15 }]
			}),
			seriesWith({
				label: 'Views',
				integrationId: 'b',
				data: [{ date: '2026-01-01', total: 20 }]
			})
		];

		const summary = buildAnalyticsOverviewSummaryVm(flattened);
		const views = summary.find((row) => row.family === 'views');

		expect(views?.formattedTotal).toBe('45');
		expect(views?.channelCount).toBe(2);
	});
});

describe('buildAnalyticsOverviewChartVm', () => {
	it('returns one line per integration with aligned dates', () => {
		const flattened: AnalyticsSeriesViewModel[] = [
			seriesWith({
				label: 'Impressions',
				integrationId: 'x-1',
				channelName: 'One',
				data: [
					{ date: '2026-01-01', total: 1 },
					{ date: '2026-01-02', total: 3 }
				]
			}),
			seriesWith({
				label: 'Impressions',
				integrationId: 'x-2',
				channelName: 'Two',
				data: [{ date: '2026-01-02', total: 5 }]
			})
		];

		const chart = buildAnalyticsOverviewChartVm(flattened, 'views');

		expect(chart.lines).toHaveLength(2);
		expect(chart.dates).toEqual(['2026-01-01', '2026-01-02']);
		expect(alignChartLineValues(chart.lines[0]!, chart.dates)).toEqual([1, 3]);
		expect(alignChartLineValues(chart.lines[1]!, chart.dates)).toEqual([0, 5]);
	});
});

describe('GetAnalyticsPresenter', () => {
	it('loadMergedAnalyticsSeriesVm returns flattened per-channel series', async () => {
		const analyticsRepository = {
			getIntegrationAnalytics: vi.fn(async ({ integrationId }: { integrationId: string }) => {
				if (integrationId === 'int-1') {
					return {
						ok: true as const,
						data: [{ label: 'Comments', data: [{ date: '2026-01-01', total: 4 }] }]
					};
				}
				return {
					ok: true as const,
					data: [{ label: 'Comments', data: [{ date: '2026-01-01', total: 6 }] }]
				};
			}),
			getPostAnalytics: vi.fn()
		} as unknown as AnalyticsRepository;

		const presenter = new GetAnalyticsPresenter(analyticsRepository);
		const result = await presenter.loadMergedAnalyticsSeriesVm({
			organizationId: 'org-1',
			dateWindowDays: 7,
			integrations: [
				{ id: 'int-1', identifier: 'linkedin', name: 'Page A' },
				{ id: 'int-2', identifier: 'facebook', name: 'Page B' }
			] as Parameters<GetAnalyticsPresenter['loadMergedAnalyticsSeriesVm']>[0]['integrations']
		});

		expect(result).toHaveLength(2);
		expect(result[0]).toMatchObject({
			label: 'Comments',
			integrationId: 'int-1',
			providerIdentifier: 'linkedin',
			channelName: 'Page A',
			data: [{ date: '2026-01-01', total: 4 }]
		});
		expect(result[1]).toMatchObject({
			label: 'Comments',
			integrationId: 'int-2',
			providerIdentifier: 'facebook',
			channelName: 'Page B',
			data: [{ date: '2026-01-01', total: 6 }]
		});
	});

	it('loadPostStatisticsAnalyticsVm still merges series for the modal path', async () => {
		const analyticsRepository = {
			getPostAnalytics: vi.fn(async () => ({
				ok: true as const,
				data: [
					{ label: 'Clicks', data: [{ date: '2026-01-01', total: 2 }] },
					{ label: 'Clicks', data: [{ date: '2026-01-01', total: 3 }] }
				]
			})),
			getIntegrationAnalytics: vi.fn()
		} as unknown as AnalyticsRepository;

		const presenter = new GetAnalyticsPresenter(analyticsRepository);
		const result = await presenter.loadPostStatisticsAnalyticsVm({
			organizationId: 'org-1',
			postId: 'post-1',
			date: 30
		});

		expect(result.seriesVm).toHaveLength(1);
		expect(result.seriesVm[0]?.data[0]?.total).toBe(5);
		expect(result.totalsVm).toHaveLength(1);
	});
});
