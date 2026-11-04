import { describe, expect, it } from 'vitest';

import { buildCompareSocialMatrixNavSections } from '$lib/content/constants/competitors/comparePageSectionNav';
import {
	createComparePageOnPageNavigationSchema
} from '$lib/content/utils/createComparePageOnPageNavigationSchema';
import { findJsonLdGraphNodeByType, createJsonLdGraph } from '$lib/seo/jsonLdSchema';

describe('createComparePageOnPageNavigationSchema', () => {
	const canonical = 'https://www.openquok.com/compare/openquok/hootsuite';
	const webPageId = `${canonical}#webpage`;

	it('returns empty object when there are no sections', () => {
		expect(createComparePageOnPageNavigationSchema({ canonical, webPageId, sections: [] })).toEqual(
			{}
		);
	});

	it('emits TableOfContents with fragment URLs matching the on-page nav', () => {
		const sections = buildCompareSocialMatrixNavSections({
			includeChannels: true,
			includeFaq: true
		});
		const result = createComparePageOnPageNavigationSchema({
			canonical,
			webPageId,
			sections
		});

		expect('nodes' in result).toBe(true);
		if (!('nodes' in result)) return;

		expect(result.webPageHasPartRef).toEqual({
			'@id': `${canonical}#on-this-page`
		});

		const toc = result.nodes[0];
		expect(toc).toMatchObject({
			'@type': 'TableOfContents',
			'@id': `${canonical}#on-this-page`,
			name: 'On this page',
			isPartOf: { '@id': webPageId },
			mainEntityOfPage: { '@id': webPageId }
		});

		const hasPart = (toc as { hasPart?: { name: string; url: string }[] }).hasPart;
		expect(hasPart?.[0]).toEqual({
			'@type': 'SiteNavigationElement',
			name: 'Platform overview',
			url: `${canonical}#compare-platform-overview`
		});
		expect(hasPart?.at(-1)).toEqual({
			'@type': 'SiteNavigationElement',
			name: 'More comparisons',
			url: `${canonical}#compare-more-comparisons`
		});

		const listItems = (toc as { itemListElement?: { position: number; url: string }[] })
			.itemListElement;
		expect(listItems?.length).toBe(sections.length);
		expect(listItems?.[0]).toMatchObject({
			'@type': 'ListItem',
			position: 1,
			url: `${canonical}#compare-platform-overview`
		});
	});

	it('can be merged into a compare page graph', () => {
		const sections = buildCompareSocialMatrixNavSections({
			includeChannels: false,
			includeFaq: false
		});
		const onPage = createComparePageOnPageNavigationSchema({
			canonical,
			webPageId,
			sections
		});
		if (!('nodes' in onPage)) {
			throw new Error('expected on-page schema');
		}

		const graph = createJsonLdGraph([
			{
				'@type': 'WebPage',
				'@id': webPageId,
				url: canonical,
				hasPart: onPage.webPageHasPartRef
			},
			...onPage.nodes
		]);

		const webPage = findJsonLdGraphNodeByType(graph, 'WebPage');
		expect(webPage).toMatchObject({
			hasPart: { '@id': `${canonical}#on-this-page` }
		});
		expect(findJsonLdGraphNodeByType(graph, 'TableOfContents')).toBeDefined();
	});
});
