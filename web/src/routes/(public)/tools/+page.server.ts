import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicToolsPagePresenter } from '$lib/area-public';
import { getRootPathPublicAgentBuilder, getRootPathPublicTools } from '$lib/area-public/constants/getRootPathPublicTools';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { createMetaData } from '$lib/utils/createMetaData';
import { route, url } from '$lib/utils/path';

export const ssr = true;

export async function load({ url: requestUrl, cookies, parent }) {
	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const { metaTitle, metaDescription } = publicToolsPagePresenter.getToolsIndexVm();

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${metaTitle} | ${companyName}`,
		customDescription: metaDescription,
		customSlug: getRootPathPublicTools(),
		requestUrl
	})) satisfies MetaTagsProps;

	const tools = [
		{
			id: 'agent-builder',
			title: 'Agent Builder',
			description:
				'Drag CLI commands and MCP tools into a workflow and export SKILL.md for your agent.',
			href: url(route(getRootPathPublicAgentBuilder())),
			badge: 'Stack builder'
		}
	];

	const canonical = new URL(requestUrl.pathname, requestUrl.origin).href;
	const schemaData = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'CollectionPage',
				'@id': `${canonical}#webpage`,
				name: metaTitle,
				description: metaDescription,
				url: canonical,
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: requestUrl.origin
				}
			}
		]
	};

	return {
		pageMetaTags: metaTags,
		isLoggedIn,
		metaTitle,
		metaDescription,
		toolsVm: tools,
		schemaData
	};
}
