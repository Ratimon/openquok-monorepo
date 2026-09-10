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
import { PUBLIC_BUILDING_BLOCKS_HUB } from '$lib/listings/constants/publicListingsHubConfig';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';

export const ssr = true;

export async function load({ url, fetch, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const customTitle = 'Social Scheduling Building Block Tags';
	const customDescription =
		'Filter scheduler skills and MCP servers by platform and use case — Threads, TikTok, Instagram, Cursor, OpenClaw, and more.';
	const customSlug = getRootPathPublicBuildingBlocksTags();

	const metaTags = await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customTags: [...PUBLIC_BUILDING_BLOCKS_HUB.seoKeywords],
		customSlug,
		requestUrl: url
	}) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(url);
	const pageMetaTags = withCanonicalMetaTags(metaTags, canonical, {
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default)
		}
	});

	const hub = await publicBuildingBlocksPagePresenter.loadBuildingBlocksHubStateless({ fetch, limit: 50 });
	const tagsCatalog = await getListingPresenter.loadAllTagsVm(fetch);
	const tagFilterVm = getListingPresenter.buildExtensionsTagFilterVm({
		tagsCatalog,
		extensions: hub.extensions
	}	);
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
