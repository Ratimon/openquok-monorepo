import type { MetaTagsProps } from 'svelte-meta-tags';

import type { ItemList } from 'schema-dts';
import type { Cookies } from '@sveltejs/kit';

import type { JsonLdGraphNode } from '$lib/seo/jsonLdSchema';

import { error } from '@sveltejs/kit';

import {
	getPublicApiPostingHubPage,
	getPublicApiPostingPlatformBySlug,
	getPublicApiSchedulingHubPage,
	getPublicApiSchedulingPlatformBySlug,
	listPublicApiPostingPlatformsForHub,
	listPublicApiSchedulingPlatformsForHub,
	type PublicApiCapability,
	type PublicApiHubPageViewModel,
	type PublicApiPlatformHubCard,
	type PublicApiPlatformPageViewModel
} from '$lib/content/constants/apis/index';
import {
	getRootPathSocialMediaPostingApi,
	getRootPathSocialMediaPostingApiPlatform,
	getRootPathSocialMediaSchedulingApi,
	getRootPathSocialMediaSchedulingApiPlatform
} from '$lib/area-public/constants/getRootPathPublicApiMarketing';
import type {
	CompanyInformationProgrammerModel,
	MarketingInformationProgrammerModel
} from '$lib/area-public/publicInformation.types';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { buildApiMarketingLandingBreadcrumbItems } from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createPublicLandingBreadcrumbListSchema } from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';

type ParentData = {
	companyInformationPm: CompanyInformationProgrammerModel | null;
	marketingInformationPm: MarketingInformationProgrammerModel | null;
};

function getHubRootPath(capability: PublicApiCapability): string {
	return capability === 'posting'
		? getRootPathSocialMediaPostingApi()
		: getRootPathSocialMediaSchedulingApi();
}

function getPlatformRootPath(capability: PublicApiCapability, slug: string): string {
	return capability === 'posting'
		? getRootPathSocialMediaPostingApiPlatform(slug)
		: getRootPathSocialMediaSchedulingApiPlatform(slug);
}

function getHubVm(capability: PublicApiCapability): PublicApiHubPageViewModel {
	return capability === 'posting' ? getPublicApiPostingHubPage() : getPublicApiSchedulingHubPage();
}

function listPlatformsForHub(capability: PublicApiCapability): PublicApiPlatformHubCard[] {
	return capability === 'posting'
		? listPublicApiPostingPlatformsForHub()
		: listPublicApiSchedulingPlatformsForHub();
}

function getPlatformVm(
	capability: PublicApiCapability,
	slug: string
): PublicApiPlatformPageViewModel | undefined {
	return capability === 'posting'
		? getPublicApiPostingPlatformBySlug(slug)
		: getPublicApiSchedulingPlatformBySlug(slug);
}

function buildPublicApiMarketingHubItemListSchema(params: {
	canonical: string;
	origin: string;
	capability: PublicApiCapability;
	platforms: PublicApiPlatformHubCard[];
}): ItemList {
	const { canonical, origin, capability, platforms } = params;

	return {
		'@type': 'ItemList',
		'@id': `${canonical}#platform-list`,
		name:
			capability === 'posting'
				? 'Social media posting API platforms'
				: 'Social media scheduling API platforms',
		description:
			capability === 'posting'
				? 'Platform-specific posting API examples for TikTok, Instagram, X, LinkedIn, Facebook, Threads, and YouTube.'
				: 'Platform-specific scheduling API examples for TikTok, Instagram, X, LinkedIn, Facebook, Threads, and YouTube.',
		url: canonical,
		numberOfItems: platforms.length,
		itemListElement: platforms.map((platform, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: platform.platformLabel,
			description: platform.hubDescription,
			url: new URL(getPlatformRootPath(capability, platform.slug), origin).href
		}))
	};
}

