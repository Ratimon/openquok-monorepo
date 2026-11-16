import type { PublicAgentComparisonSection } from '$lib/content/constants/agents/types';
import type {
	CompareDetailLongFormViewModel,
	CompareDirectoryLongFormContent,
	CompareProduct
} from '$lib/content/constants/competitors/types';

import { getRootPathPublicComparePair } from '$lib/area-public/constants/getRootPathPublicCompare';
import {
	assembleSocialAlternativesLongFormViewModel,
	buildSocialOtherAlternativesSection
} from '$lib/content/constants/competitors/buildCompareLongFormSections';
import { COMPARE_HUB_BASE_SLUG } from '$lib/content/constants/competitors/shared';
import { resolveSocialAndDirectoryProducts } from '$lib/content/constants/competitors/utils/compareProductCategories';
import { PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE } from '$lib/content/constants/hubs/productHubSocialVsDirectoryCompare';
import { route, url } from '$lib/utils/path';

export function buildCrossProductLineWithWithoutSection(
	left: CompareProduct,
	right: CompareProduct
): PublicAgentComparisonSection {
	const resolved = resolveSocialAndDirectoryProducts(left, right);
	if (!resolved) {
		return {
			subtitle: 'comparisons',
			title: `${left.name} vs ${right.name}`,
			description: `${left.overview} ${right.overview}`,
			withoutTitle: right.name,
			withTitle: left.name,
			points: []
		};
	}

	const { social, directory } = resolved;

	return {
		subtitle: 'Product lines',
		title: 'Social scheduling vs directory launch',
		description:
			'These products solve different jobs. Pick the compare hub section that matches your goal, or use both when you need recurring posts and a launch campaign.',
		withoutTitle: directory.name,
		withTitle: social.name,
		points: PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE.points.map((point) => ({
			feature: point.left,
			pain: point.right
		}))
	};
}

function buildCrossProductLineLongFormContent(
	social: CompareProduct,
	directory: CompareProduct
): CompareDirectoryLongFormContent {
	return {
		whyPeopleLook: {
			id: 'why-people-look',
			navLabel: 'Why people look',
			subtitle: 'Why people look',
			title: `Why people land on ${social.name} vs ${directory.name}`,
			body: [
				`Search mixes schedulers and directory services when you shop for launch tools.`,
				`${social.name} is a social scheduler. ${directory.name} is a directory submission service.`,
				'This page explains the difference so you open the right category compare next.'
			]
		},
		yourOptions: {
			id: 'your-options',
			navLabel: 'Your options',
			subtitle: 'Your options',
			title: 'Match the tool to your job',
			body: [
				`Use ${social.name} when you need recurring posts across social networks.`,
				`Use ${directory.name} when you want directory listings or backlinks from a launch package.`,
				'OpenQuok covers both jobs when you need scheduling plus DIY directory launch in one workspace.'
			]
		},
		whenTheyWin: {
			id: 'when-they-win',
			navLabel: 'When they win',
			subtitle: 'When they win',
			title: 'When each product fits',
			body: [
				`${social.name} fits teams that ${social.comparison.builtFor}.`,
				`${directory.name} fits teams that ${directory.comparison.builtFor}.`,
				'Run both only when your launch plan needs social reach and directory coverage together.'
			]
		}
	};
}

export function buildCrossProductLineLongFormViewModel(
	left: CompareProduct,
	right: CompareProduct
): CompareDetailLongFormViewModel | null {
	const resolved = resolveSocialAndDirectoryProducts(left, right);
	if (!resolved) return null;

	const { social, directory } = resolved;
	const content = buildCrossProductLineLongFormContent(social, directory);

	const openQuokPairPaths = [
		{
			name: `OpenQuok vs ${social.name}`,
			slug: social.slug,
			href: url(route(getRootPathPublicComparePair(COMPARE_HUB_BASE_SLUG, social.slug))),
			description:
				'Compare OpenQuok to this scheduler on channels, pricing, and agent tools.'
		},
		{
			name: `OpenQuok vs ${directory.name}`,
			slug: directory.slug,
			href: url(route(getRootPathPublicComparePair(COMPARE_HUB_BASE_SLUG, directory.slug))),
			description: 'Compare OpenQuok directory launch to this submission service.'
		}
	];

	return {
		...assembleSocialAlternativesLongFormViewModel({
			competitor: directory,
			openQuok: social,
			content,
			otherAlternativePeers: openQuokPairPaths
		}),
		otherAlternatives: buildSocialOtherAlternativesSection(`${social.name} and ${directory.name}`)
	};
}