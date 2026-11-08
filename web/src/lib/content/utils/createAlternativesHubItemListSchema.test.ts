import { describe, expect, it } from 'vitest';

import { publicAlternativesPagePresenter } from '$lib/area-public';
import { getCompareProductWebsiteUrl } from '$lib/content/constants/competitors';
import { DEFAULT_ALTERNATIVES_HUB_SORT } from '$lib/content/constants/hubs/alternativesHubFilters';

import {
	buildAlternativesProductOffersSchema,
	createAlternativesHubItemListSchema,
	resolveAlternativesHubItemListOrder
} from './createAlternativesHubItemListSchema';
import { getCompareProduct } from '$lib/content/constants/competitors';

const ORIGIN = 'https://www.openquok.com';
const CANONICAL = `${ORIGIN}/alternatives`;

describe('resolveAlternativesHubItemListOrder', () => {
	it('uses ascending order for price and name sorts', () => {
		expect(resolveAlternativesHubItemListOrder('price_asc')).toBe(
			'https://schema.org/ItemListOrderAscending'
		);
		expect(resolveAlternativesHubItemListOrder('name_asc')).toBe(
			'https://schema.org/ItemListOrderAscending'
		);
	});

	it('uses descending order for most platforms sort', () => {
		expect(resolveAlternativesHubItemListOrder('platforms_desc')).toBe(
			'https://schema.org/ItemListOrderDescending'
		);
	});
});

describe('createAlternativesHubItemListSchema', () => {
	it('builds ItemList and SoftwareApplication nodes from filtered hub entries', () => {
		const baseHubVm = publicAlternativesPagePresenter.buildHubVm();
		const hubVm = publicAlternativesPagePresenter.applyHubFilters(baseHubVm, {
			category: 'social',
			sort: DEFAULT_ALTERNATIVES_HUB_SORT,
			search: 'buffer'
		});
		const entries = hubVm.socialSection.entries;

		const { itemList, softwareApplications } = createAlternativesHubItemListSchema({
			canonical: CANONICAL,
			origin: ORIGIN,
			companyName: 'OpenQuok',
			name: 'Social media and directory submission alternatives',
			description: hubVm.metaDescription,
			entries,
			sort: DEFAULT_ALTERNATIVES_HUB_SORT
		});

		expect(itemList.numberOfItems).toBe(entries.length);
		expect(itemList.itemListOrder).toBe('https://schema.org/ItemListOrderAscending');
		expect(itemList.itemListElement).toHaveLength(entries.length);

		const firstEntry = entries[0];
		const firstListItem = itemList.itemListElement?.[0] as {
			position?: number;
			item?: { '@id'?: string; url?: string; name?: string };
		};
		const firstPageUrl = new URL(firstEntry.href, ORIGIN).href;

		expect(firstListItem.position).toBe(1);
		expect(firstListItem.item?.['@id']).toBe(`${firstPageUrl}#webpage`);
		expect(firstListItem.item?.name).toBe(firstEntry.title);

		expect(softwareApplications).toHaveLength(entries.length);
		const firstApp = softwareApplications[0] as {
			'@id'?: string;
			url?: string;
			isAccessibleForFree?: boolean;
		};
		expect(firstApp['@id']).toBe(`${firstPageUrl}#product-${firstEntry.slug}`);
		expect(firstApp.url).toBe(getCompareProductWebsiteUrl(firstEntry.slug));
		const offers = (firstApp as { offers?: { '@type'?: string; lowPrice?: string } }).offers;
		expect(offers?.['@type']).toMatch(/Offer|AggregateOffer/);
		const additionalProperty = (
			firstApp as { additionalProperty?: { value?: string }[] }
		).additionalProperty;
		expect(additionalProperty?.[0]?.value).toBe(firstEntry.platformSupportLabel);

		const firstWebPage = firstListItem.item as { about?: { '@id'?: string } };
		expect(firstWebPage.about?.['@id']).toBe(`${firstPageUrl}#product-${firstEntry.slug}`);

		if (firstEntry.slug === 'openquok') {
			expect(firstApp.isAccessibleForFree).toBe(true);
		}
	});

	it('reflects platforms_desc sort in itemListOrder', () => {
		const { itemList } = createAlternativesHubItemListSchema({
			canonical: CANONICAL,
			origin: ORIGIN,
			companyName: 'OpenQuok',
			name: 'Alternatives',
			description: 'Description',
			entries: [],
			sort: 'platforms_desc'
		});

		expect(itemList.itemListOrder).toBe('https://schema.org/ItemListOrderDescending');
	});
});

describe('buildAlternativesProductOffersSchema', () => {
	it('emits AggregateOffer for multi-tier monthly products', () => {
		const buffer = getCompareProduct('buffer')!;
		const offer = buildAlternativesProductOffersSchema(
			buffer,
			'https://buffer.com',
			'$0–$129/mo'
		);
		expect(offer?.['@type']).toBe('AggregateOffer');
		expect(offer).toMatchObject({
			lowPrice: '0',
			highPrice: '12',
			priceCurrency: 'USD'
		});
	});

	it('emits AggregateOffer for one-time directory packages', () => {
		const boringlaunch = getCompareProduct('boringlaunch')!;
		const offer = buildAlternativesProductOffersSchema(
			boringlaunch,
			'https://www.boringlaunch.com/',
			'$149–$649 one-time'
		);
		expect(offer?.['@type']).toBe('AggregateOffer');
		expect(offer).toMatchObject({ lowPrice: '149', priceCurrency: 'USD' });
		expect(Number((offer as { highPrice?: string }).highPrice)).toBeGreaterThan(149);
	});
});
