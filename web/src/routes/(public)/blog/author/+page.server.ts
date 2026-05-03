import type { MetaTagsProps } from 'svelte-meta-tags';

import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
import { publicBlogAuthorPagePresenter, publicInformationRepository } from '$lib/area-public/index';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, fetch, cookies }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformation: companyInformationPm, marketingInformation: marketingInformationPm } =
		await publicInformationRepository.getAllInformationCombined(fetch);

	const { CONFIG_SCHEMA_COMPANY, CONFIG_SCHEMA_MARKETING } = await import('$lib/config/constants/config');
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const customTitle = 'Blog Authors';
	const customDescription = 'Meet our talented blog authors.';
	const customSlug = `${getRootPathPublicBlog()}/author`;

	const metaTags = await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customTags: ['blog', 'authors'],
		customSlug,
		requestUrl: url
	}) satisfies MetaTagsProps;

	const pageMetaTags = Object.freeze({
		canonical: new URL(url.pathname, url.origin).href,
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default),
		},
		...metaTags
	}) satisfies MetaTagsProps;

	const { authors } = await publicBlogAuthorPagePresenter.loadDataForAuthorsOverviewStateless({ fetch });

	return {
		pageMetaTags,
		isLoggedIn,
		companyInformationPm,
		marketingInformationPm,
		authors
	};
}
