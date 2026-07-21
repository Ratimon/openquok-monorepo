import type { PublicAgentComparisonSection } from '$lib/content/constants/agents/types';
import type { ComparePair, CompareProduct, PublicFaqItemId } from '$lib/content/constants/competitors/types';

import { COMPARE_HUB_BASE_SLUG } from '$lib/content/constants/competitors/shared';
import { COMPARE_TALKING_POINT_ORDER } from '$lib/content/constants/competitors/shared';
import { buildComparePairMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';

const DEFAULT_COMPARE_FAQ_ITEM_IDS: PublicFaqItemId[] = [
	'switch-from-buffer-hootsuite',
	'try-free',
	'multi-workspace'
];

export function buildComparePair(left: CompareProduct, right: CompareProduct): ComparePair {
	return {
		productASlug: left.slug,
		productBSlug: right.slug,
		metaTitle: buildComparePairMetaTitle(left, right),
		metaDescription: buildCompareMetaDescription(left, right),
		keywords: buildCompareKeywords(left, right),
		heroTitle: `${left.name} vs ${right.name}: Compare Side by Side`,
		heroDescription: buildHeroDescription(left, right),
		withWithoutSection: buildWithWithoutSection(left, right),
		faqItemIds: DEFAULT_COMPARE_FAQ_ITEM_IDS
	};
}

function buildCompareMetaDescription(left: CompareProduct, right: CompareProduct): string {
	const comparisonCore = `Compare ${left.name} and ${right.name} side by side on pricing, channels, workspaces, agent integrations, and scheduling features.`;
	return `${comparisonCore} ${buildCompareAlternativeClosing(left, right)}`;
}

function buildCompareAlternativeClosing(left: CompareProduct, right: CompareProduct): string {
	if (left.slug === COMPARE_HUB_BASE_SLUG) {
		return `Discover why teams choose ${left.name} as a ${right.name} alternative for agent workflows and multi-workspace publishing.`;
	}
	if (right.slug === COMPARE_HUB_BASE_SLUG) {
		return `See how ${right.name} compares as a ${left.name} alternative for social media scheduling and programmatic publishing.`;
	}
	return 'See which social media scheduler fits your workflow.';
}

function buildCompareKeywords(left: CompareProduct, right: CompareProduct): string[] {
	const keywords = [
		`${left.name} vs ${right.name}`,
		`${right.name} alternative`,
		'best social media scheduler',
		'social media scheduler comparison',
		'agent social media scheduling',
		`${right.name} pricing`,
		`${left.name} pricing`,
		'AI agent social media',
		'multi-workspace scheduler'
	];

	if (left.slug === COMPARE_HUB_BASE_SLUG) {
		keywords.push(`best ${right.name} alternative`);
	} else if (right.slug === COMPARE_HUB_BASE_SLUG) {
		keywords.push(`best ${left.name} alternative`);
	}

	return keywords;
}

function buildHeroDescription(left: CompareProduct, right: CompareProduct): string {
	const base = `Compare ${left.name} and ${right.name} side by side on pricing, channels, and features.`;
	const openQuokPitch =
		left.slug === COMPARE_HUB_BASE_SLUG || right.slug === COMPARE_HUB_BASE_SLUG
			? ` ${buildCompareAlternativeClosing(left, right)}`
			: '';
	const trialNote =
		left.slug === COMPARE_HUB_BASE_SLUG || right.slug === COMPARE_HUB_BASE_SLUG
			? ' Start with a 7-day free trial — no credit card required.'
			: '';

	return `${base}${openQuokPitch}${trialNote}`;
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
