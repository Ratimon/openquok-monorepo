import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicAgentsPagePresenter } from '$lib/area-public';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { createMetaData } from '$lib/utils/createMetaData';
import { getRootPathPublicAgents } from '$lib/area-public/constants/getRootPathPublicAgents';

export const ssr = true;

export async function load({ url, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();

	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;
	const agentsVm = publicAgentsPagePresenter.loadAgentsHubStateless();

	const customTitle = 'AI agent integrations';
	const customDescription =
		'See which AI agent hosts connect to OpenQuok — OpenClaw and more. Install a skill, authenticate the CLI, and schedule social posts while you approve what goes live.';

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
			}
		]
	};

	return {
		pageMetaTags,
		isLoggedIn,
		agentsVm,
		schemaData
	};
}
