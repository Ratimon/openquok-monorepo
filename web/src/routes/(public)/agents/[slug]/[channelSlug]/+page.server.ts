import type { MetaTagsProps } from 'svelte-meta-tags';

import type { JsonLdGraphNode } from '$lib/utils/jsonLdSchema';

import { error } from '@sveltejs/kit';

import { publicAgentByPagePresenter } from '$lib/area-public';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import {
	getPublicAgentChannelBySlug,
	listPublicAgentChannelsForHub
} from '$lib/content/constants/publicAgentChannelConfig';
import { getPublicChannelBySlug } from '$lib/content/constants/publicChannelConfig';
import { loadAgentListingsPreviewStateless } from '$lib/listings/server/loadAgentListingsPreview.server';
import { createMetaData } from '$lib/utils/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/utils/buildCanonicalUrl';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/utils/jsonLdSchema';
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
}): JsonLdGraphNode {
	const { canonical, origin, docsPath, name, description, keywords, featureList } = params;

	return {
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
	};
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

	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
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
			buildSoftwareApplicationSchema({
				canonical,
				origin: url.origin,
				docsPath: landingVm.docsPath,
				name: landingVm.agentLabel,
				description: customDescription,
				keywords: landingVm.keywords,
				featureList
			}),
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: landingVm.faqTitle,
				description: landingVm.faqDescription,
				items: landingVm.faqItems
			})
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
