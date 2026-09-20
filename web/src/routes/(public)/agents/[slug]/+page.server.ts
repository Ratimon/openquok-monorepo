import type { MetaTagsProps } from 'svelte-meta-tags';

import type { JsonLdGraphNode } from '$lib/seo/jsonLdSchema';

import { error } from '@sveltejs/kit';

import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import {
	createPublicAudienceSectionSEOSchema,
	withSchemaOrgAudience
} from '$lib/content/utils/createPublicAudienceSEOSchema';
import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import {
	buildAgentsLandingBreadcrumbItems
} from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { loadAgentListingsPreviewStateless } from '$lib/listings/server/loadAgentListingsPreview.server';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createBreadcrumbListSchema } from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';
import { getRootPathPublicAgent } from '$lib/area-public/constants/getRootPathPublicAgents';
import {
	isPublicAgentHostLandingPage,
	isPublicMcpLandingPage,
	publicAgentByPagePresenter
} from '$lib/area-public';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { listPublicAgentChannelsForHub } from '$lib/content/constants/publicAgentChannelConfig';

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
	const { slug } = params;

	if (typeof slug !== 'string' || slug.trim().length === 0) {
		throw error(404, 'Agent page not found');
	}

	const agentVm = publicAgentByPagePresenter.loadAgentBySlugStateless(slug);
	if (!agentVm) {
		throw error(404, 'Agent page not found');
	}

	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const listingsPreviewVm = await loadAgentListingsPreviewStateless({
		fetch,
		previewSection: agentVm.listingsPreviewSection
	});

	const { companyInformationPm, marketingInformationPm } = await parent();

	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const customTitle = `${agentVm.metaTitle} | ${companyName}`;
	const customDescription = agentVm.metaDescription;

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customSlug: getRootPathPublicAgent(agentVm.slug),
		customTags: agentVm.keywords,
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(url);
	const featureList = [
		...agentVm.setupSteps.map((step) => step.title),
		...agentVm.featureSections.map((section) => section.title)
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

	const agentsBreadcrumbVariant = isPublicMcpLandingPage(agentVm)
		? 'mcp-client'
		: isPublicAgentHostLandingPage(agentVm)
			? 'agent-host'
			: 'agent-host';

	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			withSchemaOrgAudience(
				{
					'@type': 'WebPage',
					'@id': `${canonical}#webpage`,
					name: agentVm.metaTitle,
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
					cards: agentVm.audienceCards,
					sectionTitle: agentVm.audienceTitle,
					sectionSubtitle: agentVm.audienceSubtitle
				},
				canonical
			),
			buildSoftwareApplicationSchema({
				canonical,
				origin: url.origin,
				docsPath: agentVm.docsPath,
				name: agentVm.agentLabel,
				description: customDescription,
				keywords: agentVm.keywords,
				featureList,
				audienceCards: agentVm.audienceCards,
				audienceSectionTitle: agentVm.audienceTitle,
				audienceSectionSubtitle: agentVm.audienceSubtitle
			}),
			createPublicAudienceSectionSEOSchema({
				pageUrl: canonical,
				sectionTitle: agentVm.audienceTitle,
				sectionSubtitle: agentVm.audienceSubtitle,
				cards: agentVm.audienceCards
			}),
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: agentVm.faqTitle,
				description: agentVm.faqDescription,
				items: agentVm.faqItems
			}),
			createBreadcrumbListSchema(
				buildAgentsLandingBreadcrumbItems({
					variant: agentsBreadcrumbVariant,
					agentSlug: agentVm.slug,
					agentLabel: agentVm.agentLabel
				}),
				url.origin
			)
		])
	);

	return {
		pageMetaTags,
		isLoggedIn,
		agentVm,
		listingsPreviewVm,
		schemaData,
		agentChannelLinksVm: listPublicAgentChannelsForHub(agentVm.slug)
	};
}
