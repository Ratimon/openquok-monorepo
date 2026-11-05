import type { MetaTagsProps } from 'svelte-meta-tags';

import { error } from '@sveltejs/kit';

import type { JsonLdGraphNode } from '$lib/seo/jsonLdSchema';

import { publicAlternativesPagePresenter } from '$lib/area-public';
import type { AlternativesListingViewModel } from '$lib/area-public/PublicAlternativesPage.presenter.svelte';
import {
	formatAlternativesHubPlatformSupport
} from '$lib/area-public/PublicAlternativesPage.presenter.svelte';
import { getRootPathPublicAlternativesTarget } from '$lib/area-public/constants/getRootPathPublicAlternatives';
import {
	CONFIG_SCHEMA_COMPANY,
	getPublicFaqConfigDefaults
} from '$lib/config/constants/config';
import { getCompareProduct, isAlternativesTargetSlug } from '$lib/content/constants/competitors';
import { formatAlternativesHubPriceRange } from '$lib/content/constants/competitors/utils/comparePricing';
import { buildAlternativesDetailNavSections } from '$lib/content/constants/competitors/comparePageSectionNav';
import { createComparePageOnPageNavigationSchema } from '$lib/content/utils/createComparePageOnPageNavigationSchema';
import { buildAlternativesDetailFaqItems } from '$lib/content/constants/faq/buildAlternativesDetailFaqItems';
import {
	parseAlternativesDetailFiltersFromUrl
} from '$lib/content/constants/hubs/alternativesHubFilters';
import { createAlternativesProductSoftwareApplicationSchema } from '$lib/content/utils/createAlternativesHubItemListSchema';
import { buildAlternativesLandingBreadcrumbItems } from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createBreadcrumbListSchema } from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';

export const ssr = true;

export async function load({ url, params, cookies, parent }) {
	const slug = params.slug?.trim().toLowerCase() ?? '';

	if (!slug || !isAlternativesTargetSlug(slug)) {
		throw error(404, 'Alternatives page not found');
	}

	const detailFiltersVm = parseAlternativesDetailFiltersFromUrl(url.searchParams);

	const detailVm = publicAlternativesPagePresenter.buildDetailVm(slug, detailFiltersVm);
	if (!detailVm) {
		throw error(404, 'Alternatives page not found');
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
		customSlug: getRootPathPublicAlternativesTarget(slug),
		customTags: detailVm.keywords,
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(url);
	const webPageId = `${canonical}#webpage`;

	const faqItems = buildAlternativesDetailFaqItems({
		targetName: detailVm.targetName,
		targetSlug: detailVm.targetSlug,
		isDirectoryTarget: detailVm.isDirectoryTarget
	});

	const onPageNavSections = buildAlternativesDetailNavSections(
		detailVm.longForm,
		faqItems.length > 0
	);
	const onPageNavigationSchema = createComparePageOnPageNavigationSchema({
		canonical,
		webPageId,
		sections: onPageNavSections
	});

	const webPageNode: JsonLdGraphNode = {
		'@type': 'WebPage',
		'@id': webPageId,
		name: detailVm.metaTitle,
		description: customDescription,
		url: canonical,
		mainEntity: {
			'@id': `${canonical}#alternatives`
		},
		isPartOf: {
			'@type': 'WebSite',
			name: companyName,
			url: url.origin
		},
		...('webPageHasPartRef' in onPageNavigationSchema
			? { hasPart: onPageNavigationSchema.webPageHasPartRef }
			: {})
	};

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

	const alternativesItemListOrder =
		detailFiltersVm.sort === 'platforms_desc'
			? 'https://schema.org/ItemListOrderDescending'
			: 'https://schema.org/ItemListOrderAscending';

	const alternativesListId = `${canonical}#alternatives`;

	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			webPageNode,
			...('nodes' in onPageNavigationSchema ? onPageNavigationSchema.nodes : []),
			{
				'@type': 'ItemList',
				'@id': alternativesListId,
				name: `Best alternatives to ${detailVm.targetName}`,
				description: customDescription,
				url: canonical,
				numberOfItems: detailVm.listings.length,
				itemListOrder: alternativesItemListOrder,
				itemListElement: detailVm.listings.map((listing, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					item: {
						'@id': `${canonical}#product-${listing.slug}`
					}
				}))
			},
			...detailVm.listings.map((listing) =>
				createAlternativesDetailSoftwareApplicationSchema({
					canonical,
					alternativesListId,
					listing
				})
			),
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: faqDefaults.TITLE,
				description: faqDefaults.DESCRIPTION,
				items: faqItems
			}),
			createBreadcrumbListSchema(
				buildAlternativesLandingBreadcrumbItems({
					variant: 'detail',
					pageLabel: detailVm.title
				}),
				url.origin
			)
		])
	);

	return {
		pageMetaTags,
		isLoggedIn,
		detailVm,
		detailFiltersVm,
		faqItems,
		schemaData
	};
}

type CreateAlternativesDetailSoftwareApplicationSchemaParams = {
	canonical: string;
	alternativesListId: string;
	listing: AlternativesListingViewModel;
};

function createAlternativesDetailSoftwareApplicationSchema(
	params: CreateAlternativesDetailSoftwareApplicationSchemaParams
): JsonLdGraphNode {
	const { canonical, alternativesListId, listing } = params;
	const product = getCompareProduct(listing.slug);
	if (!product) {
		throw new Error(`Unknown compare product slug: ${listing.slug}`);
	}

	return createAlternativesProductSoftwareApplicationSchema({
		pageUrl: canonical,
		alternativesListId,
		product,
		platformSupportLabel: formatAlternativesHubPlatformSupport(product),
		priceRangeLabel: formatAlternativesHubPriceRange(product.pricingPlans)
	});
}
