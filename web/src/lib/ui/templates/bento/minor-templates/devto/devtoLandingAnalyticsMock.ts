import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

import {
	buildLandingAnalyticsVmFromChannels,
	type LandingAnalyticsMetricSeed
} from '$lib/ui/templates/bento/minor-templates/landingAnalyticsMockUtils';

import { DEVTO_LANDING_MOCK_CHANNEL } from './devtoLandingMock';

/** Labels match Dev.to analytics mapper (`Page Views`, `Reactions`, `Comments`). */
const METRIC_SEEDS: LandingAnalyticsMetricSeed[] = [
	{
		label: 'Page Views',
		start: 486,
		floor: 410,
		drift: 16,
		swing: 78,
		percentageChange: { 7: 12.6, 30: 9.1, 90: 5.8 }
	},
	{
		label: 'Reactions',
		start: 72,
		floor: 54,
		drift: 3,
		swing: 14,
		percentageChange: { 7: 8.4, 30: 6.2, 90: 3.9 }
	},
	{
		label: 'Comments',
		start: 18,
		floor: 11,
		drift: 1,
		swing: 6,
		percentageChange: { 7: 5.7, 30: 4.1, 90: 2.6 }
	}
];

export function buildDevtoLandingAnalyticsVm(
	dateWindowDays: number,
	channels: readonly CreateSocialPostChannelViewModel[] = [DEVTO_LANDING_MOCK_CHANNEL]
) {
	return buildLandingAnalyticsVmFromChannels(dateWindowDays, channels, () => METRIC_SEEDS);
}
