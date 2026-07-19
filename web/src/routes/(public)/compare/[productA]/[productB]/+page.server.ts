import type { MetaTagsProps } from 'svelte-meta-tags';

import type { Offer, SoftwareApplication } from 'schema-dts';

import type { JsonLdGraphNode } from '$lib/utils/jsonLdSchema';

import { error } from '@sveltejs/kit';

import { publicComparePagePresenter } from '$lib/area-public';
import type {
	ComparePricingPlanViewModel,
	CompareProductSummaryViewModel
} from '$lib/area-public/PublicComparePage.presenter.svelte';
import { getRootPathPublicComparePair } from '$lib/area-public/constants/getRootPathPublicCompare';
import {
	CONFIG_SCHEMA_COMPANY,
	getPublicFaqConfigDefaults
} from '$lib/config/constants/config';
import { getComparePair } from '$lib/content/constants/publicCompareConfig';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { createMetaData } from '$lib/utils/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/utils/buildCanonicalUrl';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/utils/jsonLdSchema';

export const ssr = true;

export async function load({ url, params, cookies, parent }) {
	const productA = params.productA?.trim().toLowerCase() ?? '';
	const productB = params.productB?.trim().toLowerCase() ?? '';

	if (!productA || !productB) {
		throw error(404, 'Comparison page not found');
	}

	const pair = getComparePair(productA, productB);
	if (!pair) {
		throw error(404, 'Comparison page not found');
	}

	const detailVm = publicComparePagePresenter.buildDetailVm(pair);
	if (!detailVm) {
		throw error(404, 'Comparison page not found');
	}

	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;
	const faqDefaults = getPublicFaqConfigDefaults();

	const customTitle = `${detailVm.metaTitle} | ${companyName}`;
	const customDescription = detailVm.metaDescription;

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customSlug: getRootPathPublicComparePair(pair.productASlug, pair.productBSlug),
		customTags: detailVm.keywords,
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(url);
	const pageMetaTags = withCanonicalMetaTags(metaTags, canonical, {
		openGraph: {
			title: customTitle,
			description: customDescription
		},
		twitter: {
			title: customTitle,
			description: customDescription
		}
	});

	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			{
				'@type': 'WebPage',
				'@id': `${canonical}#webpage`,
				name: detailVm.metaTitle,
				description: customDescription,
				url: canonical,
				mainEntity: {
					'@id': `${canonical}#comparison`
				},
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: url.origin
				}
			},
			{
				'@type': 'ItemList',
				'@id': `${canonical}#comparison`,
				name: `${detailVm.leftProduct.name} vs ${detailVm.rightProduct.name}`,
				description: customDescription,
				url: canonical,
				numberOfItems: 2,
				itemListElement: [
					{
						'@type': 'ListItem',
						position: 1,
						item: {
							'@id': `${canonical}#${detailVm.leftProduct.slug}`
						}
					},
					{
						'@type': 'ListItem',
						position: 2,
						item: {
							'@id': `${canonical}#${detailVm.rightProduct.slug}`
						}
					}
				]
			},
			createCompareSoftwareApplicationSEOSchema({
				canonical,
				product: detailVm.leftProduct
			}),
			createCompareSoftwareApplicationSEOSchema({
				canonical,
				product: detailVm.rightProduct
			}),
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: faqDefaults.TITLE,
				description: faqDefaults.DESCRIPTION,
				items: detailVm.faqItems
			})
		])
	);

	return {
		pageMetaTags,
		isLoggedIn,
		detailVm,
		schemaData
	};
}

type CreateCompareSoftwareApplicationSEOSchemaParams = {
	canonical: string;
	product: CompareProductSummaryViewModel;
};

function createCompareSoftwareApplicationSEOSchema(
	params: CreateCompareSoftwareApplicationSEOSchemaParams
): JsonLdGraphNode {
	const { canonical, product } = params;

	return {
		'@type': 'SoftwareApplication',
		'@id': `${canonical}#${product.slug}`,
		name: product.name,
		abstract: product.tagline,
		description: product.overview,
		applicationCategory: 'Social media scheduling application',
		operatingSystem: 'Web',
		mainEntityOfPage: {
			'@id': `${canonical}#webpage`
		},
		isPartOf: {
			'@id': `${canonical}#comparison`
		},
		...(product.pricingPlans.some((plan) => plan.monthlyPrice === 0)
			? { isAccessibleForFree: true }
			: {}),
		...(product.channels.length > 0
			? {
					featureList: [`Supported channels: ${product.channels.join(', ')}`]
				}
			: {}),
		...createPricingOffers(product.pricingPlans, canonical)
	};
}

function createPricingOffers(
	pricingPlans: ComparePricingPlanViewModel[],
	canonical: string
): Pick<SoftwareApplication, 'offers'> | Record<string, never> {
	const offers: Offer[] = pricingPlans.flatMap((plan) => {
		if (plan.monthlyPrice === null) {
			return [];
		}

		return [
			{
				'@type': 'Offer',
				name: plan.name,
				description: [plan.tagline, plan.footnote].filter(Boolean).join(' · '),
				priceCurrency: 'USD',
				price: plan.monthlyPrice,
				url: canonical
			}
		];
	});

	if (offers.length === 0) {
		return {};
	}

	return { offers };
}
