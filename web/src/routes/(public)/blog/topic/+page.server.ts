import type { MetaTagsProps } from 'svelte-meta-tags';

import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
import { publicBlogTopicPagePresenter } from '$lib/area-public/index';
import { createBlogTopicsIndexSEOSchema } from '$lib/blogs/utils/createBlogHubSEOSchema';
import { createMetaData } from '$lib/utils/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/utils/buildCanonicalUrl';

export const ssr = true;

export async function load({ url, fetch, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();

	const { CONFIG_SCHEMA_COMPANY, CONFIG_SCHEMA_MARKETING } = await import('$lib/config/constants/config');
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const customTitle = 'Blog Topics';
	const customDescription = 'Explore our blog topics and find posts that interest you.';
	const customSlug = `${getRootPathPublicBlog()}/topic`;

	const metaTags = await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customTags: ['blog', 'topics', 'categories'],
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

	const { topics } = await publicBlogTopicPagePresenter.loadDataForTopicsOverviewStateless({ fetch });

	const schemaData = createBlogTopicsIndexSEOSchema({
		canonicalUrl: canonical,
		origin: url.origin,
		companyName,
		name: customTitle,
		description: customDescription,
		topics
	});

	return {
		pageMetaTags,
		isLoggedIn,
		companyInformationPm,
		marketingInformationPm,
		topics,
		schemaData
	};
}
