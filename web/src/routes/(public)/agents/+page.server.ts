import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicAgentsPagePresenter } from '$lib/area-public';
import { PUBLIC_AGENTS_HUB } from '$lib/content/constants/publicAgentConfig';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { createMetaData } from '$lib/utils/createMetaData';
import { getRootPathPublicAgents } from '$lib/area-public/constants/getRootPathPublicAgents';

export const ssr = true;

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

	const canonical = new URL(url.pathname, url.origin).href;
	const pageMetaTags = Object.freeze({
		canonical,
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default)
		},
		...metaTags
	}) satisfies MetaTagsProps;

	const schemaData = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'CollectionPage',
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
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: PUBLIC_AGENTS_HUB.faqSection.faqTitle,
				description: PUBLIC_AGENTS_HUB.faqSection.faqDescription,
				items: PUBLIC_AGENTS_HUB.faqSection.faqItems
			})
		].filter((node) => Object.keys(node).length > 0)
	};

	return {
		pageMetaTags,
		isLoggedIn,
		agentsVm,
		mcpIntegrationsVm,
		schemaData
	};
}
