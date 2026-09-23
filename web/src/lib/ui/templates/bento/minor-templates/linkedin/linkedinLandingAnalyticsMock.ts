import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

import {
	buildLandingAnalyticsVmFromChannels,
	type LandingAnalyticsMetricSeed
} from '$lib/ui/templates/bento/minor-templates/landingAnalyticsMockUtils';

import { LINKEDIN_LANDING_MOCK_CHANNEL } from './linkedinLandingMock';

const METRIC_SEEDS: LandingAnalyticsMetricSeed[] = [
	{
		label: 'Page Views',
		start: 312,
		floor: 260,
		drift: 11,
		swing: 48,
		percentageChange: { 7: 9.2, 30: 7.1, 90: 4.8 }
	},
	{
		label: 'Organic Followers',
		start: 14,
		floor: 10,
		drift: 2,
		swing: 4,
		percentageChange: { 7: 4.5, 30: 3.2, 90: 2.1 }
	},
	{
		label: 'Engagement',
		start: 96,
		floor: 72,
		drift: 4,
		swing: 18,
		percentageChange: { 7: 6.8, 30: 5.4, 90: 3.6 }
	},
	{
		label: 'Impressions',
		start: 1840,
		floor: 1500,
		drift: 42,
		swing: 180,
		percentageChange: { 7: 11.2, 30: 8.4, 90: 5.9 }
	},
	{
		label: 'Clicks',
		start: 118,
		floor: 90,
		drift: 5,
		swing: 22,
		percentageChange: { 7: 7.3, 30: 5.1, 90: 3.4 }
	}
];

export function buildLinkedInLandingAnalyticsVm(
	dateWindowDays: number,
	channels: readonly CreateSocialPostChannelViewModel[] = [LINKEDIN_LANDING_MOCK_CHANNEL]
) {
	return buildLandingAnalyticsVmFromChannels(dateWindowDays, channels, () => METRIC_SEEDS);
}
