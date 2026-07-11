import type { MetaTagsProps } from 'svelte-meta-tags';

import { getRootPathPublicBuildingBlocksTags } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
import { publicBuildingBlocksPagePresenter } from '$lib/area-public/index';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { getListingPresenter } from '$lib/listings/index';
import {
	createCollectionPageSchema,
	createTagGroupTermSetSchema,
	createTagTermSetSchema
} from '$lib/listings/utils/createBuildingBlocksSeoSchema';
import { createMetaData } from '$lib/utils/createMetaData';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/utils/jsonLdSchema';

export const ssr = true;

export async function load({ url, fetch, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const customTitle = 'Building Block Tags';
	const customDescription =
		'Browse all building block tags — filter skills and MCP servers by platform, use case, and more.';
	const customSlug = getRootPathPublicBuildingBlocksTags();

	const metaTags = await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customTags: ['building blocks', 'tags', 'agent skills', 'MCP servers'],
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

	const hub = await publicBuildingBlocksPagePresenter.loadBuildingBlocksHubStateless({ fetch, limit: 50 });
	const tagsCatalog = await getListingPresenter.loadAllTagsVm(fetch);
	const tagFilterVm = getListingPresenter.buildExtensionsTagFilterVm({
		tagsCatalog,
		extensions: hub.extensions
	});
	const canonical = new URL(url.pathname, url.origin).href;
	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			createCollectionPageSchema({
				canonical,
				origin: url.origin,
				companyName,
				name: customTitle,
				description: customDescription,
				mainEntityId: [`${canonical}#tag-groups-set`, `${canonical}#tags-set`]
			}),
			createTagGroupTermSetSchema({
				canonical,
				origin: url.origin,
				name: 'Building block tag groups',
				description: 'Groups used to organize building block tags by topic.',
				groups: tagFilterVm.groups
			}),
			createTagTermSetSchema({
				canonical,
				origin: url.origin,
				name: 'Building block tags',
				description: customDescription,
				tags: tagFilterVm.tags
			})
		])
	);

	return {
		pageMetaTags,
		isLoggedIn,
		tagFilterVm,
		schemaData
	};
}
