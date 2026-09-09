import type { MetaTagsProps } from 'svelte-meta-tags';

import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
import { publicBlogTopicBySlugPagePresenter } from '$lib/area-public/index';
import { createBlogTopicSEOSchema, parseBlogPublicListPagination } from '$lib/blogs/utils';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';

export const ssr = true;

export async function load({ url, params, fetch, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const topicSlug = typeof params.slug === 'string' ? params.slug : '';

	const { companyInformationPm, marketingInformationPm } = await parent();

	const { CONFIG_SCHEMA_COMPANY, CONFIG_SCHEMA_MARKETING } = await import('$lib/config/constants/config');
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const { page, itemsPerPage } = parseBlogPublicListPagination(url.searchParams);

	const { topic, posts, count, topicsNav, page: listPage, itemsPerPage: ipp } =
		await publicBlogTopicBySlugPagePresenter.loadDataForTopicBySlugStateless({
			fetch,
			topicSlug,
			page,
			itemsPerPage
		});

	let metaTags: MetaTagsProps;
	if (!topic) {
		metaTags = await createMetaData({
			companyInformation: companyInformationPm,
			marketingInformation: marketingInformationPm,
			customTitle: `Topic Not Found | ${companyName}`,
			customDescription: 'The requested blog topic could not be found.',
			customSlug: `${getRootPathPublicBlog()}/topic/${topicSlug}`,
			requestUrl: url
		});
	} else {
		const customDescription =
			topic.description?.trim() || `Blog posts about ${topic.name}`;
		metaTags = await createMetaData({
			companyInformation: companyInformationPm,
			marketingInformation: marketingInformationPm,
			customTitle: `${topic.name} | ${companyName}`,
			customDescription,
			customTags: [topic.name],
			customSlug: `${getRootPathPublicBlog()}/topic/${topicSlug}`,
			requestUrl: url
		});
	}

	const canonical = buildCanonicalUrl(url);
	const pageMetaTags = withCanonicalMetaTags(metaTags, canonical, {
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default)
		}
	});

	const schemaData =
		topic != null
			? createBlogTopicSEOSchema({
					canonicalUrl: canonical,
					origin: url.origin,
					companyName,
					topic,
					posts
				})
			: undefined;

	return {
		pageMetaTags,
		isLoggedIn,
		companyInformationPm,
		marketingInformationPm,
		topicSlug,
		topic,
		posts,
		count,
		topicsNav,
		page: listPage,
		itemsPerPage: ipp,
		schemaData
	};
}
