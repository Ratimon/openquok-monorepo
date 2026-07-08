import type { PublicAgentComparisonSection } from '$lib/content/constants/agents/types';

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
	if (left.slug === 'openquok' || right.slug === 'openquok') {
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
		title: `${left.comparison.headline}, not another ${right.comparison.notAnother}`,
		description: `${right.name} is built for ${right.comparison.builtFor}. ${left.name} ${left.comparison.positioningWhenLeft}.`,
		withoutTitle: right.comparison.withoutTitle ?? `Typical ${right.name} workflow`,
		withTitle: left.name,
		points: zipComparisonPoints(left, right)
	};
}

function zipComparisonPoints(left: CompareProduct, right: CompareProduct) {
	const count = Math.min(left.comparison.advantages.length, right.comparison.disadvantages.length);
	return Array.from({ length: count }, (_, index) => ({
		pain: right.comparison.disadvantages[index]!,
		feature: left.comparison.advantages[index]!
	}));
}