function buildPublicApiMarketingSoftwareApplicationSchema(params: {
	canonical: string;
	origin: string;
	name: string;
	description: string;
	docsPath: string;
	keywords: string[];
	featureList: string[];
}): JsonLdGraphNode {
	const { canonical, origin, name, description, docsPath, keywords, featureList } = params;

	return {
		'@type': 'SoftwareApplication',
		'@id': `${canonical}#software`,
		name,
		description,
		url: canonical,
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Web',
		softwareHelp: {
			'@type': 'CreativeWork',
			url: new URL(docsPath, origin).href
		},
		featureList,
		keywords: keywords.join(', '),
		mainEntityOfPage: {
			'@id': `${canonical}#webpage`
		}
	};
}

export async function loadPublicApiMarketingHubPage(params: {
	url: URL;
	cookies: Cookies;
	parent: () => Promise<ParentData>;
	capability: PublicApiCapability;
}) {
	const { url, cookies, parent, capability } = params;

	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const hubVm = getHubVm(capability);
	const platformsVm = listPlatformsForHub(capability);

	const customTitle = hubVm.metaTitle;
	const customDescription = hubVm.metaDescription;

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customSlug: getHubRootPath(capability),
		customTags: [...hubVm.keywords],
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
				'@type': 'CollectionPage',
				'@id': `${canonical}#webpage`,
				name: customTitle,
				description: customDescription,
				url: canonical,
				mainEntity: {
					'@id': `${canonical}#platform-list`
				},
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: url.origin
				}
			},
			buildPublicApiMarketingHubItemListSchema({
				canonical,
				origin: url.origin,
				capability,
				platforms: platformsVm
			}),
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: hubVm.faqTitle,
				description: hubVm.faqDescription,
				items: hubVm.faqItems
			}),
			createPublicLandingBreadcrumbListSchema(
				buildApiMarketingLandingBreadcrumbItems({
					capability,
					hubMetaTitle: hubVm.metaTitle
				}),
				url.origin
			)
		])
	);

	return {
		pageMetaTags,
		isLoggedIn,
		hubVm,
		platformsVm,
		schemaData
	};
}

export async function loadPublicApiMarketingPlatformPage(params: {
	url: URL;
	params: { slug?: string };
	cookies: Cookies;
	parent: () => Promise<ParentData>;
	capability: PublicApiCapability;
}) {
	const { url, cookies, parent, capability } = params;
	const slug = params.params.slug?.trim().toLowerCase() ?? '';

	if (slug.length === 0) {
		throw error(404, 'API platform page not found');
	}

	const platformVm = getPlatformVm(capability, slug);
	if (!platformVm) {
		throw error(404, 'API platform page not found');
	}

	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const customTitle = platformVm.metaTitle;
	const customDescription = platformVm.metaDescription;
	const featureList = [
		platformVm.heroTitle,
		...platformVm.formatExamples.map((example) => example.label),
		...platformVm.faqItems.map((item) => item.title)
	].filter((value, index, values) => value.trim().length > 0 && values.indexOf(value) === index);

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customSlug: getPlatformRootPath(capability, platformVm.slug),
		customTags: [...platformVm.keywords],
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
				name: platformVm.metaTitle,
				description: customDescription,
				url: canonical,
				mainEntity: {
					'@id': `${canonical}#software`
				},
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: url.origin
				}
			},
			buildPublicApiMarketingSoftwareApplicationSchema({
				canonical,
				origin: url.origin,
				name: platformVm.heroTitle,
				description: customDescription,
				docsPath: platformVm.publicApiProvidersDocsPath,
				keywords: [...platformVm.keywords],
				featureList
			}),
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: platformVm.faqTitle,
				description: platformVm.faqDescription,
				items: platformVm.faqItems
			}),
			createPublicLandingBreadcrumbListSchema(
				buildApiMarketingLandingBreadcrumbItems({
					capability,
					hubMetaTitle:
						capability === 'posting'
							? getPublicApiPostingHubPage().metaTitle
							: getPublicApiSchedulingHubPage().metaTitle,
					platformLabel: platformVm.platformLabel
				}),
				url.origin
			)
		])
	);

	return {
		pageMetaTags,
		isLoggedIn,
		platformVm,
		platformsVm: listPlatformsForHub(capability),
		schemaData
	};
}
