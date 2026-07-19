import type { MetaTagsProps } from 'svelte-meta-tags';

import type { ItemList } from 'schema-dts';

import { publicAgentsPagePresenter } from '$lib/area-public';
import { PUBLIC_AGENTS_HUB } from '$lib/content/constants/publicAgentConfig';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { createMetaData } from '$lib/utils/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/utils/buildCanonicalUrl';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/utils/jsonLdSchema';
import {
	getRootPathPublicAgent,
	getRootPathPublicAgents
} from '$lib/area-public/constants/getRootPathPublicAgents';

export const ssr = true;

function buildAgentsItemListSchema(params: {
	canonical: string;
	origin: string;
	agents: Array<{ slug: string; agentLabel: string }>;
	mcpIntegrations: Array<{ slug: string; label: string }>;
}): ItemList {
	const { canonical, origin, agents, mcpIntegrations } = params;

	const allItems = [
		...agents.map((agent) => ({
			slug: agent.slug,
			name: agent.agentLabel
		})),
		...mcpIntegrations.map((integration) => ({
			slug: integration.slug,
			name: integration.label
		}))
	];

	return {
		'@type': 'ItemList',
		'@id': `${canonical}#agents-list`,
		url: canonical,
		numberOfItems: allItems.length,
		itemListElement: allItems.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			url: new URL(getRootPathPublicAgent(item.slug), origin).href
		}))
	};
}

export async function load({ url, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();

	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;
	const agentsVm = publicAgentsPagePresenter.loadAgentsHubStateless();
	const mcpIntegrationsVm = publicAgentsPagePresenter.loadMcpIntegrationsHubStateless();

	const customTitle = 'AI agent integrations';
	const customDescription = PUBLIC_AGENTS_HUB.description;

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customSlug: getRootPathPublicAgents(),
		customTags: [
			'AI agent social media',
			'OpenClaw skill',
			'openquok CLI',
			'OpenQuok MCP',
			'Cursor MCP social media',
			'agent host vs MCP client',
			'Codex CLI social media',
			'Claude Code MCP',
			'agentic social scheduler',
			'social media automation'
		],
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(url);
	const pageMetaTags = withCanonicalMetaTags(metaTags, canonical, {
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default)
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
					'@id': `${canonical}#agents-list`
				},
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: url.origin
				}
			},
			buildAgentsItemListSchema({
				canonical,
				origin: url.origin,
				agents: agentsVm.map((agent) => ({ slug: agent.slug, agentLabel: agent.agentLabel })),
				mcpIntegrations: mcpIntegrationsVm.map((integration) => ({
					slug: integration.slug,
					label: integration.label
				}))
			}),
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: PUBLIC_AGENTS_HUB.faqSection.faqTitle,
				description: PUBLIC_AGENTS_HUB.faqSection.faqDescription,
				items: PUBLIC_AGENTS_HUB.faqSection.faqItems
			})
		])
	);

	return {
		pageMetaTags,
		isLoggedIn,
		agentsVm,
		mcpIntegrationsVm,
		schemaData
	};
}
