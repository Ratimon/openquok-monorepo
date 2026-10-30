import type { MetaTagsProps } from 'svelte-meta-tags';

import { getRootPathPublicBrowserExtensionLanding } from '$lib/area-public/constants/getRootPathPublicBrowserExtensionLanding';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG } from '$lib/content/constants/marketing/browser-extension-landing';
import { getPublicMarketingLandingFaqSection } from '$lib/content/constants/marketing/publicMarketingLandingFaqs';
import {
	createPublicAudienceSectionSEOSchema,
	withSchemaOrgAudience
} from '$lib/content/utils/createPublicAudienceSEOSchema';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { buildBrowserExtensionLandingBreadcrumbItems } from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createBreadcrumbListSchema } from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import { createPublicSetupStepsSEOSchema } from '$lib/seo/featuresOrderedHowToSchema';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes, type JsonLdGraphNode } from '$lib/seo/jsonLdSchema';

export const ssr = true;

function buildBrowserExtensionSoftwareApplicationSchema(params: {
	canonical: string;
	origin: string;
	name: string;
	description: string;
	docsPath: string;
	keywords: readonly string[];
	featureList: readonly string[];
	audienceCards: readonly (typeof PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG.whoIsFor.audienceCards)[number][];
	audienceSectionTitle: string;
	audienceSectionSubtitle: string;
}): JsonLdGraphNode {
	const {
		canonical,
		origin,
		name,
		description,
		docsPath,
		keywords,
		featureList,
		audienceCards,
		audienceSectionTitle,
		audienceSectionSubtitle
	} = params;

	return withSchemaOrgAudience(
		{
			'@type': 'SoftwareApplication',
			'@id': `${canonical}#software`,
			name,
			description,
			url: canonical,
			applicationCategory: 'BrowserApplication',
			operatingSystem: 'Chrome',
			softwareHelp: {
				'@type': 'CreativeWork',
				url: new URL(docsPath, origin).href
			},
			featureList: [...featureList],
			keywords: keywords.join(', '),
			mainEntityOfPage: {
				'@id': `${canonical}#webpage`
			}
		},
		{
			cards: audienceCards,
			sectionTitle: audienceSectionTitle,
			sectionSubtitle: audienceSectionSubtitle
		},
		canonical
	);
}

export async function load({ url, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();

	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const {
		metaTitle: customTitle,
		metaDescription: customDescription,
		keywords,
		whoIsFor,
		processSection,
		softwareApplication
	} = PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG;

	const faqSection = getPublicMarketingLandingFaqSection('browser-extension');

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customSlug: getRootPathPublicBrowserExtensionLanding(),
		customTags: [...keywords],
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
				name: customTitle,
				description: customDescription,
				url: canonical,
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: url.origin
				}
			},
			buildBrowserExtensionSoftwareApplicationSchema({
				canonical,
				origin: url.origin,
				name: softwareApplication.name,
				description: customDescription,
				docsPath: softwareApplication.docsPath,
				keywords,
				featureList: softwareApplication.featureList,
				audienceCards: whoIsFor.audienceCards,
				audienceSectionTitle: whoIsFor.audienceTitle,
				audienceSectionSubtitle: whoIsFor.audienceSubtitle
			}),
			createPublicAudienceSectionSEOSchema({
				pageUrl: canonical,
				sectionTitle: whoIsFor.audienceTitle,
				sectionSubtitle: whoIsFor.audienceSubtitle,
				cards: whoIsFor.audienceCards
			}),
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: faqSection.faqTitle,
				description: faqSection.faqDescription,
				items: faqSection.faqItems
			}),
			createPublicSetupStepsSEOSchema({
				pageUrl: canonical,
				fragmentId: 'browser-extension-process',
				sectionTitle: processSection.title,
				sectionDescription: processSection.description,
				sectionSubtitle: processSection.subtitle,
				steps: processSection.steps
			}),
			createBreadcrumbListSchema(buildBrowserExtensionLandingBreadcrumbItems(), url.origin)
		])
	);

	return {
		pageMetaTags,
		schemaData,
		isLoggedIn
	};
}
