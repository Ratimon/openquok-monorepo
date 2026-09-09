import type { MetaTagsProps } from 'svelte-meta-tags';

import { CONFIG_SCHEMA_BLOG } from '$lib/blogs/constants/config';
import { blogPublicTopicIdParamSchema } from '$lib/blogs/blog.types';
import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
import { blogRepository } from '$lib/blogs/index';
import {
	publicBlogPagePresenter,
	publicBlogTopicPagePresenter
} from '$lib/area-public/index';
import { createBlogIndexSEOSchema, parseBlogPublicListPagination } from '$lib/blogs/utils';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';

export const ssr = true;

export async function load({ url, fetch, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();

	const { CONFIG_SCHEMA_COMPANY, CONFIG_SCHEMA_MARKETING } = await import('$lib/config/constants/config');
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const rootBlog = getRootPathPublicBlog();
	const blogInformationPm = await blogRepository.getBlogInformation(fetch);
	const heroTitle = blogInformationPm?.BLOG_POST_SEO_META_TITLE ?? CONFIG_SCHEMA_BLOG.BLOG_POST_SEO_META_TITLE.default;
	const heroDescription =
		blogInformationPm?.BLOG_POST_SEO_META_DESCRIPTION ?? CONFIG_SCHEMA_BLOG.BLOG_POST_SEO_META_DESCRIPTION.default;
	const customTags =
		blogInformationPm?.BLOG_POST_SEO_META_TAGS?.split(',').map((t) => t.trim()).filter(Boolean) ?? undefined;

	const metaTags = await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${heroTitle} | ${companyName}`,
		customDescription: heroDescription,
		customTags,
		customSlug: rootBlog,
		requestUrl: url
	}) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(url);
	const pageMetaTags = withCanonicalMetaTags(metaTags, canonical, {
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default)
		}
	});

	const { page, itemsPerPage } = parseBlogPublicListPagination(url.searchParams);

	const topicRaw = url.searchParams.get('topic');
	let topicId: string | null = null;
	if (topicRaw && topicRaw !== 'all') {
		const parsed = blogPublicTopicIdParamSchema.safeParse(topicRaw);
		topicId = parsed.success ? parsed.data : null;
	}

	const authorRaw = url.searchParams.get('author');
	let authorId: string | null = null;
	if (authorRaw?.trim()) {
		const parsed = blogPublicTopicIdParamSchema.safeParse(authorRaw.trim());
		authorId = parsed.success ? parsed.data : null;
	}

	const [overview, topicsOverview] = await Promise.all([
		publicBlogPagePresenter.loadDataForOverviewBlogStateless({
			fetch,
			page,
			itemsPerPage,
			topicId,
			authorId
		}),
		publicBlogTopicPagePresenter.loadDataForTopicsOverviewStateless({ fetch })
	]);

	const { topics: _topicsForNavRemoved, ...overviewRest } = overview;

	const schemaData = createBlogIndexSEOSchema({
		canonicalUrl: canonical,
		origin: url.origin,
		companyName,
		name: heroTitle,
		description: heroDescription,
		posts: overviewRest.posts
	});

	return {
		pageMetaTags,
		isLoggedIn,
		companyInformationPm,
		marketingInformationPm,
		heroTitle,
		heroDescription,
		...overviewRest,
		topicsNav: topicsOverview.topics,
		schemaData
	};
}
