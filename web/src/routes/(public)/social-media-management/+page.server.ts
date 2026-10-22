import type { MetaTagsProps } from 'svelte-meta-tags';

import { getRootPathPublicSocialAutopilotLanding } from '$lib/area-public/constants/getRootPathPublicSocialAutopilotLanding';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { getPublicMarketingLandingFaqSection } from '$lib/content/constants/marketing/publicMarketingLandingFaqs';
import { createPublicPricingSectionSEOSchema } from '$lib/content/utils/createPublicPricingSEOSchema';
import { SOCIAL_AUTOPILOT_OPPORTUNITIES_PREVIEW_SECTION } from '$lib/content/constants/agents';
import { PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG } from '$lib/content/constants/marketing/social-autopilot-landing';
import { loadAgentOpportunitiesPreviewStateless } from '$lib/opportunities/server/loadAgentOpportunitiesPreview.server';
import { createLandingDemoSEOSchema } from '$lib/content/utils/createLandingDemoSEOSchema';
import {
	createPublicAudienceSectionSEOSchema,
	withSchemaOrgAudience
} from '$lib/content/utils/createPublicAudienceSEOSchema';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { loadMergedLandingPageConfigVm } from '$lib/seo/loadPublicCmsLandingPage.server';
import { buildSocialAutopilotLandingBreadcrumbItems } from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createBreadcrumbListSchema } from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes, type JsonLdGraphNode } from '$lib/seo/jsonLdSchema';

export const ssr = true;

function buildSocialAutopilotSoftwareApplicationSchema(params: {
	canonical: string;
	origin: string;
	name: string;
	description: string;
	docsPath: string;
	keywords: readonly string[];
	featureList: readonly string[];
	audienceCards: readonly (typeof PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG.whoIsFor.audienceCards)[number][];
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
			applicationCategory: 'BusinessApplication',
			operatingSystem: 'Web',
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

export async function load({ url, cookies, parent, fetch }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();
	const [landingPageConfigVm, opportunitiesPreviewVm] = await Promise.all([
		loadMergedLandingPageConfigVm(fetch),
		loadAgentOpportunitiesPreviewStateless({
			fetch,
			previewSection: SOCIAL_AUTOPILOT_OPPORTUNITIES_PREVIEW_SECTION,
			includeBacklinksBlock: false
		})
	]);

	const faqSection = getPublicMarketingLandingFaqSection('social-autopilot');

	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const {
		metaTitle: customTitle,
		metaDescription: customDescription,
		keywords,
		whoIsFor,
		softwareApplication
	} = PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG;

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customSlug: getRootPathPublicSocialAutopilotLanding(),
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
			buildSocialAutopilotSoftwareApplicationSchema({
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
			createPublicPricingSectionSEOSchema({
				pageUrl: canonical,
				origin: url.origin
			}),
			createLandingDemoSEOSchema({
				youtubeVideoId: landingPageConfigVm.DEMO_YOUTUBE_VIDEO_ID,
				name: landingPageConfigVm.DEMO_TITLE,
				description: landingPageConfigVm.DEMO_DESCRIPTION,
				pageUrl: canonical,
				uploadDate: landingPageConfigVm.DEMO_YOUTUBE_UPLOAD_DATE
			}),
			createBreadcrumbListSchema(buildSocialAutopilotLandingBreadcrumbItems(), url.origin)
		])
	);

	return {
		pageMetaTags,
		schemaData,
		isLoggedIn,
		landingPageConfigVm,
		opportunitiesPreviewVm
	};
}
