import { describe, expect, it } from 'vitest';

import { PUBLIC_HEADER_NAVIGATION_SCHEMA_ID_SUFFIX } from '$lib/seo/createPublicHeaderNavigationSchema';
import { createPublicHeaderNavigationSchema } from '$lib/seo/createPublicHeaderNavigationSchema';

describe('createPublicHeaderNavigationSchema', () => {
	it('emits ItemList with SiteNavigationElement entries for top-level nav', () => {
		const schema = createPublicHeaderNavigationSchema({
			origin: 'https://www.openquok.com',
			companyUrl: 'https://www.openquok.com'
		});

		expect(schema['@context']).toBe('https://schema.org');
		expect(schema['@graph']).toHaveLength(1);

		const itemList = schema['@graph'][0];
		expect(itemList['@type']).toBe('ItemList');
		expect(itemList['@id']).toBe(
			`https://www.openquok.com${PUBLIC_HEADER_NAVIGATION_SCHEMA_ID_SUFFIX}`
		);

		const elements = itemList.itemListElement ?? [];
		expect(elements.length).toBeGreaterThanOrEqual(6);

		const opportunities = elements.find(
			(entry) =>
				entry.item &&
				typeof entry.item === 'object' &&
				'name' in entry.item &&
				entry.item.name === 'Opportunities'
		);
		expect(opportunities).toBeDefined();
		expect(opportunities?.item).toMatchObject({
			'@type': 'SiteNavigationElement',
			url: 'https://www.openquok.com/build-backlinks'
		});
	});
});
