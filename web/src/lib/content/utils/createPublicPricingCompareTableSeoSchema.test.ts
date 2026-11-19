import { describe, expect, it } from 'vitest';

import { PUBLIC_PRICING_COMPARE_SCHEMA_FRAGMENT_SUFFIX } from '$lib/billing/constants/publicPricingCompareSections';
import { createPublicPricingCompareTableSeoSchema } from '$lib/content/utils/createPublicPricingCompareTableSeoSchema';

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

		expect(result.nodes.some((node) => node['@type'] === 'WebPageElement')).toBe(true);
		expect(result.nodes.some((node) => node['@type'] === 'TableOfContents')).toBe(true);
		expect(result.nodes.filter((node) => node['@type'] === 'ItemList').length).toBeGreaterThanOrEqual(
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

		const toc = directoryResult.nodes.find((node) => node['@type'] === 'TableOfContents');
		const sectionsList = directoryResult.nodes.find(
			(node) =>
				node['@type'] === 'ItemList' &&
				String(node['@id']).endsWith(PUBLIC_PRICING_COMPARE_SCHEMA_FRAGMENT_SUFFIX.sectionsItemList)
		);

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