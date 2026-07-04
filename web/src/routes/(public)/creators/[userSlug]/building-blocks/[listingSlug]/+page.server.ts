import type { MetaTagsProps } from 'svelte-meta-tags';

import { error } from '@sveltejs/kit';

import { publicExtensionBySlugPagePresenter } from '$lib/area-public';
import { getRootPathPublicCreatorBuildingBlock } from '$lib/area-public/constants/getRootPathPublicCreators';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { mergeListingSchemaIntoGraph } from '$lib/listings/index';
import { createMetaData, type MetaDataImage } from '$lib/utils/createMetaData';

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

	const { extensionVm, relatedExtensionsVm } =
		await publicExtensionBySlugPagePresenter.loadExtensionBySlugStateless({
			userSlug,
			slug: listingSlug,
			fetch,
			relatedLimit: 4
		});

	if (!extensionVm) {
		throw error(404, 'Building block not found');
	}

	const commentsVm = await publicExtensionBySlugPagePresenter.loadListingCommentsStateless({
		listingId: extensionVm.id,
		fetch
	});

	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const customTitle = `${extensionVm.title} | ${companyName}`;
	const customDescription =
		extensionVm.excerpt ?? extensionVm.description ?? `Extension details for ${extensionVm.title}.`;

	const customImages: MetaDataImage[] | undefined = extensionVm.logoImageUrl
		? [
				{
					url: extensionVm.logoImageUrl,
					type: 'image/png',
					alt: `${extensionVm.title} logo`,
					width: 512,
					height: 512
				}
			]
		: undefined;

	const ownerUsername = extensionVm.owner?.username?.trim() ?? userSlug;
	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customSlug: getRootPathPublicCreatorBuildingBlock(ownerUsername, extensionVm.slug),
		customImages,
		customTags: [
			extensionVm.title,
			extensionVm.category?.name ?? 'extensions',
			extensionVm.extensionType ?? 'extension'
		].filter(Boolean),
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = new URL(url.pathname, url.origin).href;
	const pageMetaTags = Object.freeze({
		canonical,
		openGraph: {
			title: customTitle,
			description: customDescription,
			...(extensionVm.logoImageUrl ? { images: [{ url: extensionVm.logoImageUrl }] } : {})
		},
		twitter: {
			title: customTitle,
			description: customDescription
		},
		...metaTags
	}) satisfies MetaTagsProps;

	const schemaData = {
		'@context': 'https://schema.org',
		'@graph': mergeListingSchemaIntoGraph(
			[
				{
					'@type': 'WebPage',
					'@id': `${canonical}#webpage`,
					name: extensionVm.title,
					description: customDescription,
					url: canonical,
					isPartOf: {
						'@type': 'WebSite',
						name: companyName,
						url: url.origin
					}
				}
			],
			extensionVm.schemaJson
		)
	};

	return {
		pageMetaTags,
		isLoggedIn,
		extensionVm,
		relatedExtensionsVm,
		commentsVm: commentsVm,
		schemaData
	};
}
