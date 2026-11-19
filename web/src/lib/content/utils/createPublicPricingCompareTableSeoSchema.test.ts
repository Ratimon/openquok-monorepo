import type { ItemList } from 'schema-dts';
import { describe, expect, it } from 'vitest';

import { PUBLIC_PRICING_COMPARE_SCHEMA_FRAGMENT_SUFFIX } from '$lib/billing/constants/publicPricingCompareSections';
import { createPublicPricingCompareTableSeoSchema } from '$lib/content/utils/createPublicPricingCompareTableSeoSchema';
import { getJsonLdNodeType } from '$lib/seo/jsonLdSchema';

describe('createPublicPricingCompareTableSeoSchema', () => {
	const canonical = 'https://www.openquok.com/pricing/social-scheduler';
	const webPageId = `${canonical}#webpage`;

	it('emits compare table, TOC, and ItemList nodes for social scheduler', () => {
		const result = createPublicPricingCompareTableSeoSchema({
			canonical,
			webPageId,
			productLine: 'social'
		});

		expect(result).not.toEqual({});
		if (!('nodes' in result)) return;

		expect(result.nodes.some((node) => getJsonLdNodeType(node) === 'WebPageElement')).toBe(true);
		expect(result.nodes.some((node) => getJsonLdNodeType(node) === 'TableOfContents')).toBe(true);
		expect(result.nodes.filter((node) => getJsonLdNodeType(node) === 'ItemList').length).toBeGreaterThanOrEqual(
			2
		);
		expect(result.hasPartRefs.some((ref) => ref['@id'].includes('pricing-compare'))).toBe(true);
	});

	it('includes Automate section anchors when present on directory pricing', () => {
		const directoryCanonical = 'https://www.openquok.com/pricing/directory';
		const directoryResult = createPublicPricingCompareTableSeoSchema({
			canonical: directoryCanonical,
			webPageId: `${directoryCanonical}#webpage`,
			productLine: 'directory'
		});

		expect(directoryResult).not.toEqual({});
		if (!('nodes' in directoryResult)) return;

		const toc = directoryResult.nodes.find((node) => getJsonLdNodeType(node) === 'TableOfContents');
		const sectionsList = directoryResult.nodes.find((node) => {
			if (typeof node !== 'object' || node === null) return false;
			if (getJsonLdNodeType(node) !== 'ItemList' || !('@id' in node)) return false;
			return String((node as { '@id'?: string })['@id']).endsWith(
				PUBLIC_PRICING_COMPARE_SCHEMA_FRAGMENT_SUFFIX.sectionsItemList
			);
		}) as ItemList | undefined;

		expect(toc).toBeTruthy();
		expect(sectionsList).toBeTruthy();

		const sectionItems = sectionsList?.itemListElement;
		expect(
			Array.isArray(sectionItems) &&
				sectionItems.some(
					(item) =>
						typeof item === 'object' &&
						item !== null &&
						'name' in item &&
						String(item.name).toLowerCase() === 'automate'
				)
		).toBe(true);
	});
});