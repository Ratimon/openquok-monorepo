import type { AggregateOffer, ItemList, Offer, PropertyValue, SoftwareApplication } from 'schema-dts';

import type { AlternativesHubEntryViewModel } from '$lib/area-public/PublicAlternativesPage.presenter.svelte';
import {
	getCompareProduct,
	getCompareProductWebsiteUrl,
	type CompareProduct
} from '$lib/content/constants/competitors';
import { COMPARE_HUB_BASE_SLUG } from '$lib/content/constants/competitors/shared';
import { getCompareProductCategory } from '$lib/content/constants/competitors/utils/compareProductCategories';
import type { AlternativesHubSort } from '$lib/content/constants/hubs/alternativesHubFilters';
import type { JsonLdGraphNode } from '$lib/seo/jsonLdSchema';

export type CreateAlternativesHubItemListSchemaParams = {
	canonical: string;
	origin: string;
	companyName: string;
	name: string;
	description: string;
	entries: AlternativesHubEntryViewModel[];
	sort: AlternativesHubSort;
};

export type AlternativesHubItemListSeoSchema = {
	itemList: ItemList;
	softwareApplications: JsonLdGraphNode[];
};

export type CreateAlternativesProductSoftwareApplicationSchemaParams = {
	/** Alternatives detail or hub card page URL (directory target page). */
	pageUrl: string;
	/** `@id` of the parent ItemList node. */
	alternativesListId: string;
	product: CompareProduct;
	platformSupportLabel: string;
	priceRangeLabel: string;
};

export function resolveAlternativesHubItemListOrder(
	sort: AlternativesHubSort
): 'https://schema.org/ItemListOrderAscending' | 'https://schema.org/ItemListOrderDescending' {
	return sort === 'platforms_desc'
		? 'https://schema.org/ItemListOrderDescending'
		: 'https://schema.org/ItemListOrderAscending';
}

function formatOfferPrice(amount: number): string {
	return amount.toLocaleString('en-US', { maximumFractionDigits: 2, useGrouping: false });
}

function numericListPrices(product: CompareProduct): number[] {
	return product.pricingPlans
		.map((plan) => plan.monthlyPrice)
		.filter((price): price is number => price != null);
}

function productUsesOneTimeOffers(product: CompareProduct): boolean {
	const plans = product.pricingPlans;
	const oneTime = plans.filter((plan) => plan.pricePeriod === 'one_time');
	const recurring = plans.filter((plan) => (plan.pricePeriod ?? 'monthly') !== 'one_time');
	return oneTime.length > 0 && recurring.length === 0;
}

/** Matches hub card list-price span (low–high public USD packages). */
export function buildAlternativesProductOffersSchema(
	product: CompareProduct,
	websiteUrl: string,
	priceRangeLabel: string
): Offer | AggregateOffer | undefined {
	const prices = numericListPrices(product);
	if (prices.length === 0) {
		return undefined;
	}

	const low = Math.min(...prices);
	const high = Math.max(...prices);
	const oneTimeOnly = productUsesOneTimeOffers(product);
	const availability = 'https://schema.org/InStock';
	const category = oneTimeOnly ? 'one-time-license' : 'subscription';

	if (prices.length === 1 || low === high) {
		return {
			'@type': 'Offer',
			name: priceRangeLabel,
			description: priceRangeLabel,
			priceCurrency: 'USD',
			price: formatOfferPrice(low),
			url: websiteUrl,
			availability,
			category
		} satisfies Offer;
	}

	return {
		'@type': 'AggregateOffer',
		name: priceRangeLabel,
		description: priceRangeLabel,
		priceCurrency: 'USD',
		lowPrice: formatOfferPrice(low),
		highPrice: formatOfferPrice(high),
		offerCount: prices.length,
		url: websiteUrl,
		availability,
		category
	} satisfies AggregateOffer;
}

export function buildAlternativesProductPlatformProperty(
	product: CompareProduct,
	platformSupportLabel: string
): PropertyValue {
	const isDirectory = getCompareProductCategory(product) === 'directory_submission';

	return {
		'@type': 'PropertyValue',
		name: isDirectory ? 'Directory submission coverage' : 'Supported social platforms',
		value: platformSupportLabel,
		description: isDirectory
			? 'Scope shown on alternatives hub cards for done-for-you directory vendors'
			: 'Count of social network labels supported for scheduling'
	};
}

export function createAlternativesProductSoftwareApplicationSchema(
	params: CreateAlternativesProductSoftwareApplicationSchemaParams
): JsonLdGraphNode {
	const { pageUrl, alternativesListId, product, platformSupportLabel, priceRangeLabel } = params;
	const websiteUrl = getCompareProductWebsiteUrl(product.slug);
	const isOpenQuok = product.slug === COMPARE_HUB_BASE_SLUG;
	const isDirectory = getCompareProductCategory(product) === 'directory_submission';
	const offers = buildAlternativesProductOffersSchema(product, websiteUrl, priceRangeLabel);

	return {
		'@type': 'SoftwareApplication',
		'@id': `${pageUrl}#product-${product.slug}`,
		name: product.name,
		abstract: product.tagline,
		description: product.overview,
		applicationCategory: isDirectory
			? 'BusinessApplication'
			: 'Social media scheduling application',
		operatingSystem: 'Web',
		url: websiteUrl,
		mainEntityOfPage: {
			'@id': `${pageUrl}#webpage`
		},
		isPartOf: {
			'@id': alternativesListId
		},
		additionalProperty: [buildAlternativesProductPlatformProperty(product, platformSupportLabel)],
		...(isOpenQuok ? { isAccessibleForFree: true } : {}),
		...(offers ? { offers } : {})
	} satisfies SoftwareApplication;
}

export function createAlternativesHubItemListSchema(
	params: CreateAlternativesHubItemListSchemaParams
): AlternativesHubItemListSeoSchema {
	const { canonical, origin, companyName, name, description, entries, sort } = params;
	const itemListOrder = resolveAlternativesHubItemListOrder(sort);
	const alternativesListId = `${canonical}#alternatives`;

	const itemList = {
		'@type': 'ItemList',
		'@id': alternativesListId,
		name,
		description,
		url: canonical,
		numberOfItems: entries.length,
		itemListOrder,
		itemListElement: entries.map((entry, index) => {
			const pageUrl = new URL(entry.href, origin).href;
			const productId = `${pageUrl}#product-${entry.slug}`;
			return {
				'@type': 'ListItem',
				position: index + 1,
				item: {
					'@type': 'WebPage',
					'@id': `${pageUrl}#webpage`,
					name: entry.title,
					description: entry.description,
					url: pageUrl,
					about: {
						'@id': productId
					},
					isPartOf: {
						'@type': 'WebSite',
						name: companyName,
						url: origin
					}
				}
			};
		})
	} satisfies ItemList;

	const softwareApplications = entries
		.map((entry) => {
			const product = getCompareProduct(entry.slug);
			if (!product) {
				return null;
			}
			const pageUrl = new URL(entry.href, origin).href;
			return createAlternativesProductSoftwareApplicationSchema({
				pageUrl,
				alternativesListId,
				product,
				platformSupportLabel: entry.platformSupportLabel,
				priceRangeLabel: entry.priceRangeLabel
			});
		})
		.filter((node): node is JsonLdGraphNode => node != null);

	return { itemList, softwareApplications };
}
