import type { MetaTagsProps } from 'svelte-meta-tags';

import { error } from '@sveltejs/kit';

import { getRootPathPublicBuildBacklinksSite } from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { buildListingsHubBreadcrumbItems } from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { linkDirectoryRepository } from '$lib/link-directory/index';
import { createMetaData, type MetaDataImage } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import {
	createBuildBacklinksOpportunityHowToSchemas,
	createBuildBacklinksSiteGuideHowToSchema
} from '$lib/link-directory/utils/createBuildBacklinksSiteGuideHowToSchema';
import {
	createBuildBacklinksSiteGuidePlatformOrganizationSchema,
	createBuildBacklinksSiteGuideWebPageSchema
} from '$lib/link-directory/utils/createBuildBacklinksSiteGuideSeoSchema';
import { createBreadcrumbListSchema } from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';

export const ssr = true;

export async function load({ params, url, fetch, cookies, parent }) {
	const siteSlug = typeof params.siteSlug === 'string' ? params.siteSlug.trim() : '';
	if (!siteSlug) {
		throw error(404, 'Site not found');
	}

	const site = await linkDirectoryRepository.getPublishedSiteBySlug(siteSlug, fetch);
	if (!site) {
		throw error(404, 'Site not found');
	}

	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const customTitle = `${site.title} backlink opportunities | ${companyName}`;
	const customDescription =
		site.shortDescription?.trim() ||
		`Ways to earn links on ${site.title}, including effort, cost, and dofollow notes.`;

	const customImages: MetaDataImage[] | undefined = site.logoUrl
		? [
				{
					url: site.logoUrl,
					type: 'image/png',
					alt: `${site.title} logo`,
					width: 512,
					height: 512
				}
			]
		: undefined;

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customSlug: getRootPathPublicBuildBacklinksSite(site.slug),
		customImages,
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(url);
	const pageMetaTags = withCanonicalMetaTags(metaTags, canonical, {
		openGraph: {
			title: site.title,
			description: customDescription
		},
		twitter: {
			title: site.title,
			description: customDescription
		}
	});

	const platformOrganization = createBuildBacklinksSiteGuidePlatformOrganizationSchema({
		canonicalUrl: canonical,
		siteTitle: site.title,
		siteUrl: site.siteUrl,
		logoUrl: site.logoUrl
	});

	const webPageNode = createBuildBacklinksSiteGuideWebPageSchema({
		canonical,
		origin: url.origin,
		companyName,
		name: site.title,
		description: customDescription
	});

	const siteGuideHowTo = createBuildBacklinksSiteGuideHowToSchema({
		canonicalUrl: canonical,
		siteTitle: site.title,
		siteDescription: site.shortDescription,
		opportunities: site.opportunities ?? []
	});

	const opportunityHowTos = createBuildBacklinksOpportunityHowToSchemas({
		canonicalUrl: canonical,
		opportunities: site.opportunities ?? []
	});

	const listingsBreadcrumb = {
		kind: 'build-backlinks' as const,
		variant: 'site' as const,
		siteLabel: site.title
	};

	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			createBreadcrumbListSchema(
				buildListingsHubBreadcrumbItems(listingsBreadcrumb),
				url.origin
			),
			platformOrganization,
			webPageNode,
			siteGuideHowTo,
			...opportunityHowTos
		])
	);

	return {
		pageMetaTags,
		isLoggedIn,
		siteVm: site,
		schemaData,
		metaTitle: customTitle,
		metaDescription: customDescription,
		listingsBreadcrumb
	};
}
