import type { ItemList, SiteNavigationElement, TableOfContents, WebPageElement } from 'schema-dts';
import type { SubscriptionPeriod } from 'openquok-common';

import { GetPublicPricingPresenter } from '$lib/billing';
import {
	PUBLIC_PRICING_COMPARE_SCHEMA_FRAGMENT_SUFFIX,
	PUBLIC_PRICING_COMPARE_TABLE_FRAGMENT_ID,
	publicPricingCompareSectionFragmentId
} from '$lib/billing/constants/publicPricingCompareSections';
import type { PublicPricingProductLine } from '$lib/billing/constants/publicPricingProductLines';
import type { JsonLdGraphNode } from '$lib/seo/jsonLdSchema';

export type CreatePublicPricingCompareTableSeoSchemaParams = {
	canonical: string;
	webPageId: string;
	productLine: PublicPricingProductLine;
	period?: SubscriptionPeriod;
};

export type PublicPricingCompareTableSeoSchemaResult = {
	nodes: JsonLdGraphNode[];
	hasPartRefs: Array<{ '@id': string }>;
};

function sectionUrl(canonical: string, sectionId: string): string {
	return `${canonical}#${sectionId}`;
}

function navigationElement(name: string, url: string): SiteNavigationElement {
	return {
		'@type': 'SiteNavigationElement',
		name,
		url
	};
}

/**
 * Schema.org nodes for the segmented pricing compare table — `TableOfContents`,
 * section `ItemList`, feature `ItemList`, and a `WebPageElement` anchor on `#pricing-compare`.
 */
export function createPublicPricingCompareTableSeoSchema(
	params: CreatePublicPricingCompareTableSeoSchemaParams
): PublicPricingCompareTableSeoSchemaResult | Record<string, never> {
	const { canonical, webPageId, productLine } = params;
	const presenter = new GetPublicPricingPresenter();
	const pageVm = presenter.buildPageVm(params.period ?? 'MONTHLY', productLine);
	const sections = pageVm.compareSections;

	if (sections.length === 0) {
		return {};
	}

	const compareTableId = `${canonical}#${PUBLIC_PRICING_COMPARE_TABLE_FRAGMENT_ID}`;
	const tocId = `${canonical}#${PUBLIC_PRICING_COMPARE_SCHEMA_FRAGMENT_SUFFIX.tableOfContents}`;
	const sectionsListId = `${canonical}#${PUBLIC_PRICING_COMPARE_SCHEMA_FRAGMENT_SUFFIX.sectionsItemList}`;
	const featuresListId = `${canonical}#${PUBLIC_PRICING_COMPARE_SCHEMA_FRAGMENT_SUFFIX.featuresItemList}`;

	const sectionListItems: ItemList['itemListElement'] = sections.map((section, index) => ({
		'@type': 'ListItem',
		position: index + 1,
		name: section.title,
		url: sectionUrl(canonical, publicPricingCompareSectionFragmentId(section.id))
	}));

	const featureListItems: ItemList['itemListElement'] = [];
	let featurePosition = 0;
	for (const section of sections) {
		for (const row of section.rows) {
			featurePosition += 1;
			featureListItems.push({
				'@type': 'ListItem',
				position: featurePosition,
				name: `${section.title} — ${row.label}`,
				description: row.tooltip
			});
		}
	}

	const sectionNavElements = sections.map((section) =>
		navigationElement(
			section.title,
			sectionUrl(canonical, publicPricingCompareSectionFragmentId(section.id))
		)
	);

	const compareTableElement = {
		'@type': 'WebPageElement',
		'@id': compareTableId,
		name: 'Compare plans and find the best fit',
		cssSelector: `#${PUBLIC_PRICING_COMPARE_TABLE_FRAGMENT_ID}`,
		isPartOf: { '@id': webPageId }
	} satisfies WebPageElement;

	const tableOfContents = {
		'@type': 'TableOfContents',
		'@id': tocId,
		name: 'Compare plans and find the best fit',
		description:
			'Side-by-side OpenQuok plan limits and features grouped by Publish, Collaborate, Automate, List, Curate, Generate, Analyze, and Support.',
		isPartOf: { '@id': webPageId },
		about: { '@id': compareTableId },
		hasPart: sectionNavElements,
		mainEntityOfPage: { '@id': webPageId },
		itemListElement: sectionListItems
	} satisfies TableOfContents;

	const sectionsItemList = {
		'@type': 'ItemList',
		'@id': sectionsListId,
		name: 'Pricing comparison sections',
		numberOfItems: sections.length,
		itemListElement: sectionListItems,
		isPartOf: { '@id': compareTableId }
	} satisfies ItemList;

	const featuresItemList =
		featureListItems.length > 0
			? ({
					'@type': 'ItemList',
					'@id': featuresListId,
					name: 'Pricing comparison features',
					numberOfItems: featureListItems.length,
					itemListElement: featureListItems,
					isPartOf: { '@id': compareTableId }
				} satisfies ItemList)
			: null;

	const nodes: JsonLdGraphNode[] = [
		compareTableElement,
		tableOfContents,
		sectionsItemList,
		...(featuresItemList ? [featuresItemList] : [])
	];

	return {
		nodes,
		hasPartRefs: [
			{ '@id': compareTableId },
			{ '@id': tocId },
			{ '@id': sectionsListId },
			...(featuresItemList ? [{ '@id': featuresListId }] : [])
		]
	};
}