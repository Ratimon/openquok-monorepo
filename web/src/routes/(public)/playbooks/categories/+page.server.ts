import type { MetaTagsProps } from 'svelte-meta-tags';

import { getRootPathPublicPlaybooksCategories } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import { publicPlaybooksPagePresenter } from '$lib/area-public/index';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { getListingPresenter, listingRepository } from '$lib/listings/index';
import {
	createCategoryTermSetSchema,
	createCollectionPageSchema
} from '$lib/listings/utils/createPlaybooksSeoSchema';
import { createMetaData } from '$lib/utils/createMetaData';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/utils/jsonLdSchema';

export const ssr = true;

export async function load({ url, fetch, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const customTitle = 'Playbook Categories';
	const customDescription =
		'Browse all playbook categories — agent workflows grouped by topic and use case.';
	const customSlug = getRootPathPublicPlaybooksCategories();

	const metaTags = await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customTags: ['playbooks', 'categories', 'agent workflows', 'automation'],
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
	const categoryDetails = await listingRepository.getActiveCategories(fetch);
	const categories = getListingPresenter.buildStackCategoriesOverviewVm(
		hub.stacks,
		hub.categories,
		categoryDetails
	);
	const canonical = new URL(url.pathname, url.origin).href;
	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			createCollectionPageSchema({
				canonical,
				origin: url.origin,
				companyName,
				name: customTitle,
				description: customDescription,
				mainEntityId: `${canonical}#categories-set`
			}),
			createCategoryTermSetSchema({
				canonical,
				origin: url.origin,
				name: 'Playbook categories',
				description: customDescription,
				categories
			})
		])
	);

	return {
		pageMetaTags,
		isLoggedIn,
		categories,
		schemaData
	};
}
