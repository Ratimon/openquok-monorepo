import type { ItemList, WebPageElement } from 'schema-dts';

import type { ComparePoint } from '$lib/ui/templates/Compare.svelte';
import type { JsonLdGraphNode } from '$lib/seo/jsonLdSchema';

export type PublicHubCompareSectionSchemaInput = {
	schemaFragmentId: string;
	title: string;
	description: string;
	leftTitle: string;
	rightTitle: string;
	points: readonly ComparePoint[];
};

export type PublicHubCompareSectionSchemaResult = {
	nodes: JsonLdGraphNode[];
	/** Reference for `WebPage.hasPart` when the compare block is present. */
	webPageHasPartRef: { '@id': string };
};

function columnItemList(name: string, bullets: readonly string[]): ItemList {
	return {
		'@type': 'ItemList',
		name,
		numberOfItems: bullets.length,
		itemListElement: bullets.map((text, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: text
		}))
	};
}

/**
 * JSON-LD for hub two-column Compare sections (social vs directory on Compare/Alternatives,
 * agent hosts vs MCP on Agents, and similar).
 */
export function createPublicHubCompareSectionSchema(params: {
	canonical: string;
	webPageId: string;
	section: PublicHubCompareSectionSchemaInput;
}): PublicHubCompareSectionSchemaResult {
	const { canonical, webPageId, section } = params;
	const sectionId = `${canonical}#${section.schemaFragmentId}`;

	const leftList = columnItemList(
		section.leftTitle,
		section.points.map((point) => point.left)
	);
	const rightList = columnItemList(
		section.rightTitle,
		section.points.map((point) => point.right)
	);

	const compareBlock = {
		'@type': 'WebPageElement',
		'@id': sectionId,
		name: section.title,
		description: section.description,
		url: sectionId,
		isPartOf: { '@id': webPageId },
		hasPart: [leftList, rightList]
	} satisfies WebPageElement;

	return {
		nodes: [compareBlock, leftList, rightList],
		webPageHasPartRef: { '@id': sectionId }
	};
}
