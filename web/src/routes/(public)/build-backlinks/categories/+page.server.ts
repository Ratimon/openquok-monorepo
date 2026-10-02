import type { MetaTagsProps } from 'svelte-meta-tags';

import { getRootPathPublicBuildBacklinksCategories } from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { PUBLIC_BUILD_BACKLINKS_HUB } from '$lib/content/constants/hubs/build-backlinks';
import { buildListingsHubBreadcrumbItems } from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { linkDirectoryRepository } from '$lib/link-directory/index';
import { buildBuildBacklinksCategoryOverview } from '$lib/link-directory/utils/buildBuildBacklinksOverviewCounts';
import {
	createBuildBacklinksCategoryTermSetSchema,
	createBuildBacklinksCollectionPageSchema
} from '$lib/link-directory/utils/createBuildBacklinksSeoSchema';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createBreadcrumbListSchema } from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';

export const ssr = true;

const PUBLISHED_SITES_FOR_COUNTS_LIMIT = 500;

export async function load({ url, fetch, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const customTitle = 'Backlink directory categories';
	const customDescription =
		'Browse backlink opportunities by category — social platforms, launch sites, directories, and more.';
	const customSlug = getRootPathPublicBuildBacklinksCategories();

	const metaTags = await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customTags: [...PUBLIC_BUILD_BACKLINKS_HUB.seoKeywords],
		customSlug,
		requestUrl: url
	}) satisfies MetaTagsProps;

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

	const [categoryDetails, published] = await Promise.all([
		linkDirectoryRepository.getActiveCategories(fetch),
		linkDirectoryRepository.getPublishedSites({
			limit: PUBLISHED_SITES_FOR_COUNTS_LIMIT,
			skip: 0,
			fetch
		})
	]);

	const categories = buildBuildBacklinksCategoryOverview(categoryDetails, published.sites);

	const listingsBreadcrumb = {
		kind: 'build-backlinks' as const,
		variant: 'categories-index' as const,
		categoryLabel: null,
		categorySlug: null,
		tagLabel: null
	};

	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			createBreadcrumbListSchema(
				buildListingsHubBreadcrumbItems(listingsBreadcrumb),
				url.origin
			),
			createBuildBacklinksCollectionPageSchema({
				canonical,
				origin: url.origin,
				companyName,
				name: customTitle,
				description: customDescription,
				mainEntityId: `${canonical}#categories-set`
			}),
			createBuildBacklinksCategoryTermSetSchema({
				canonical,
				origin: url.origin,
				name: 'Backlink directory categories',
				description: customDescription,
				categories
			})
		])
	);

	return {
		pageMetaTags,
		isLoggedIn,
		categories,
		schemaData,
		listingsBreadcrumb
	};
}
