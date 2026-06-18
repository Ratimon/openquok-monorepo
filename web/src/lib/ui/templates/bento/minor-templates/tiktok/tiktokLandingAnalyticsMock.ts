import type { AnalyticsSeriesViewModel } from '$lib/platform-analytics/GetAnalytics.presenter.svelte';
import { formatAnalyticsSeriesTotalsVm } from '$lib/platform-analytics/GetAnalytics.presenter.svelte';

type LandingAnalyticsDateWindow = 7 | 30 | 90;

type MetricSeed = {
	label: string;
	start: number;
	floor: number;
	drift: number;
	swing: number;
	percentageChange: Record<LandingAnalyticsDateWindow, number>;
};

/** Labels align with `TiktokProvider.analytics()` snapshot metrics. */
const METRIC_SEEDS: MetricSeed[] = [
	{
		label: 'Followers',
		start: 1840,
		floor: 1600,
		drift: 12,
		swing: 40,
		percentageChange: { 7: 3.2, 30: 2.8, 90: 2.1 }
	},
	{
		label: 'Following',
		start: 142,
		floor: 120,
		drift: 1,
		swing: 6,
		percentageChange: { 7: 0.8, 30: 0.5, 90: 0.3 }
	},
	{
		label: 'Likes',
		start: 12400,
		floor: 11000,
		drift: 85,
		swing: 220,
		percentageChange: { 7: 5.6, 30: 4.2, 90: 3.1 }
	},
	{
		label: 'Videos',
		start: 86,
		floor: 80,
		drift: 1,
		swing: 3,
		percentageChange: { 7: 2.4, 30: 1.9, 90: 1.2 }
	},
	{
		label: 'Views',
		start: 48200,
		floor: 42000,
		drift: 320,
		swing: 900,
		percentageChange: { 7: 6.1, 30: 4.8, 90: 3.4 }
	},
	{
		label: 'Recent Likes',
		start: 2100,
		floor: 1800,
		drift: 18,
		swing: 55,
		percentageChange: { 7: 4.5, 30: 3.6, 90: 2.7 }
	},
	{
		label: 'Recent Comments',
		start: 186,
		floor: 150,
		drift: 2,
		swing: 8,
		percentageChange: { 7: 2.2, 30: 1.8, 90: 1.1 }
	},
	{
		label: 'Recent Shares',
		start: 94,
		floor: 70,
		drift: 1,
		swing: 5,
		percentageChange: { 7: 1.6, 30: 1.2, 90: 0.8 }
	}
];

function seededUnit(key: string): number {
	let hash = 2_166_136_261;
	for (let i = 0; i < key.length; i += 1) {
		hash ^= key.charCodeAt(i);
		hash = Math.imul(hash, 1_677_761_9);
	}
	return (hash >>> 0) / 4_294_967_295;
}

function lastNDays(count: number): string[] {
	const dates: string[] = [];
	const today = new Date();
	for (let offset = count - 1; offset >= 0; offset -= 1) {
		const d = new Date(today);
		d.setDate(today.getDate() - offset);
		dates.push(d.toISOString().slice(0, 10));
	}
	return dates;
}

function normalizeDateWindow(dateWindowDays: number): LandingAnalyticsDateWindow {
	if (dateWindowDays === 30) return 30;
	if (dateWindowDays === 90) return 90;
	return 7;
}

function buildMetricSeries(seed: MetricSeed, dateWindowDays: LandingAnalyticsDateWindow): AnalyticsSeriesViewModel {
	const dates = lastNDays(dateWindowDays);
	const totals: number[] = [seed.start];

	for (let index = 1; index < dates.length; index += 1) {
		const flatRoll = seededUnit(`${seed.label}:${dateWindowDays}:${index}:flat`);
		const varianceRoll = seededUnit(`${seed.label}:${dateWindowDays}:${index}:var`);
		const previous = totals[index - 1] ?? seed.start;
		const priorDelta = index > 1 ? previous - (totals[index - 2] ?? seed.start) : 0;

		let delta = 0;
		if (flatRoll < 0.14) {
			delta = 0;
		} else {
			const centered = varianceRoll - 0.38;
			const momentum = priorDelta * 0.22;
			delta = Math.round(seed.drift + centered * seed.swing + momentum);
		}

		totals.push(Math.max(seed.floor, previous + delta));
	}

	return {
		label: seed.label,
		percentageChange: seed.percentageChange[dateWindowDays],
		data: dates.map((date, index) => ({ date, total: totals[index] ?? 0 }))
	};
}

export function buildTiktokLandingAnalyticsVm(dateWindowDays: number): {
	seriesVm: AnalyticsSeriesViewModel[];
	totals: string[];
} {
	const window = normalizeDateWindow(dateWindowDays);
	const seriesVm = METRIC_SEEDS.map((seed) => buildMetricSeries(seed, window));
	return {
		seriesVm,
		totals: formatAnalyticsSeriesTotalsVm(seriesVm)
	};
}
