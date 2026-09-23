import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

import {
	buildLandingAnalyticsVmFromChannels,
	type LandingAnalyticsMetricSeed
} from '$lib/ui/templates/bento/minor-templates/landingAnalyticsMockUtils';

import { THREADS_LANDING_MOCK_CHANNEL } from './threadsLandingMock';

const METRIC_SEEDS: LandingAnalyticsMetricSeed[] = [
	{
		label: 'Views',
		start: 612,
		floor: 520,
		drift: 18,
		swing: 84,
		percentageChange: { 7: 11.2, 30: 8.4, 90: 5.6 }
	},
	{
		label: 'Likes',
		start: 96,
		floor: 72,
		drift: 4,
		swing: 16,
		percentageChange: { 7: 9.1, 30: 6.8, 90: 4.3 }
	},
	{
		label: 'Replies',
		start: 28,
		floor: 18,
		drift: 2,
		swing: 8,
		percentageChange: { 7: 6.4, 30: 4.9, 90: 3.1 }
	},
	{
		label: 'Reposts',
		start: 14,
		floor: 8,
		drift: 1,
		swing: 5,
		percentageChange: { 7: 4.8, 30: 3.6, 90: 2.2 }
	},
	{
		label: 'Quotes',
		start: 9,
		floor: 5,
		drift: 1,
		swing: 4,
		percentageChange: { 7: 3.5, 30: 2.7, 90: 1.8 }
	}
];

export function buildThreadsLandingAnalyticsVm(
	dateWindowDays: number,
	channels: readonly CreateSocialPostChannelViewModel[] = [THREADS_LANDING_MOCK_CHANNEL]
) {
	return buildLandingAnalyticsVmFromChannels(dateWindowDays, channels, () => METRIC_SEEDS);
}
