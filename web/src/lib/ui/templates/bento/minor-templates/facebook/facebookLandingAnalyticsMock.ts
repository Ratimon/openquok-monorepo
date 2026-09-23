import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

import {
	buildLandingAnalyticsVmFromChannels,
	type LandingAnalyticsMetricSeed
} from '$lib/ui/templates/bento/minor-templates/landingAnalyticsMockUtils';

import {
	FACEBOOK_LANDING_ANALYTICS_MOCK_CHANNELS,
	FACEBOOK_LANDING_MOCK_CHANNEL
} from './facebookLandingMock';

const METRIC_SEEDS: LandingAnalyticsMetricSeed[] = [
	{
		label: 'Page Impressions',
		start: 418,
		floor: 360,
		drift: 14,
		swing: 72,
		percentageChange: { 7: 12.4, 30: 9.8, 90: 6.2 }
	},
	{
		label: 'Posts Engagement',
		start: 84,
		floor: 68,
		drift: 3,
		swing: 14,
		percentageChange: { 7: 8.6, 30: 6.4, 90: 4.1 }
	},
	{
		label: 'Posts Impressions',
		start: 302,
		floor: 260,
		drift: 9,
		swing: 38,
		percentageChange: { 7: 5.2, 30: 3.8, 90: 2.5 }
	},
	{
		label: 'Page followers',
		start: 11,
		floor: 8,
		drift: 1,
		swing: 3,
		percentageChange: { 7: 3.1, 30: 2.4, 90: 1.6 }
	},
	{
		label: 'Videos views',
		start: 228,
		floor: 190,
		drift: 11,
		swing: 48,
		percentageChange: { 7: 15.8, 30: 11.2, 90: 7.5 }
	}
];

function seedsForFacebookChannel(channel: CreateSocialPostChannelViewModel): readonly LandingAnalyticsMetricSeed[] {
	const scale = channel.id === FACEBOOK_LANDING_MOCK_CHANNEL.id ? 1 : 0.72;
	return METRIC_SEEDS.map((seed) => ({
		...seed,
		start: Math.round(seed.start * scale),
		floor: Math.round(seed.floor * scale)
	}));
}

export function buildFacebookLandingAnalyticsVm(
	dateWindowDays: number,
	channels: readonly CreateSocialPostChannelViewModel[] = FACEBOOK_LANDING_ANALYTICS_MOCK_CHANNELS
) {
	return buildLandingAnalyticsVmFromChannels(dateWindowDays, channels, seedsForFacebookChannel);
}
