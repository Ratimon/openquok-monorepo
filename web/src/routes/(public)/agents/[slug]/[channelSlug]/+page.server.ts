import type { MetaTagsProps } from 'svelte-meta-tags';

import type { JsonLdGraphNode } from '$lib/seo/jsonLdSchema';

import { error } from '@sveltejs/kit';

import { publicAgentByPagePresenter, isPublicAgentHostLandingPage, isPublicMcpLandingPage } from '$lib/area-public';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import {
	getPublicAgentChannelBySlug,
	listPublicAgentChannelsForHub
} from '$lib/content/constants/publicAgentChannelConfig';
import { getPublicChannelBySlug } from '$lib/content/constants/publicChannelConfig';
import { buildAgentsLandingBreadcrumbItems } from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import {
	createPublicAudienceSectionSEOSchema,
	withSchemaOrgAudience
} from '$lib/content/utils/createPublicAudienceSEOSchema';
import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import { loadAgentListingsPreviewStateless } from '$lib/listings/server/loadAgentListingsPreview.server';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createBreadcrumbListSchema } from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';
import { getRootPathPublicAgentChannel } from '$lib/area-public/constants/getRootPathPublicAgents';

export const ssr = true;

function buildSoftwareApplicationSchema(params: {
	canonical: string;
	origin: string;
	docsPath: string;
	name: string;
	description: string;
	keywords: string[];
	featureList: string[];
	audienceCards?: readonly AudienceCard[];
	audienceSectionTitle?: string;
	audienceSectionSubtitle?: string;
}): JsonLdGraphNode {
	const {
		canonical,
		origin,
		docsPath,
		name,
		description,
		keywords,
		featureList,
		audienceCards = [],
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
			applicationCategory: 'AI assistant',
			operatingSystem: 'Web, Desktop, CLI',
			softwareHelp: {
				'@type': 'CreativeWork',
				url: new URL(docsPath, origin).href
			},
			featureList,
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

export async function load({ url, params, cookies, parent, fetch }) {
	const agentSlug = params.slug?.trim().toLowerCase() ?? '';
	const channelSlug = params.channelSlug?.trim().toLowerCase() ?? '';

	if (!agentSlug || !channelSlug) {
		throw error(404, 'Agent channel page not found');
	}

	const channelPage = publicAgentByPagePresenter.loadAgentChannelStateless(agentSlug, channelSlug);
	if (!channelPage) {
		throw error(404, 'Agent channel page not found');
	}

	const channelConfig = getPublicAgentChannelBySlug(agentSlug, channelSlug);
	if (!channelConfig) {
		throw error(404, 'Agent channel page not found');
	}

	const catalogChannel = getPublicChannelBySlug(channelSlug);
	const isChannelComingSoon = catalogChannel ? !catalogChannel.available : false;

	const { landingVm } = channelPage;
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const listingsPreviewVm = isChannelComingSoon
		? null
		: await loadAgentListingsPreviewStateless({
				fetch,
				previewSection: landingVm.listingsPreviewSection,
				listingTagSlug: channelConfig.listingTagSlug,
				skillBuilderChannelSlug: channelSlug
			});

	const { companyInformationPm, marketingInformationPm } = await parent();

	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const customTitle = isChannelComingSoon
		? `${landingVm.metaTitle} — Coming Soon | ${companyName}`
		: `${landingVm.metaTitle} | ${companyName}`;
	const customDescription = isChannelComingSoon
		? `${landingVm.metaTitle} is coming soon. ${landingVm.metaDescription}`
		: landingVm.metaDescription;

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customSlug: getRootPathPublicAgentChannel(agentSlug, channelSlug),
		customTags: [...landingVm.keywords],
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(url);
	const featureList = [
		...landingVm.setupSteps.map((step) => step.title),
		...landingVm.featureSections.map((section) => section.title)
	].filter((value, index, values) => value.trim().length > 0 && values.indexOf(value) === index);
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

	const agentsBreadcrumbVariant = isPublicMcpLandingPage(landingVm)
		? 'mcp-client'
		: isPublicAgentHostLandingPage(landingVm)
			? 'agent-host'
			: 'agent-host';

	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			withSchemaOrgAudience(
				{
					'@type': 'WebPage',
					'@id': `${canonical}#webpage`,
					name: landingVm.metaTitle,
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
				{
					cards: landingVm.audienceCards,
					sectionTitle: landingVm.audienceTitle,
					sectionSubtitle: landingVm.audienceSubtitle
				},
				canonical
			),
			buildSoftwareApplicationSchema({
				canonical,
				origin: url.origin,
				docsPath: landingVm.docsPath,
				name: landingVm.agentLabel,
				description: customDescription,
				keywords: landingVm.keywords,
				featureList,
				audienceCards: landingVm.audienceCards,
				audienceSectionTitle: landingVm.audienceTitle,
				audienceSectionSubtitle: landingVm.audienceSubtitle
			}),
			createPublicAudienceSectionSEOSchema({
				pageUrl: canonical,
				sectionTitle: landingVm.audienceTitle,
				sectionSubtitle: landingVm.audienceSubtitle,
				cards: landingVm.audienceCards
			}),
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: landingVm.faqTitle,
				description: landingVm.faqDescription,
				items: landingVm.faqItems
			}),
			createBreadcrumbListSchema(
				buildAgentsLandingBreadcrumbItems({
					variant: agentsBreadcrumbVariant,
					agentSlug,
					agentLabel: landingVm.agentLabel,
					channelLabel: channelPage.channelLabel
				}),
				url.origin
			)
		])
	);

	return {
		pageMetaTags,
		isLoggedIn,
		landingVm,
		listingsPreviewVm,
		schemaData,
		channelSlug: channelPage.channelSlug,
		channelLabel: channelPage.channelLabel,
		cliExamplesPath: channelPage.cliExamplesPath,
		agentSlug,
		isChannelComingSoon,
		agentChannelLinksVm: listPublicAgentChannelsForHub(agentSlug)
	};
}
