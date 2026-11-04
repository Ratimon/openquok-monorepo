import type { ItemList, SiteNavigationElement, TableOfContents } from 'schema-dts';

import {
	COMPARE_PAGE_ON_PAGE_NAV_SCHEMA_ID_SUFFIX,
	type ComparePageSectionNavItem
} from '$lib/content/constants/competitors/comparePageSectionNav';
import type { JsonLdGraphNode } from '$lib/seo/jsonLdSchema';

export type ComparePageOnPageNavigationSchemaResult = {
	nodes: JsonLdGraphNode[];
	/** Reference for `WebPage.hasPart` when the on-page nav is present. */
	webPageHasPartRef: { '@id': string };
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
 * Schema.org markup for the compare detail “On this page” panel — `TableOfContents`
 * with `SiteNavigationElement` entries aligned to in-page `#fragment` anchors.
 */
export function createComparePageOnPageNavigationSchema(params: {
	canonical: string;
	webPageId: string;
	sections: readonly ComparePageSectionNavItem[];
}): ComparePageOnPageNavigationSchemaResult | Record<string, never> {
	const { canonical, webPageId, sections } = params;
	if (sections.length === 0) {
		return {};
	}

	const tocId = `${canonical}${COMPARE_PAGE_ON_PAGE_NAV_SCHEMA_ID_SUFFIX}`;

	const sectionNavElements = sections.map((section) =>
		navigationElement(section.navLabel, sectionUrl(canonical, section.id))
	);

	const itemListElement: ItemList['itemListElement'] = sections.map((section) => ({
		'@type': 'ListItem',
		position: section.index,
		name: section.navLabel,
		url: sectionUrl(canonical, section.id)
	}));

	const tableOfContents = {
		'@type': 'TableOfContents',
		'@id': tocId,
		name: 'On this page',
		isPartOf: { '@id': webPageId },
		hasPart: sectionNavElements,
		mainEntityOfPage: { '@id': webPageId },
		itemListElement
	} satisfies TableOfContents;

	return {
		nodes: [tableOfContents],
		webPageHasPartRef: { '@id': tocId }
	};
}