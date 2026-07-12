import { socialPlatformIconForLabel } from '$data/social-providers';

import type { ComparisonPoint } from '$lib/ui/templates/WithWithout.svelte';
import type { CompareTalkingPointId } from '$lib/content/constants/competitors/types';

export const COMPARE_CHANNELS_SECTION = {
	subtitle: 'platform coverage',
	title: 'Supported channels',
	description:
		'Compare which social networks each scheduler supports today. Platforms on our roadmap are marked with an hourglass.'
};

/** Display order for topic-keyed comparison rows. */
export const COMPARE_TALKING_POINT_ORDER: readonly CompareTalkingPointId[] = [
	'agent_workflow',
	'pricing_model',
	'workspace_isolation',
	'product_focus',
	'programmatic_access',
	'publishing_control'
];

/** Default left-side product slug for the public compare hub and related-pair links. */
export const COMPARE_HUB_BASE_SLUG = 'openquok' as const;

/** Official marketing sites for compare / alternatives surfaces. */
export const COMPARE_PRODUCT_WEBSITE_URLS = {
	openquok: 'https://www.openquok.com',
	hootsuite: 'https://www.hootsuite.com',
	buffer: 'https://buffer.com'
} as const satisfies Record<typeof COMPARE_HUB_BASE_SLUG | 'hootsuite' | 'buffer', string>;

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
