import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicStacksPagePresenter } from '$lib/area-public';
import { getRootPathPublicStacks } from '$lib/area-public/constants/getRootPathPublicStacks';
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

	const metaTitle = 'Extension stacks';
	const metaDescription = 'Curated bundles of skills and MCP servers for your agent workflow.';

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${metaTitle} | ${companyName}`,
		customDescription: metaDescription,
		customSlug: getRootPathPublicStacks(),
		requestUrl: url
	})) satisfies MetaTagsProps;

	return {
		pageMetaTags: metaTags,
		isLoggedIn,
		stacksVm: stacks,
		totalCount: count,
		searchTerm,
		metaTitle,
		metaDescription
	};
}
