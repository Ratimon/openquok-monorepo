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

const METRIC_SEEDS: MetricSeed[] = [
	{
		label: 'Impressions',
		start: 1240,
		floor: 980,
		drift: 28,
		swing: 120,
		percentageChange: { 7: 10.4, 30: 7.9, 90: 5.1 }
	},
	{
		label: 'Likes',
		start: 88,
		floor: 64,
		drift: 3,
		swing: 14,
		percentageChange: { 7: 8.6, 30: 6.2, 90: 4.0 }
	},
	{
		label: 'Replies',
		start: 22,
		floor: 14,
		drift: 2,
		swing: 7,
		percentageChange: { 7: 5.8, 30: 4.4, 90: 2.9 }
	},
	{
		label: 'Reposts',
		start: 18,
		floor: 10,
		drift: 1,
		swing: 6,
		percentageChange: { 7: 4.2, 30: 3.1, 90: 2.0 }
	},
	{
		label: 'Quotes',
		start: 7,
		floor: 4,
		drift: 1,
		swing: 3,
		percentageChange: { 7: 3.0, 30: 2.2, 90: 1.5 }
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

export function buildXLandingAnalyticsVm(dateWindowDays: number): {
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
