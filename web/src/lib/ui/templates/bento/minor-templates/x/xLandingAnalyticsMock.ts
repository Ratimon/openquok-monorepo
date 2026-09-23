import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

import {
	buildLandingAnalyticsVmFromChannels,
	type LandingAnalyticsMetricSeed
} from '$lib/ui/templates/bento/minor-templates/landingAnalyticsMockUtils';

import { X_LANDING_MOCK_CHANNEL } from './xLandingMock';

const METRIC_SEEDS: LandingAnalyticsMetricSeed[] = [
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

export function buildXLandingAnalyticsVm(
	dateWindowDays: number,
	channels: readonly CreateSocialPostChannelViewModel[] = [X_LANDING_MOCK_CHANNEL]
) {
	return buildLandingAnalyticsVmFromChannels(dateWindowDays, channels, () => METRIC_SEEDS);
}
