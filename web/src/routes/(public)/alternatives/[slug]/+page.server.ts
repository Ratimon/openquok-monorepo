import type { MetaTagsProps } from 'svelte-meta-tags';

import type { Offer, SoftwareApplication } from 'schema-dts';

import type { JsonLdGraphNode } from '$lib/seo/jsonLdSchema';

import { error } from '@sveltejs/kit';

import { publicAlternativesPagePresenter } from '$lib/area-public';
import type { AlternativesListingViewModel } from '$lib/area-public/PublicAlternativesPage.presenter.svelte';
import { getRootPathPublicAlternativesTarget } from '$lib/area-public/constants/getRootPathPublicAlternatives';
import {
	CONFIG_SCHEMA_COMPANY,
	getPublicFaqConfigDefaults
} from '$lib/config/constants/config';
import { isAlternativesTargetSlug } from '$lib/content/constants/competitors';
import { buildAlternativesDetailNavSections } from '$lib/content/constants/competitors/comparePageSectionNav';
import { createComparePageOnPageNavigationSchema } from '$lib/content/utils/createComparePageOnPageNavigationSchema';
import { buildAlternativesDetailFaqItems } from '$lib/content/constants/faq/buildAlternativesDetailFaqItems';
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

	const detailVm = publicAlternativesPagePresenter.buildDetailVm(slug);
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

	const webPageNode = {
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

	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			webPageNode,
			...('nodes' in onPageNavigationSchema ? onPageNavigationSchema.nodes : []),
			{
				'@type': 'ItemList',
				'@id': `${canonical}#alternatives`,
				name: `Best alternatives to ${detailVm.targetName}`,
				description: customDescription,
				url: canonical,
				numberOfItems: detailVm.listings.length,
				itemListElement: detailVm.listings.map((listing, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					item: {
						'@id': `${canonical}#${listing.slug}`
					}
				}))
			},
			...detailVm.listings.map((listing) =>
				createAlternativesSoftwareApplicationSEOSchema({
					canonical,
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
		faqItems,
		schemaData
	};
}

type CreateAlternativesSoftwareApplicationSEOSchemaParams = {
	canonical: string;
	listing: AlternativesListingViewModel;
};

function createAlternativesSoftwareApplicationSEOSchema(
	params: CreateAlternativesSoftwareApplicationSEOSchemaParams
): JsonLdGraphNode {
	const { canonical, listing } = params;

	return {
		'@type': 'SoftwareApplication',
		'@id': `${canonical}#${listing.slug}`,
		name: listing.name,
		abstract: listing.tagline,
		description: listing.overview,
		applicationCategory: 'Social media scheduling application',
		operatingSystem: 'Web',
		url: listing.websiteUrl,
		mainEntityOfPage: {
			'@id': `${canonical}#webpage`
		},
		isPartOf: {
			'@id': `${canonical}#alternatives`
		},
		...(listing.isOpenQuok ? { isAccessibleForFree: true } : {}),
		...(listing.isOpenQuok
			? {
					offers: {
						'@type': 'Offer',
						price: '0',
						priceCurrency: 'USD',
						url: listing.websiteUrl
					} satisfies Offer
				}
			: {})
	} satisfies SoftwareApplication;
}
