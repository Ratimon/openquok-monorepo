import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

import {
	buildLandingAnalyticsVmFromChannels,
	type LandingAnalyticsMetricSeed
} from '$lib/ui/templates/bento/minor-templates/landingAnalyticsMockUtils';

import { YOUTUBE_LANDING_MOCK_CHANNEL } from './youtubeLandingMock';

/** Labels align with `YoutubeProvider.analytics()` channel time-series metrics. */
const METRIC_SEEDS: LandingAnalyticsMetricSeed[] = [
	{
		label: 'Views',
		start: 1240,
		floor: 980,
		drift: 38,
		swing: 120,
		percentageChange: { 7: 14.2, 30: 10.6, 90: 7.8 }
	},
	{
		label: 'Watch time (minutes)',
		start: 186,
		floor: 140,
		drift: 6,
		swing: 22,
		percentageChange: { 7: 11.4, 30: 8.9, 90: 5.5 }
	},
	{
		label: 'Avg view duration',
		start: 142,
		floor: 110,
		drift: 2,
		swing: 12,
		percentageChange: { 7: 4.8, 30: 3.2, 90: 2.1 }
	},
	{
		label: 'Avg view percentage',
		start: 48,
		floor: 38,
		drift: 1,
		swing: 6,
		percentageChange: { 7: 3.6, 30: 2.8, 90: 1.9 }
	},
	{
		label: 'Subscribers gained',
		start: 24,
		floor: 16,
		drift: 2,
		swing: 5,
		percentageChange: { 7: 9.2, 30: 6.8, 90: 4.4 }
	},
	{
		label: 'Likes',
		start: 92,
		floor: 72,
		drift: 4,
		swing: 14,
		percentageChange: { 7: 7.5, 30: 5.9, 90: 3.7 }
	},
	{
		label: 'Subscribers lost',
		start: 6,
		floor: 3,
		drift: 0,
		swing: 2,
		percentageChange: { 7: -2.1, 30: -1.4, 90: -0.8 }
	}
];

export function buildYoutubeLandingAnalyticsVm(
	dateWindowDays: number,
	channels: readonly CreateSocialPostChannelViewModel[] = [YOUTUBE_LANDING_MOCK_CHANNEL]
) {
	return buildLandingAnalyticsVmFromChannels(dateWindowDays, channels, () => METRIC_SEEDS);
}
