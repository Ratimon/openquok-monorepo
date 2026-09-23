import type { IconName } from '$data/icons';
import { icons } from '$data/icons';
import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';
import { socialProviderIcon } from '$data/social-providers';

import {
	buildLandingAnalyticsVmFromChannels,
	type LandingAnalyticsMetricSeed
} from '$lib/ui/templates/bento/minor-templates/landingAnalyticsMockUtils';

import { INSTAGRAM_LANDING_ANALYTICS_MOCK_CHANNELS } from './instagramLandingMock';

const BUSINESS_METRIC_SEEDS: LandingAnalyticsMetricSeed[] = [
	{
		label: 'Reach',
		start: 318,
		floor: 270,
		drift: 11,
		swing: 48,
		percentageChange: { 7: 7.4, 30: 5.6, 90: 3.8 }
	},
	{
		label: 'Views',
		start: 492,
		floor: 420,
		drift: 15,
		swing: 62,
		percentageChange: { 7: 9.2, 30: 6.8, 90: 4.5 }
	},
	{
		label: 'Likes',
		start: 74,
		floor: 58,
		drift: 3,
		swing: 12,
		percentageChange: { 7: 6.1, 30: 4.4, 90: 2.9 }
	},
	{
		label: 'Saves',
		start: 22,
		floor: 16,
		drift: 1,
		swing: 6,
		percentageChange: { 7: 4.8, 30: 3.5, 90: 2.2 }
	},
	{
		label: 'Comments',
		start: 14,
		floor: 10,
		drift: 1,
		swing: 5,
		percentageChange: { 7: 3.9, 30: 2.8, 90: 1.8 }
	},
	{
		label: 'Follower Count',
		start: 9,
		floor: 7,
		drift: 1,
		swing: 2,
		percentageChange: { 7: 2.6, 30: 1.9, 90: 1.2 }
	}
];

const STANDALONE_METRIC_SEEDS: LandingAnalyticsMetricSeed[] = [
	{
		label: 'Reach',
		start: 612,
		floor: 520,
		drift: 18,
		swing: 72,
		percentageChange: { 7: 12.8, 30: 9.6, 90: 6.4 }
	},
	{
		label: 'Views',
		start: 928,
		floor: 790,
		drift: 26,
		swing: 98,
		percentageChange: { 7: 14.4, 30: 10.8, 90: 7.2 }
	},
	{
		label: 'Likes',
		start: 156,
		floor: 128,
		drift: 6,
		swing: 22,
		percentageChange: { 7: 10.2, 30: 7.6, 90: 5.1 }
	},
	{
		label: 'Saves',
		start: 48,
		floor: 34,
		drift: 3,
		swing: 11,
		percentageChange: { 7: 8.4, 30: 6.2, 90: 4.1 }
	},
	{
		label: 'Comments',
		start: 31,
		floor: 22,
		drift: 2,
		swing: 8,
		percentageChange: { 7: 6.8, 30: 5.0, 90: 3.3 }
	},
	{
		label: 'Follower Count',
		start: 18,
		floor: 14,
		drift: 1,
		swing: 4,
		percentageChange: { 7: 4.2, 30: 3.1, 90: 2.0 }
	}
];

const METRIC_SEEDS_BY_PLATFORM: Record<string, LandingAnalyticsMetricSeed[]> = {
	instagram: BUSINESS_METRIC_SEEDS,
	'instagram-standalone': STANDALONE_METRIC_SEEDS
};

/** Instagram insights bento: Business uses outline icon; Standalone uses gradient glyph. */
export function landingInstagramAnalyticsProviderIcon(identifier: string): IconName {
	const id = String(identifier ?? '').trim();
	if (id === 'instagram') return icons.Instagram.name;
	if (id === 'instagram-standalone') return icons.InstagramGlyph.name;
	return socialProviderIcon(id);
}

export function buildInstagramLandingAnalyticsVm(
	dateWindowDays: number,
	channels: readonly CreateSocialPostChannelViewModel[] = INSTAGRAM_LANDING_ANALYTICS_MOCK_CHANNELS
) {
	return buildLandingAnalyticsVmFromChannels(dateWindowDays, channels, (channel) => {
		const seeds = METRIC_SEEDS_BY_PLATFORM[channel.identifier] ?? [];
		return seeds;
	});
}
