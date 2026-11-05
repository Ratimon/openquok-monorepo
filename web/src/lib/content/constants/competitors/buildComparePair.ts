import type { PublicAgentComparisonSection } from '$lib/content/constants/agents/types';
import type { ComparePair, CompareProduct } from '$lib/content/constants/competitors/types';

import { buildCompareLongFormForPair } from '$lib/content/constants/competitors/buildCompareLongFormForPair';
import { COMPARE_HUB_BASE_SLUG, COMPARE_TALKING_POINT_ORDER } from '$lib/content/constants/competitors/shared';
import { resolveComparePairLayout } from '$lib/content/constants/competitors/utils/compareProductCategories';
import {
	PUBLIC_COMPARE_DETAIL_DIRECTORY_FAQ_ITEM_IDS,
	PUBLIC_COMPARE_DETAIL_SOCIAL_FAQ_ITEM_IDS
} from '$lib/content/constants/faq';
import { buildComparePairMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';

export function buildComparePair(left: CompareProduct, right: CompareProduct): ComparePair {
	const layout = resolveComparePairLayout(left, right);
	const isDirectoryLongForm = layout === 'directory_long_form';

	return {
		productASlug: left.slug,
		productBSlug: right.slug,
		layout,
		longForm: buildCompareLongFormForPair(left, right) ?? undefined,
		metaTitle: buildComparePairMetaTitle(left, right, layout),
		metaDescription: buildCompareMetaDescription(left, right, layout),
		keywords: buildCompareKeywords(left, right, layout),
		heroTitle: buildHeroTitle(left, right, layout),
		heroDescription: buildHeroDescription(left, right, layout),
		withWithoutSection: buildWithWithoutSection(left, right),
		faqItemIds: isDirectoryLongForm
			? [...PUBLIC_COMPARE_DETAIL_DIRECTORY_FAQ_ITEM_IDS]
			: [...PUBLIC_COMPARE_DETAIL_SOCIAL_FAQ_ITEM_IDS]
	};
}

function buildCompareMetaDescription(
	left: CompareProduct,
	right: CompareProduct,
	layout: ComparePair['layout']
): string {
	if (layout === 'directory_long_form') {
		return `Compare ${left.name} and ${right.name} for startup directory launch — done-for-you packages vs DIY profiles, extension autofill, and submission tracking. ${buildCompareAlternativeClosing(left, right, layout)}`;
	}

	const comparisonCore = `Compare prices, channels, workspaces, agent tools, and scheduling features for ${left.name} and ${right.name}.`;
	return `${comparisonCore} ${buildCompareAlternativeClosing(left, right, layout)}`;
}

function buildCompareAlternativeClosing(
	left: CompareProduct,
	right: CompareProduct,
	layout: ComparePair['layout']
): string {
	if (layout === 'directory_long_form') {
		if (left.slug === COMPARE_HUB_BASE_SLUG) {
			return `See how ${left.name} gives you control over every directory listing instead of a one-time ${right.name} campaign.`;
		}
		if (right.slug === COMPARE_HUB_BASE_SLUG) {
			return `See how ${right.name} compares as a DIY alternative to ${left.name} for directory launch.`;
		}
		return 'See which directory path fits your launch.';
	}

	if (left.slug === COMPARE_HUB_BASE_SLUG) {
		return `See why teams use ${left.name} instead of ${right.name}. You get agent workflows and separate workspaces.`;
	}
	if (right.slug === COMPARE_HUB_BASE_SLUG) {
		return `See how ${right.name} compares as an alternative to ${left.name}. You can schedule posts and publish from agents.`;
	}
	return 'See which scheduler fits your work.';
}

function buildCompareKeywords(
	left: CompareProduct,
	right: CompareProduct,
	layout: ComparePair['layout']
): string[] {
	if (layout === 'directory_long_form') {
		const keywords = [
			`${left.name} vs ${right.name}`,
			`${right.name} alternative`,
			'directory submission service comparison',
			'startup directory launch',
			'done for you directory submissions',
			'DIY directory launch software',
			`${right.name} pricing`,
			`${left.name} pricing`
		];

		if (left.slug === COMPARE_HUB_BASE_SLUG) {
			keywords.push(`best ${right.name} alternative`);
		} else if (right.slug === COMPARE_HUB_BASE_SLUG) {
			keywords.push(`best ${left.name} alternative`);
		}

		return keywords;
	}

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

function buildHeroTitle(
	left: CompareProduct,
	right: CompareProduct,
	layout: ComparePair['layout']
): string {
	if (layout === 'directory_long_form') {
		return `${left.name} vs ${right.name}: Directory launch compared`;
	}
	return `${left.name} vs ${right.name}: Compare Side by Side`;
}

function buildHeroDescription(
	left: CompareProduct,
	right: CompareProduct,
	layout: ComparePair['layout']
): string {
	if (layout === 'directory_long_form') {
		const base = `Compare directory launch options for ${left.name} and ${right.name} — pricing, control, and what you get after submissions go live.`;
		const pitch =
			left.slug === COMPARE_HUB_BASE_SLUG || right.slug === COMPARE_HUB_BASE_SLUG
				? ` ${buildCompareAlternativeClosing(left, right, layout)}`
				: '';
		const trialNote =
			left.slug === COMPARE_HUB_BASE_SLUG || right.slug === COMPARE_HUB_BASE_SLUG
				? ' Start a 7-day free trial on OpenQuok. You do not need a credit card.'
				: '';
		return `${base}${pitch}${trialNote}`;
	}

	const base = `Compare prices, channels, and features for ${left.name} and ${right.name}.`;
	const openQuokPitch =
		left.slug === COMPARE_HUB_BASE_SLUG || right.slug === COMPARE_HUB_BASE_SLUG
			? ` ${buildCompareAlternativeClosing(left, right, layout)}`
			: '';
	const trialNote =
		left.slug === COMPARE_HUB_BASE_SLUG || right.slug === COMPARE_HUB_BASE_SLUG
			? ' Start a 7-day free trial. You do not need a credit card.'
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
		description: `${right.name} is for ${right.comparison.builtFor}. ${left.name} ${left.comparison.positioningWhenLeft}.`,
		withoutTitle: right.name,
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
