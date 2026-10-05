import type { MetaTagsProps } from 'svelte-meta-tags';

import { error } from '@sveltejs/kit';

import { getRootPathPublicBuildBacklinksSite } from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { buildListingsHubBreadcrumbItems } from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import {
	linkDirectoryRepository,
	publicBuildBacklinksSiteBySlugPagePresenter
} from '$lib/link-directory/index';
import type { ListingCommentViewModel } from '$lib/listings/GetListing.presenter.svelte';
import { createMetaData, type MetaDataImage } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { buildPublicFeaturesOrderedHowToSchemas } from '$lib/seo/featuresOrderedHowToSchema';
import {
	buildBuildBacklinksGuideSections,
	listBuildBacklinksGuideOpportunityHowToSections
} from '$lib/link-directory/utils/buildBuildBacklinksGuideSections';
import {
	createBuildBacklinksSiteGuidePlatformOrganizationSchema,
	createBuildBacklinksSiteGuideWebPageSchema
} from '$lib/link-directory/utils/createBuildBacklinksSiteGuideSeoSchema';
import {
	formatBuildBacklinksSiteHeroTitle,
	formatBuildBacklinksSiteMetaDescription,
	formatBuildBacklinksSiteMetaTitle,
	formatBuildBacklinksSiteSeoKeywords
} from '$lib/link-directory/utils/formatBuildBacklinksSiteSeoCopy';
import { buildBuildBacklinksSiteFaqSection } from '$lib/link-directory/utils/buildBuildBacklinksSiteFaqSection';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
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

	const commentsVm: ListingCommentViewModel[] =
		await publicBuildBacklinksSiteBySlugPagePresenter.loadSiteCommentsStateless({
			siteId: site.id,
			fetch
		});

	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const metaTitleBase = formatBuildBacklinksSiteMetaTitle(site.title);
	const customTitle = `${metaTitleBase} | ${companyName}`;
	const customDescription = formatBuildBacklinksSiteMetaDescription(site);
	const heroTitle = formatBuildBacklinksSiteHeroTitle(site.title);
	const seoKeywords = formatBuildBacklinksSiteSeoKeywords(site);

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
		customTags: seoKeywords,
		customImages,
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(url);
	const pageMetaTags = withCanonicalMetaTags(metaTags, canonical, {
		openGraph: {
			title: metaTitleBase,
			description: customDescription
		},
		twitter: {
			title: metaTitleBase,
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
		name: metaTitleBase,
		description: customDescription
	});

	const listingsBreadcrumb = {
		kind: 'build-backlinks' as const,
		variant: 'site' as const,
		siteLabel: site.title
	};

	const guideSections = buildBuildBacklinksGuideSections({ canonical, site });
	const siteFaqSection = buildBuildBacklinksSiteFaqSection({ site, canonical });

	const guideHowToSections = [
		...guideSections.filter((section) => section.sectionId === 'howto-site'),
		...listBuildBacklinksGuideOpportunityHowToSections(guideSections)
	];

	const guideHowToNodes = buildPublicFeaturesOrderedHowToSchemas({
		pageUrl: canonical,
		sections: guideHowToSections
	});

	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			createBreadcrumbListSchema(
				buildListingsHubBreadcrumbItems(listingsBreadcrumb),
				url.origin
			),
			platformOrganization,
			webPageNode,
			...guideHowToNodes,
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: siteFaqSection.faqTitle,
				description: siteFaqSection.faqDescription,
				items: siteFaqSection.faqItems
			})
		])
	);

	return {
		pageMetaTags,
		isLoggedIn,
		commentsVm,
		siteVm: site,
		guideSections,
		siteFaqSection,
		schemaData,
		heroTitle,
		metaTitle: customTitle,
		metaDescription: customDescription,
		listingsBreadcrumb
	};
}
