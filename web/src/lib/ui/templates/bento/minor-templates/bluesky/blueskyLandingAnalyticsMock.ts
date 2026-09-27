import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

import {
	buildLandingAnalyticsVmFromChannels,
	type LandingAnalyticsMetricSeed
} from '$lib/ui/templates/bento/minor-templates/landingAnalyticsMockUtils';

import { BLUESKY_LANDING_MOCK_CHANNEL } from './blueskyLandingMock';

const METRIC_SEEDS: LandingAnalyticsMetricSeed[] = [
	{
		label: 'Likes',
		start: 142,
		floor: 96,
		drift: 4,
		swing: 18,
		percentageChange: { 7: 9.2, 30: 6.8, 90: 4.5 }
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
		start: 34,
		floor: 22,
		drift: 2,
		swing: 10,
		percentageChange: { 7: 5.5, 30: 4.0, 90: 2.6 }
	},
	{
		label: 'Quotes',
		start: 11,
		floor: 6,
		drift: 1,
		swing: 4,
		percentageChange: { 7: 4.1, 30: 3.0, 90: 2.0 }
	}
];

export function buildBlueskyLandingAnalyticsVm(
	dateWindowDays: number,
	channels: readonly CreateSocialPostChannelViewModel[] = [BLUESKY_LANDING_MOCK_CHANNEL]
) {
	return buildLandingAnalyticsVmFromChannels(dateWindowDays, channels, () => METRIC_SEEDS);
}
