import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicStacksPagePresenter } from '$lib/area-public';
import { getRootPathPublicPlaybooks } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, cookies, fetch, parent }) {
	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const searchTerm = url.searchParams.get('search')?.trim() || null;
	const { stacks, count } = await publicStacksPagePresenter.loadStacksHubStateless({
		fetch,
		limit: 50,
		searchTerm
	});

	const metaTitle = 'Playbooks';
	const metaDescription = 'Ready-made agent workflows built from skills and MCP building blocks.';

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${metaTitle} | ${companyName}`,
		customDescription: metaDescription,
		customSlug: getRootPathPublicPlaybooks(),
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = new URL(url.pathname, url.origin).href;
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
					url: url.origin
				}
			}
		]
	};

	return {
		pageMetaTags: metaTags,
		isLoggedIn,
		stacksVm: stacks,
		totalCount: count,
		searchTerm,
		metaTitle,
		metaDescription,
		schemaData
	};
}
