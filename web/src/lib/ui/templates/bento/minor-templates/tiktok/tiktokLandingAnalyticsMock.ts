import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

import {
	buildLandingAnalyticsVmFromChannels,
	type LandingAnalyticsMetricSeed
} from '$lib/ui/templates/bento/minor-templates/landingAnalyticsMockUtils';

import { TIKTOK_LANDING_MOCK_CHANNEL } from './tiktokLandingMock';

/** Labels align with `TiktokProvider.analytics()` snapshot metrics. */
const METRIC_SEEDS: LandingAnalyticsMetricSeed[] = [
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

export function buildTiktokLandingAnalyticsVm(
	dateWindowDays: number,
	channels: readonly CreateSocialPostChannelViewModel[] = [TIKTOK_LANDING_MOCK_CHANNEL]
) {
	return buildLandingAnalyticsVmFromChannels(dateWindowDays, channels, () => METRIC_SEEDS);
}
