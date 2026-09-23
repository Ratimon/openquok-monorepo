import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';
import type { AnalyticsSeriesViewModel } from '$lib/platform-analytics/GetAnalytics.presenter.svelte';
import {
	flattenIntegrationAnalyticsSeriesVm,
	formatAnalyticsSeriesTotalsVm
} from '$lib/platform-analytics/GetAnalytics.presenter.svelte';

export type LandingAnalyticsDateWindow = 7 | 30 | 90;

export type LandingAnalyticsMetricSeed = {
	label: string;
	start: number;
	floor: number;
	drift: number;
	swing: number;
	percentageChange: Record<LandingAnalyticsDateWindow, number>;
};

/** Deterministic 0–1 noise so landing previews stay stable across renders. */
export function landingAnalyticsSeededUnit(key: string): number {
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

export function normalizeLandingAnalyticsDateWindow(dateWindowDays: number): LandingAnalyticsDateWindow {
	if (dateWindowDays === 30) return 30;
	if (dateWindowDays === 90) return 90;
	return 7;
}

export function buildLandingAnalyticsMetricSeries(
	seriesKey: string,
	seed: LandingAnalyticsMetricSeed,
	dateWindowDays: LandingAnalyticsDateWindow
): AnalyticsSeriesViewModel {
	const dates = lastNDays(dateWindowDays);
	const totals: number[] = [seed.start];

	for (let index = 1; index < dates.length; index += 1) {
		const flatRoll = landingAnalyticsSeededUnit(`${seriesKey}:${seed.label}:${dateWindowDays}:${index}:flat`);
		const varianceRoll = landingAnalyticsSeededUnit(`${seriesKey}:${seed.label}:${dateWindowDays}:${index}:var`);
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

export function buildLandingAnalyticsVmFromChannels(
	dateWindowDays: number,
	channels: readonly CreateSocialPostChannelViewModel[],
	resolveSeeds: (channel: CreateSocialPostChannelViewModel) => readonly LandingAnalyticsMetricSeed[]
): {
	seriesVm: AnalyticsSeriesViewModel[];
	totals: string[];
} {
	const window = normalizeLandingAnalyticsDateWindow(dateWindowDays);
	if (channels.length === 0) {
		return { seriesVm: [], totals: [] };
	}

	const perChannel = channels.map((channel) => {
		const seriesKey = `${channel.id}:${channel.identifier}`;
		return resolveSeeds(channel).map((seed) =>
			buildLandingAnalyticsMetricSeries(seriesKey, seed, window)
		);
	});

	const seriesVm = flattenIntegrationAnalyticsSeriesVm(channels, perChannel);
	return {
		seriesVm,
		totals: formatAnalyticsSeriesTotalsVm(seriesVm)
	};
}
