import { socialPlatformIconForLabel } from '$data/social-providers';

import type { ComparisonPoint } from '$lib/ui/templates/WithWithout.svelte';

export const COMPARE_CHANNELS_SECTION = {
	subtitle: 'platform coverage',
	title: 'Supported channels',
	description:
		'Compare which social networks each scheduler supports today. Platforms on our roadmap are marked with an hourglass.'
};

export function buildCompareChannelPoints(
	openquokChannels: readonly string[],
	competitorChannels: readonly string[]
): ComparisonPoint[] {
	const openquokSet = new Set(openquokChannels);
	const competitorSet = new Set(competitorChannels);
	const seen = new Set<string>();
	const ordered: string[] = [];

	for (const channel of competitorChannels) {
		if (!seen.has(channel)) {
			ordered.push(channel);
			seen.add(channel);
		}
	}

	for (const channel of openquokChannels) {
		if (!seen.has(channel)) {
			ordered.push(channel);
			seen.add(channel);
		}
	}

	return ordered.map((channel) => ({
		pain: channel,
		feature: channel,
		platformIcon: socialPlatformIconForLabel(channel),
		painIcon: competitorSet.has(channel) ? 'check' : 'x',
		featureIcon: openquokSet.has(channel) ? 'check' : 'hourglass'
	}));
}
