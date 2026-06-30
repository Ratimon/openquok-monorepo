import type { MetaTagsProps } from 'svelte-meta-tags';

import { error } from '@sveltejs/kit';

import {
	publicExtensionBySlugPagePresenter,
	publicStackBySlugPagePresenter
} from '$lib/area-public';
import { getRootPathPublicStack } from '$lib/area-public/constants/getRootPathPublicStacks';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, params, cookies, fetch, parent }) {
	const stackSlug = params.stackSlug;
	if (typeof stackSlug !== 'string' || !stackSlug.trim()) {
		throw error(404, 'Stack not found');
	}

	const stackVm = await publicStackBySlugPagePresenter.loadStackBySlugStateless({
		slug: stackSlug,
		fetch
	});
	if (!stackVm) {
		throw error(404, 'Stack not found');
	}

	const comments = await publicExtensionBySlugPagePresenter.loadListingCommentsStateless({
		listingId: stackVm.id,
		fetch
	});

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;
	const customTitle = `${stackVm.title} | ${companyName}`;
	const customDescription = stackVm.excerpt ?? stackVm.description ?? `Stack details for ${stackVm.title}.`;

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customSlug: getRootPathPublicStack(stackVm.slug),
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = new URL(url.pathname, url.origin).href;
	const schemaData = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebPage',
				'@id': `${canonical}#webpage`,
				name: stackVm.title,
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
		pageMetaTags: metaTags,
		isLoggedIn: !!cookies.get('access_token'),
		stackVm,
		commentsVm: comments,
		schemaData
	};
}
