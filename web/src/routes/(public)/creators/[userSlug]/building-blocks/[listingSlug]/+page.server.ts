import type { MetaTagsProps } from 'svelte-meta-tags';

import type { Person, WebPage } from 'schema-dts';

import { error } from '@sveltejs/kit';

import { publicBuildingBlockBySlugPagePresenter } from '$lib/area-public';
import {
	getRootPathPublicCreator,
	getRootPathPublicCreatorBuildingBlock
} from '$lib/area-public/constants/getRootPathPublicCreators';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { mergeListingSchemaIntoGraph } from '$lib/listings/index';
import { resolveListingHeaderSummary } from '$lib/listings/utils/resolveListingHeaderSummary';
import { createMetaData, type MetaDataImage } from '$lib/utils/createMetaData';
import { createJsonLdGraph } from '$lib/utils/jsonLdSchema';

export const ssr = true;

export async function load({ url, params, cookies, fetch, parent }) {
	const userSlug = params.userSlug;
	const listingSlug = params.listingSlug;

	if (typeof userSlug !== 'string' || userSlug.trim().length === 0) {
		throw error(404, 'Building block not found');
	}
	if (typeof listingSlug !== 'string' || listingSlug.trim().length === 0) {
		throw error(404, 'Building block not found');
	}

	const { buildingBlockVm, relatedBuildingBlocksVm } =
		await publicBuildingBlockBySlugPagePresenter.loadBuildingBlockBySlugStateless({
			userSlug,
			slug: listingSlug,
			fetch,
			relatedLimit: 4
		});

	if (!buildingBlockVm) {
		throw error(404, 'Building block not found');
	}

	const commentsVm = await publicBuildingBlockBySlugPagePresenter.loadListingCommentsStateless({
		listingId: buildingBlockVm.id,
		fetch
	});

	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const customTitle = `${buildingBlockVm.title} | ${companyName}`;
	const customDescription =
		resolveListingHeaderSummary(buildingBlockVm) ?? `Building block details for ${buildingBlockVm.title}.`;

	const customImages: MetaDataImage[] | undefined = buildingBlockVm.logoImageUrl
		? [
				{
					url: buildingBlockVm.logoImageUrl,
					type: 'image/png',
					alt: `${buildingBlockVm.title} logo`,
					width: 512,
					height: 512
				}
			]
		: undefined;

	const ownerUsername = buildingBlockVm.owner?.username?.trim() ?? userSlug;
	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customSlug: getRootPathPublicCreatorBuildingBlock(ownerUsername, buildingBlockVm.slug),
		customImages,
		customTags: [
			buildingBlockVm.title,
			buildingBlockVm.category?.name ?? 'building blocks',
			buildingBlockVm.extensionType ?? 'building block'
		].filter(Boolean),
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = new URL(url.pathname, url.origin).href;
	const ownerName =
		buildingBlockVm.owner?.fullName?.trim() || buildingBlockVm.owner?.username?.trim() || 'Creator';
	const ownerImage = buildingBlockVm.owner?.avatarUrl?.trim() || undefined;
	const ownerProfileUrl = new URL(`/${getRootPathPublicCreator(ownerUsername)}`, url.origin).href;
	const pageMetaTags = Object.freeze({
		canonical,
		openGraph: {
			title: customTitle,
			description: customDescription,
			...(buildingBlockVm.logoImageUrl ? { images: [{ url: buildingBlockVm.logoImageUrl }] } : {})
		},
		twitter: {
			title: customTitle,
			description: customDescription
		},
		...metaTags
	}) satisfies MetaTagsProps;

	const schemaData = createJsonLdGraph(
		mergeListingSchemaIntoGraph(
			[
				{
					'@type': 'WebPage',
					'@id': `${canonical}#webpage`,
					name: buildingBlockVm.title,
					description: customDescription,
					url: canonical,
					author: {
						'@id': `${canonical}#author`
					},
					isPartOf: {
						'@type': 'WebSite',
						name: companyName,
						url: url.origin
					}
				} satisfies WebPage,
				{
					'@type': 'Person',
					'@id': `${canonical}#author`,
					name: ownerName,
					url: ownerProfileUrl,
					image: ownerImage,
					alternateName: ownerUsername ? `@${ownerUsername}` : undefined
				} satisfies Person
			],
			buildingBlockVm.schemaJson
		)
	);

	return {
		pageMetaTags,
		isLoggedIn,
		buildingBlockVm,
		relatedBuildingBlocksVm,
		commentsVm: commentsVm,
		schemaData
	};
}
