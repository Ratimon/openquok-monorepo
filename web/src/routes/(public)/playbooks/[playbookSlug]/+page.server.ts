import type { MetaTagsProps } from 'svelte-meta-tags';

import { error, redirect } from '@sveltejs/kit';

import {
	publicExtensionBySlugPagePresenter,
	publicStackBySlugPagePresenter
} from '$lib/area-public';
import { getRootPathPublicCreatorPlaybook } from '$lib/area-public/constants/getRootPathPublicCreators';
import { getLegacyRootPathPublicPlaybook } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

/** Legacy `/playbooks/{slug}` — redirects when owner username is set; otherwise renders. */
export async function load({ url, params, cookies, fetch, parent }) {
	const playbookSlug = params.playbookSlug;
	if (typeof playbookSlug !== 'string' || !playbookSlug.trim()) {
		throw error(404, 'Playbook not found');
	}

	const stackVm = await publicStackBySlugPagePresenter.loadStackBySlugStateless({
		slug: playbookSlug,
		fetch
	});
	if (!stackVm) {
		throw error(404, 'Playbook not found');
	}

	const ownerUsername = stackVm.owner?.username?.trim();
	if (ownerUsername) {
		redirect(301, `/${getRootPathPublicCreatorPlaybook(ownerUsername, stackVm.slug)}`);
	}

	const comments = await publicExtensionBySlugPagePresenter.loadListingCommentsStateless({
		listingId: stackVm.id,
		fetch
	});

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;
	const customTitle = `${stackVm.title} | ${companyName}`;
	const customDescription = stackVm.excerpt ?? stackVm.description ?? `Playbook details for ${stackVm.title}.`;

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customSlug: getLegacyRootPathPublicPlaybook(stackVm.slug),
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
