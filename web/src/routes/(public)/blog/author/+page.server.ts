import type { MetaTagsProps } from 'svelte-meta-tags';

import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
import { publicBlogAuthorPagePresenter } from '$lib/area-public/index';
import { createBlogAuthorsIndexSEOSchema } from '$lib/blogs/utils/createBlogHubSEOSchema';
import { createMetaData } from '$lib/utils/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/utils/buildCanonicalUrl';

export const ssr = true;

export async function load({ url, fetch, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();

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

	const canonical = buildCanonicalUrl(url);
	const pageMetaTags = withCanonicalMetaTags(metaTags, canonical, {
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default)
		}
	});

	const { authors } = await publicBlogAuthorPagePresenter.loadDataForAuthorsOverviewStateless({ fetch });

	const schemaData = createBlogAuthorsIndexSEOSchema({
		canonicalUrl: canonical,
		origin: url.origin,
		companyName,
		name: customTitle,
		description: customDescription,
		authors
	});

	return {
		pageMetaTags,
		isLoggedIn,
		companyInformationPm,
		marketingInformationPm,
		authors,
		schemaData
	};
}
