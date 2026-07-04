import type { MetaTagsProps } from 'svelte-meta-tags';

import { error, redirect } from '@sveltejs/kit';

import { publicExtensionBySlugPagePresenter } from '$lib/area-public';
import { getRootPathPublicCreatorBuildingBlock } from '$lib/area-public/constants/getRootPathPublicCreators';
import { getLegacyRootPathPublicBuildingBlock } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { mergeListingSchemaIntoGraph } from '$lib/listings/index';
import { createMetaData, type MetaDataImage } from '$lib/utils/createMetaData';

export const ssr = true;

/** Legacy `/building-blocks/{slug}` — redirects when owner username is set; otherwise renders. */
export async function load({ url, params, cookies, fetch, parent }) {
	const listingSlug = params.listingSlug;

	if (typeof listingSlug !== 'string' || listingSlug.trim().length === 0) {
		throw error(404, 'Building block not found');
	}

	const { extensionVm, relatedExtensionsVm } =
		await publicExtensionBySlugPagePresenter.loadExtensionBySlugStateless({
			slug: listingSlug,
			fetch,
			relatedLimit: 4
		});

	if (!extensionVm) {
		throw error(404, 'Building block not found');
	}

	const ownerUsername = extensionVm.owner?.username?.trim();
	if (ownerUsername) {
		redirect(301, `/${getRootPathPublicCreatorBuildingBlock(ownerUsername, extensionVm.slug)}`);
	}

	const commentsVm = await publicExtensionBySlugPagePresenter.loadListingCommentsStateless({
		listingId: extensionVm.id,
		fetch
	});

	const isLoggedIn = !!cookies.get('access_token');
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

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customSlug: getLegacyRootPathPublicBuildingBlock(extensionVm.slug),
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
		commentsVm,
		schemaData
	};
}
