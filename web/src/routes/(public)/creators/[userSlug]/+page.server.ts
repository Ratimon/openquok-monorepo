import type { MetaTagsProps } from 'svelte-meta-tags';

import { error } from '@sveltejs/kit';

import { publicCreatorByUsernamePagePresenter } from '$lib/area-public';
import { getRootPathPublicCreator } from '$lib/area-public/constants/getRootPathPublicCreators';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, params, cookies, fetch, parent }) {
	const userSlug = typeof params.userSlug === 'string' ? params.userSlug.trim() : '';
	if (!userSlug) {
		throw error(404, 'Creator not found');
	}

	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const { creator, buildingBlocks, playbooks } =
		await publicCreatorByUsernamePagePresenter.loadCreatorByUsernameStateless({
			username: decodeURIComponent(userSlug),
			fetch
		});

	if (!creator) {
		throw error(404, 'Creator not found');
	}

	const displayName = creator.fullName || creator.username || 'Anonymous';
	const customDescription =
		creator.tagLine?.trim() ||
		`Building blocks and playbooks published by ${displayName} on OpenQuok.`;

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${displayName} | ${companyName}`,
		customDescription,
		customTags: [displayName],
		customSlug: getRootPathPublicCreator(creator.username ?? userSlug),
		requestUrl: url
	})) satisfies MetaTagsProps;

	return {
		pageMetaTags: metaTags,
		isLoggedIn,
		userSlug,
		creator,
		buildingBlocks,
		playbooks,
		displayName
	};
}
