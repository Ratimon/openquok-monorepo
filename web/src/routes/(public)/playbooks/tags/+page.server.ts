import type { MetaTagsProps } from 'svelte-meta-tags';

import { getRootPathPublicPlaybooksTags } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import { publicPlaybooksPagePresenter } from '$lib/area-public/index';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { getListingPresenter } from '$lib/listings/index';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, fetch, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const customTitle = 'Playbook Tags';
	const customDescription =
		'Browse all playbook tags — filter agent workflows by platform, use case, and more.';
	const customSlug = getRootPathPublicPlaybooksTags();

	const metaTags = await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customTags: ['playbooks', 'tags', 'agent workflows', 'automation'],
		customSlug,
		requestUrl: url
	}) satisfies MetaTagsProps;

	const pageMetaTags = Object.freeze({
		canonical: new URL(url.pathname, url.origin).href,
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default)
		},
		...metaTags
	}) satisfies MetaTagsProps;

	const hub = await publicPlaybooksPagePresenter.loadPlaybooksHubStateless({ fetch, limit: 50 });
	const tagsCatalog = await getListingPresenter.loadAllTagsVm(fetch);
	const tagFilterVm = getListingPresenter.buildStacksTagFilterVm({
		tagsCatalog,
		stacks: hub.stacks
	});

	return {
		pageMetaTags,
		isLoggedIn,
		tagFilterVm
	};
}
