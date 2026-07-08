import type { PublicAgentComparisonSection } from '$lib/content/constants/agents/types';

import { COMPARE_HUB_BASE_SLUG } from '$lib/content/constants/competitors/shared';
import { COMPARE_TALKING_POINT_ORDER } from '$lib/content/constants/competitors/shared';
import type { ComparePair, CompareProduct, PublicFaqItemId } from '$lib/content/constants/competitors/types';

const DEFAULT_COMPARE_FAQ_ITEM_IDS: PublicFaqItemId[] = [
	'switch-from-buffer-hootsuite',
	'try-free',
	'multi-workspace'
];

export function buildComparePair(left: CompareProduct, right: CompareProduct): ComparePair {
	return {
		productASlug: left.slug,
		productBSlug: right.slug,
		metaTitle: `${left.name} vs ${right.name} — Social Media Scheduler Comparison`,
		metaDescription: `Compare ${left.name} and ${right.name} on pricing, channels, workspaces, agent integrations, and scheduling features. See which social media scheduler fits your workflow.`,
		keywords: buildCompareKeywords(left, right),
		heroTitle: `${left.name} vs ${right.name} comparison`,
		heroDescription: buildHeroDescription(left, right),
		withWithoutSection: buildWithWithoutSection(left, right),
		faqItemIds: DEFAULT_COMPARE_FAQ_ITEM_IDS
	};
}

function buildCompareKeywords(left: CompareProduct, right: CompareProduct): string[] {
	return [
		`${left.name} vs ${right.name}`,
		`${right.name} alternative`,
		'social media scheduler comparison',
		'agent social media scheduling',
		`${right.name} pricing`,
		`${left.name} pricing`,
		'AI agent social media',
		'multi-workspace scheduler'
	];
}

function buildHeroDescription(left: CompareProduct, right: CompareProduct): string {
	const base = `See how ${left.name} stacks up against ${right.name} on pricing, channels, team workflows, and scheduling features.`;
	if (left.slug === COMPARE_HUB_BASE_SLUG || right.slug === COMPARE_HUB_BASE_SLUG) {
		return `${base} Start with a 7-day free trial — no credit card required.`;
	}
	return base;
}

function buildWithWithoutSection(
	left: CompareProduct,
	right: CompareProduct
): PublicAgentComparisonSection {
	return {
		subtitle: 'comparisons',
		title: buildWithWithoutTitle(left, right),
		description: `${right.name} is built for ${right.comparison.builtFor}. ${left.name} ${left.comparison.positioningWhenLeft}.`,
		withoutTitle: right.comparison.withoutTitle ?? `Typical ${right.name} workflow`,
		withTitle: left.name,
		points: buildTopicComparisonPoints(left, right)
	};
}

function buildWithWithoutTitle(left: CompareProduct, right: CompareProduct): string {
	if (left.slug === COMPARE_HUB_BASE_SLUG) {
		return `${left.comparison.headline}, not another ${right.comparison.notAnother}`;
	}
	return `${left.comparison.headline} vs ${right.comparison.headline}`;
}

function buildTopicComparisonPoints(left: CompareProduct, right: CompareProduct) {
	return COMPARE_TALKING_POINT_ORDER.flatMap((topic) => {
		const strength = left.comparison.talkingPoints[topic]?.strength;
		const weakness = right.comparison.talkingPoints[topic]?.weakness;
		if (!strength || !weakness) return [];

		return [{ feature: strength, pain: weakness }];
	});
}
